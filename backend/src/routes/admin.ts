import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middleware/authenticate.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";
import { orderService } from "../services/orderService.js";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  // All admin routes require authentication and admin role
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authenticateAdmin);

  // --- STATS ---
  app.get("/stats", async (request, reply) => {
    // 1. Total revenue (sum of fulfilled/paid orders)
    const paidOrders = await prisma.order.aggregate({
      _sum: { totalCents: true },
      where: {
        paymentStatus: "approved",
      },
    });
    const totalRevenue = (paidOrders._sum.totalCents || 0) / 100;

    // 2. Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      processing: 0,
      fulfilled: 0,
      cancelled: 0,
    };

    for (const group of ordersByStatus) {
      statusCounts[group.status] = group._count;
    }

    // 3. Low stock alerts (products with variants < 10)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lt: 10 } },
      include: { product: true },
      take: 10,
    });

    // 4. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return sendSuccess(reply, {
      totalRevenue,
      statusCounts,
      lowStockAlerts: lowStockVariants.map((v) => ({
        id: v.id,
        productName: v.product.name,
        size: v.size,
        color: v.colorName,
        stock: v.stock,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        reference: o.reference,
        total: o.totalCents / 100,
        status: o.status,
        paymentStatus: o.paymentStatus,
        shippingStatus: "pending", // we don't have shipping status in prisma yet, so we mock it
        createdAt: o.createdAt,
        customerName: o.user?.name || "Guest",
      })),
    });
  });

  // --- ORDERS ---
  app.get("/orders", async (request, reply) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true, shipments: true },
    });
    return sendSuccess(reply, orders);
  });

  app.patch("/orders/:id/status", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, paymentStatus, trackingNumber, carrier } = request.body as { status?: string; paymentStatus?: string; trackingNumber?: string; carrier?: string };

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
      });

      let finalTrackingNumber = trackingNumber;
      let finalCarrier = carrier;

      if (trackingNumber !== undefined || carrier !== undefined) {
        let shipment = await prisma.shipment.findFirst({ where: { orderId: id } });
        if (shipment) {
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: { 
              ...(trackingNumber !== undefined && { trackingNumber }),
              ...(carrier !== undefined && { carrier })
            }
          });
          if (trackingNumber === undefined) finalTrackingNumber = shipment.trackingNumber || undefined;
          if (carrier === undefined) finalCarrier = shipment.carrier || undefined;
        } else {
          await prisma.shipment.create({
            data: {
              orderId: id,
              trackingNumber: trackingNumber || null,
              carrier: carrier || null
            }
          });
        }
      }

      if (status === "fulfilled" || status === "delivered") {
        orderService.sendDeliveredNotification(id).catch(() => {});
      } else if (status === "shipped" || trackingNumber) {
        orderService.sendShippingNotification(id, finalTrackingNumber, finalCarrier).catch(() => {});
      }

      return sendSuccess(reply, updatedOrder);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al actualizar la orden" });
    }
  });

  // --- PRODUCTS ---
  app.get("/products", async (request, reply) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    const formattedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      const sizes = Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean)));
      const colors = Array.from(new Set(p.variants.map((v) => v.colorName).filter(Boolean)));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.basePriceCents / 100,
        originalPrice: p.compareAtPriceCents ? p.compareAtPriceCents / 100 : undefined,
        category: p.category.name,
        categoryId: p.categoryId,
        description: p.description,
        material: p.material,
        controlLevel: p.controlLevel,
        uses: p.uses,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        sizes,
        colors,
        stock: totalStock,
        isOutOfStock: totalStock === 0,
        image: p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || "",
        images: p.images.map(img => ({ url: img.url, isPrimary: img.isPrimary })),
        status: p.status,
      };
    });

    return sendSuccess(reply, formattedProducts);
  });

const parsePriceInput = (raw: any): number => {
  if (raw === null || raw === undefined) return 0;
  let str = String(raw).trim().replace(/[^0-9.,]/g, "");
  if ((str.match(/\./g) || []).length > 1) {
    str = str.replace(/\./g, "");
  } else if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  }
  const val = Number(str);
  if (isNaN(val) || val <= 0) return 0;
  return Math.min(val, 50000000);
};

  app.post("/products", async (request, reply) => {
    try {
      const data = request.body as any;

      if (!data.name) {
        return reply.status(400).send({ ok: false, error: "El campo 'name' es requerido." });
      }

      // Get or create category
      let categoryId = data.categoryId;
      if (!categoryId) {
        const cat = await prisma.category.findFirst();
        if (!cat) {
          return reply.status(400).send({ ok: false, error: "No hay categorías en la base de datos. Crea una categoría primero." });
        }
        categoryId = cat.id;
      }

      const pricePesos = parsePriceInput(data.price);
      const priceCents = Math.round(pricePesos * 100);

      // Only persist real URLs — reject base64 data: URIs (too large for VARCHAR)
      const validImages = Array.isArray(data.images) 
        ? data.images.filter((img: any) => typeof img === "string" && !img.startsWith("data:"))
        : (data.image && typeof data.image === "string" && !data.image.startsWith("data:") ? [data.image] : []);

      const newProduct = await prisma.product.create({
        data: {
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: data.name,
          basePriceCents: priceCents,
          compareAtPriceCents: data.originalPrice ? Math.round(parsePriceInput(data.originalPrice) * 100) : null,
          description: data.description || "",
          material: data.material || null,
          controlLevel: data.controlLevel || null,
          uses: data.uses || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          categoryId,
          status: data.status || "draft",
          tag: data.tag || null,
          variants: {
            create: (data.sizes && data.sizes.length > 0 ? data.sizes : ["U"]).flatMap((s: string) => 
              (data.colors && data.colors.length > 0 ? data.colors : ["Base"]).map((c: string) => ({
                sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}-${s}-${c}`,
                stock: data.isOutOfStock ? 0 : (data.stock ?? 10),
                priceCents: priceCents,
                size: s,
                colorName: c,
              }))
            )
          },
          images: validImages.length > 0 ? {
            create: validImages.map((url: string, index: number) => ({ url, isPrimary: index === 0 }))
          } : undefined
        }
      });
      return sendSuccess(reply, newProduct, 201);
    } catch (err: any) {
      request.log.error(err);
      const message = err?.meta?.cause || err?.message || "Error interno al crear el producto.";
      return reply.status(500).send({ ok: false, error: message });
    }
  });

  app.put("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    // Only persist real URLs — reject base64 data: URIs
    const validImages = Array.isArray(data.images) 
      ? data.images.filter((img: any) => typeof img === "string" && !img.startsWith("data:"))
      : (data.image && typeof data.image === "string" && !data.image.startsWith("data:") ? [data.image] : []);

    try {
      const pricePesos = parsePriceInput(data.price);
      const priceCents = Math.round(pricePesos * 100);

      const updated = await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          basePriceCents: priceCents > 0 ? priceCents : undefined,
          compareAtPriceCents: data.originalPrice ? Math.round(parsePriceInput(data.originalPrice) * 100) : null,
          description: data.description,
          material: data.material,
          controlLevel: data.controlLevel,
          uses: data.uses,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          status: data.status,
          tag: data.tag || null,
        }
      });

      // Synchronize all product variants priceCents to match product basePriceCents
      if (priceCents > 0) {
        await prisma.productVariant.updateMany({
          where: { productId: id },
          data: { priceCents: priceCents }
        });
      }

      // Update images
      if (validImages.length > 0) {
        // Simple approach: delete existing and recreate
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.createMany({
          data: validImages.map((url: string, index: number) => ({
            productId: id,
            url,
            isPrimary: index === 0
          }))
        });
      } else if (data.images && data.images.length === 0) {
        // User explicitly removed all images
        await prisma.productImage.deleteMany({ where: { productId: id } });
      }

      if (data.isOutOfStock !== undefined) {
        await prisma.productVariant.updateMany({
          where: { productId: id },
          data: { stock: data.isOutOfStock ? 0 : (data.stock ?? 10) }
        });
      }

      // Synchronize variants (create missing ones)
      if (Array.isArray(data.sizes) && Array.isArray(data.colors) && data.sizes.length > 0 && data.colors.length > 0) {
        const currentVariants = await prisma.productVariant.findMany({ where: { productId: id } });
        for (const s of data.sizes) {
          for (const c of data.colors) {
            const exists = currentVariants.find((v: any) => v.size === s && v.colorName === c);
            if (!exists) {
              await prisma.productVariant.create({
                data: {
                  productId: id,
                  size: s,
                  colorName: c,
                  sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}-${s}-${c}`,
                  stock: data.isOutOfStock ? 0 : (data.stock ?? 10),
                  priceCents: priceCents > 0 ? priceCents : (currentVariants[0]?.priceCents ?? 0)
                }
              });
            }
          }
        }
      }

      return sendSuccess(reply, updated);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ ok: false, error: err?.message || "Error al actualizar el producto." });
    }
  });

  app.patch("/products/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    try {
      const updated = await prisma.product.update({
        where: { id },
        data: { status: status as any },
      });
      return sendSuccess(reply, updated);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al cambiar el estado." });
    }
  });

  app.delete("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const updated = await prisma.product.update({
        where: { id },
        data: { status: "archived" }
      });
      return sendSuccess(reply, updated);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al archivar el producto." });
    }
  });

  // --- COUPONS ---
  app.get("/coupons", async (request, reply) => {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(reply, coupons);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al obtener cupones" });
    }
  });

  const createCouponSchema = z.object({
    code: z.string().min(3),
    type: z.enum(["percentage", "fixed", "free_shipping"]),
    value: z.number().optional(),
    minOrderCents: z.number().optional(),
    status: z.enum(["active", "inactive", "expired"]).default("active")
  });

  app.post("/coupons", async (request, reply) => {
    try {
      const data = createCouponSchema.parse(request.body);
      
      const exists = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() }
      });

      if (exists) {
        return reply.status(400).send({ ok: false, error: "El código del cupón ya existe." });
      }

      const newCoupon = await prisma.coupon.create({
        data: {
          ...data,
          code: data.code.toUpperCase()
        }
      });
      return sendSuccess(reply, newCoupon, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al crear cupón" });
    }
  });

  const updateCouponSchema = z.object({
    status: z.enum(["active", "inactive", "expired"]).optional(),
  });

  app.patch("/coupons/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const data = updateCouponSchema.parse(request.body);
      const updated = await prisma.coupon.update({
        where: { id },
        data,
      });
      return sendSuccess(reply, updated);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al actualizar cupón" });
    }
  });

  app.delete("/coupons/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.coupon.delete({
        where: { id }
      });
      return sendSuccess(reply, { deleted: true });
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al eliminar cupón" });
    }
  });

  // --- PQRs ---
  app.get("/pqr", async (request, reply) => {
    try {
      const { status } = request.query as { status?: string };
      const where = status && status !== "all" ? { status: status as any } : {};

      const tickets = await prisma.pqrTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          messages: true
        }
      });
      return sendSuccess(reply, tickets);
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: err?.message || "Error al obtener PQRs" });
    }
  });

  const updatePqrSchema = z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    replyMessage: z.string().optional()
  });

  app.patch("/pqr/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const data = updatePqrSchema.parse(request.body);
      
      const updateData: any = {};
      if (data.status) updateData.status = data.status;
      if (data.priority) updateData.priority = data.priority;

      const ticket = await prisma.pqrTicket.findUnique({ where: { id } });
      if (!ticket) return reply.status(404).send({ ok: false, error: "Ticket not found" });

      const updated = await prisma.pqrTicket.update({
        where: { id },
        data: updateData
      });

      if (data.replyMessage) {
        // Record the admin's reply message
        await prisma.pqrMessage.create({
          data: {
            ticketId: id,
            senderType: "agent",
            senderUserId: (request.user as any)?.id,
            message: data.replyMessage
          }
        });
      }

      return sendSuccess(reply, updated);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al actualizar PQR." });
    }
  });

  // ==========================================
  // Testimonials
  // ==========================================

  const createAdminTestimonialSchema = z.object({
    name: z.string().min(2),
    rating: z.number().min(1).max(5),
    content: z.string().min(1),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    source: z.enum(["store", "google"]).optional()
  });

  app.get("/testimonials", async (request, reply) => {
    try {
      const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(reply, testimonials);
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al obtener testimonios." });
    }
  });

  app.post("/testimonials", async (request, reply) => {
    try {
      const data = createAdminTestimonialSchema.parse(request.body);
      const testimonial = await prisma.testimonial.create({
        data: {
          name: data.name,
          rating: data.rating,
          content: data.content,
          status: data.status || "approved", // Admin creations default to approved
          source: data.source || "store"
        }
      });
      return sendSuccess(reply, testimonial, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al crear testimonio." });
    }
  });

  app.patch("/testimonials/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const data = z.object({
        status: z.enum(["pending", "approved", "rejected"])
      }).parse(request.body);
      
      const updated = await prisma.testimonial.update({
        where: { id },
        data: { status: data.status }
      });
      return sendSuccess(reply, updated);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al actualizar testimonio." });
    }
  });

  app.delete("/testimonials/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.testimonial.delete({ where: { id } });
      return sendSuccess(reply, { deleted: true });
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al eliminar testimonio." });
    }
  });

  // ==========================================
  // Newsletter Subscribers
  // ==========================================

  app.get("/subscribers", async (request, reply) => {
    try {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(reply, subscribers);
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al obtener suscriptores." });
    }
  });

  app.delete("/subscribers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.newsletterSubscriber.delete({ where: { id } });
      return sendSuccess(reply, { deleted: true });
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al eliminar suscriptor." });
    }
  });

  // ==========================================
  // Campaigns
  // ==========================================

  app.get("/campaigns", async (request, reply) => {
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: "desc" }
      });
      return sendSuccess(reply, campaigns);
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al obtener campañas." });
    }
  });

  app.post("/campaigns", async (request, reply) => {
    try {
      const data = z.object({
        subject: z.string().min(1),
        content: z.string().min(1)
      }).parse(request.body);

      // Get all active subscribers
      const activeSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "active" }
      });

      if (activeSubscribers.length > 0) {
        const { sendMarketingEmail } = await import("../services/emailService.js");
        const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
        const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";
        
        let title = data.subject;
        let messageContent = data.content;
        let attachedProductHtml = "";
        let attachedCouponHtml = "";

        try {
          if (data.content.trim().startsWith("{")) {
            const parsed = JSON.parse(data.content);
            if (parsed.title) title = parsed.title;
            if (parsed.content) messageContent = parsed.content;

            if (parsed.attachedProductSlugs && Array.isArray(parsed.attachedProductSlugs) && parsed.attachedProductSlugs.length > 0) {
              const prods = await prisma.product.findMany({
                where: { slug: { in: parsed.attachedProductSlugs } },
                include: { images: true }
              });
              
              if (prods.length > 0) {
                const prodsHtml = prods.map(prod => {
                  const primaryImg = prod.images.find(img => img.isPrimary) || prod.images[0];
                  const assetBaseUrl = "https://www.fajasab.com";
                  let imgUrl = primaryImg?.url || "";
                  if (imgUrl.startsWith("@/assets/")) {
                    imgUrl = imgUrl.replace("@/assets/", "/assets/");
                  }
                  if (!imgUrl || imgUrl.includes("placeholder")) {
                    imgUrl = `${assetBaseUrl}/assets/hero-luxe-1.jpg`;
                  } else if (!imgUrl.startsWith("http")) {
                    imgUrl = `${assetBaseUrl}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
                  }
                  imgUrl = encodeURI(imgUrl);
                  const priceFormatted = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format((prod.basePriceCents || 0) / 100);

                  return `
                    <div style="margin-bottom: 20px; border: 1px solid #EAE6DF; background-color: #FFFFFF; padding: 24px; text-align: center;">
                      ${imgUrl ? `<img src="${imgUrl}" alt="${prod.name}" style="max-width: 220px; width: 100%; height: auto; margin: 0 auto 16px auto; display: block; border: 1px solid #EEEEEE;" />` : ""}
                      <span style="font-size: 9px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; color: #C4A46A; display: block; margin-bottom: 6px;">PRODUCTO DESTACADO</span>
                      <h3 style="font-family: 'Jost', sans-serif; font-size: 19px; font-weight: 600; color: #1C1A17; margin: 0 0 6px 0;">${prod.name}</h3>
                      <p style="font-size: 16px; font-weight: 700; color: #1C1A17; margin: 0 0 18px 0;">${priceFormatted}</p>
                      <a href="${frontendUrl}/product/${prod.slug}" class="btn" style="display: inline-block; padding: 13px 30px; background-color: #1C1A17; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; border: 1px solid #1C1A17;">Ver Producto</a>
                    </div>
                  `;
                }).join("");
                
                attachedProductHtml = `
                  <div style="margin-top: 24px;">
                    ${prodsHtml}
                  </div>
                `;
              }
            }

            if (parsed.attachedCouponCode) {
              const coupon = await prisma.coupon.findUnique({ where: { code: parsed.attachedCouponCode } });
              if (coupon) {
                const discountText = coupon.type === "percentage" ? `${coupon.value}% DE DESCUENTO` : `$${((coupon.value || 0) / 100).toLocaleString("es-CO")} DE DESCUENTO`;
                attachedCouponHtml = `
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; border: 1px solid #C4A46A; margin-top: 24px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <span style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #777777; font-weight: 600; display: block; margin-bottom: 6px;">BENEFICIO EXCLUSIVO</span>
                        <div style="font-size: 22px; font-weight: 700; color: #1C1A17; letter-spacing: 0.25em; font-family: monospace; background: #FFFFFF; border: 1px solid #C4A46A; padding: 8px 20px; display: inline-block; margin-bottom: 10px;">${coupon.code}</div>
                        <p style="font-size: 13px; color: #333333; margin: 0;">Obtén un <strong>${discountText}</strong> en tu próxima compra.</p>
                      </td>
                    </tr>
                  </table>
                `;
              }
            }
          }
        } catch (e) {
          // Keep raw text if not JSON
        }

        const campaignHtmlBody = `
          <h2 style="font-family: 'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 600; color: #1C1A17; margin-top: 0; margin-bottom: 16px; letter-spacing: 0.02em;">${title}</h2>
          <div class="text" style="white-space: pre-wrap; font-size: 15px; color: #333333; line-height: 1.7;">${messageContent}</div>
          ${attachedProductHtml}
          ${attachedCouponHtml}
          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #EEEEEE;">
            <a href="${frontendUrl}/shop" class="btn" style="display: inline-block; padding: 14px 32px; background-color: #1C1A17; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; border: 1px solid #1C1A17;">Descubrir la Colección</a>
          </div>
        `;

        for (const sub of activeSubscribers) {
          try {
            await sendMarketingEmail({
              to: sub.email,
              subject: data.subject,
              html: getBaseEmailTemplate(data.subject, campaignHtmlBody)
            });
          } catch (e) {
            app.log.error(e, `Error sending campaign email to ${sub.email}`);
          }
        }
      }

      return sendSuccess(reply, { ok: true, recipientCount: activeSubscribers.length }, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al crear campaña." });
    }
  });

  app.delete("/campaigns/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.campaign.delete({ where: { id } });
      return sendSuccess(reply, { deleted: true });
    } catch (err) {
      return reply.status(500).send({ ok: false, error: "Error al eliminar campaña." });
    }
  });
};
