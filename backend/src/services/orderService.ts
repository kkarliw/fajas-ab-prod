import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const orderService = {
  async createOrderFromCart(cartId: string, email: string, phone: string, customerName: string, shippingAddress: any, billingAddress?: any, couponCode?: string) {
    // 1. Get cart
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true, variant: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // 2. Validate stock and calculate totals
    let subtotalCents = 0;
    const orderItemsData: any[] = [];

    for (const item of cart.items) {
      if (!item.variant) continue;
      
      const availableStock = item.variant.stock - item.variant.reservedStock;
      if (availableStock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name} (Size: ${item.variant.size})`);
      }

      let price = item.variant.priceCents || item.product.basePriceCents;
      
      // SAFEGUARD: If the variant has the corrupted 2147483647 value, fall back to base price
      if (price > 1000000000) { // Over 10 million COP
        price = item.product.basePriceCents;
      }
      if (price > 1000000000) { // If basePrice is ALSO corrupted, fallback to 0 to prevent huge charges
        price = 0;
      }

      const total = price * item.quantity;
      subtotalCents += total;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        skuSnapshot: item.variant.sku,
        nameSnapshot: item.product.name,
        sizeSnapshot: item.variant.size,
        colorSnapshot: item.variant.colorName,
        unitPriceCents: price,
        quantity: item.quantity,
        totalCents: total,
      });
    }

    // 2.1 Calculate Shipping (Ignore frontend)
    let shippingCents = 1500000; // Default $15,000 COP
    const settingsRaw = await prisma.contentBlock.findFirst({ where: { key: "store_settings" } });
    if (settingsRaw && settingsRaw.payloadJson) {
      const settings = settingsRaw.payloadJson as any;
      if (settings.freeShippingThreshold !== undefined && (subtotalCents / 100) >= settings.freeShippingThreshold) {
        shippingCents = 0;
      } else {
        shippingCents = (settings.standardShippingFee || 15000) * 100;
      }
    }

    // 2.2 Calculate Coupon Discount (Ignore frontend)
    let discountCents = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.status === 'active' && coupon.value) {
        if (coupon.type === 'percentage') {
          discountCents = Math.floor((subtotalCents * coupon.value) / 100);
        } else {
          discountCents = coupon.value * 100;
        }
      }
    }

    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);
    const reference = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // 3. Create order, reserve stock, and delete cart in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Reserve stock
      for (const item of cart.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { increment: item.quantity } }
        });
      }

      let effectiveUserId = cart.userId;
      if (!effectiveUserId && email) {
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) effectiveUserId = existingUser.id;
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          reference,
          userId: effectiveUserId,
          email,
          phone,
          customerName,
          status: 'pending',
          paymentStatus: 'pending',
          subtotalCents,
          shippingCents,
          totalCents,
          shippingAddressJson: shippingAddress,
          billingAddressJson: billingAddress || shippingAddress,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      return newOrder;
    });

    return order;
  },

  async getOrders(userId?: string, userEmail?: string) {
    if (!userId && !userEmail) return [];
    return await prisma.order.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true, shipments: true }
    });
  },

  async getOrderByIdOrReference(idOrRef: string, userId?: string) {
    const isReference = idOrRef.startsWith('ORD-');
    const order = await prisma.order.findFirst({
      where: isReference ? { reference: idOrRef } : { id: idOrRef },
      include: { items: { include: { product: { include: { images: true } } } }, payments: true, shipments: true }
    });
    
    if (!order) return null;
    if (userId && order.userId !== userId) return null;
    
    return order;
  },

  async handlePaymentSuccess(reference: string, transactionId: string, amount: number) {
    let wasAlreadyProcessed = false;
    let paymentMismatch = false;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { reference },
        include: { items: true }
      });

      if (!order) {
        wasAlreadyProcessed = true; // prevent email
        return;
      }
      if (order.paymentStatus === 'approved') {
        wasAlreadyProcessed = true;
        return; // Already processed
      }

      // VERY IMPORTANT SECURITY FIX: Validate amount matches order total
      if (amount !== order.totalCents) {
        paymentMismatch = true;
        console.error(`PAYMENT MISMATCH: Order ${reference} expected ${order.totalCents} cents but received ${amount} cents from Wompi.`);
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'declined' }
        });
        
        await tx.payment.create({
          data: {
            orderId: order.id,
            providerTransactionId: transactionId,
            reference,
            status: 'declined',
            amountCents: amount,
            provider: 'wompi'
          }
        });
        return; // Do NOT approve order or deduct stock
      }

      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'approved', status: 'processing' }
      });

      // Confirm stock deduction
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity }
          }
        });
      }

      // Record payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          providerTransactionId: transactionId,
          reference,
          status: 'approved',
          amountCents: amount,
          provider: 'wompi'
        }
      });
    });

    if (wasAlreadyProcessed || paymentMismatch) {
      return; // Do not send confirmation email again or on mismatch
    }

    // Send confirmation email OUTSIDE the transaction so it doesn't block or rollback if it fails
    try {
      const order = await prisma.order.findUnique({
        where: { reference },
        include: { items: { include: { product: { include: { images: true } } } } }
      });
      // Only send email if the payment is approved. Mismatches become 'declined'.
      if (order && order.email && order.paymentStatus === 'approved') {
        const { sendTransactionalEmail } = await import("./emailService.js");
        const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
        
        const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString('es-CO')}`;
        const address = order.shippingAddressJson as any;
        const addressLine = address?.addressLine1 || address?.street || '';
        const cityLine = address?.city || '';
        const deptLine = address?.department || address?.state || '';
        const addressText = address ? [addressLine, cityLine, deptLine].filter(Boolean).join(", ") : "N/A";

        const itemsHtml = order.items.map(item => {
          const imgUrl = item.product?.images?.[0]?.url || "";
          return `
          <div class="item-row clearfix" style="display: flex; align-items: center; margin-bottom: 15px;">
            ${imgUrl ? `<img src="${imgUrl}" alt="${item.nameSnapshot}" style="width: 60px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px; border: 1px solid #E5E5E5;">` : ''}
            <div style="flex: 1;">
              <span class="item-name" style="display: block; font-weight: 600; margin-bottom: 4px;">${item.nameSnapshot}</span>
              <span class="item-meta" style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Talla: ${item.sizeSnapshot} | Color: ${item.colorSnapshot} | Cantidad: ${item.quantity}</span>
              <span class="item-price" style="display: block; font-weight: 600;">${formatPrice(item.totalCents)}</span>
            </div>
          </div>
          `;
        }).join("");

        const emailContentHtml = `
          <p class="text">Hola <strong>${order.customerName.split(' ')[0] || 'Cliente'}</strong>,</p>
          <p class="text">¡Gracias por elegir <strong>FAJAS AB</strong>! Hemos recibido tu pago y tu pedido se encuentra en preparación. A continuación te presentamos la factura y detalle de tu compra:</p>
          
          <div class="order-card">
            <p class="order-title">Factura de Pedido #${order.reference}</p>
            ${itemsHtml}
            
            <div class="totals clearfix" style="margin-top: 15px;">
              <div class="totals-row clearfix">
                <span class="totals-label">Subtotal</span>
                <span class="totals-value">${formatPrice(order.subtotalCents)}</span>
              </div>
              ${order.discountCents > 0 ? `
              <div class="totals-row clearfix" style="color: #2E7D32;">
                <span class="totals-label">Descuento</span>
                <span class="totals-value">-${formatPrice(order.discountCents)}</span>
              </div>
              ` : ''}
              <div class="totals-row clearfix">
                <span class="totals-label">Envío</span>
                <span class="totals-value">${formatPrice(order.shippingCents)}</span>
              </div>
              <div class="totals-row totals-grand clearfix">
                <span class="totals-label" style="color: #1C1A17;">Total Pagado</span>
                <span class="totals-value">${formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </div>
          
          <div class="order-card" style="margin-top: 20px;">
            <p class="order-title">Dirección de Entrega</p>
            <p class="text" style="font-size: 14px; margin-bottom: 0;"><strong>${order.customerName}</strong><br>${addressText}<br>Tel: ${order.phone || 'N/A'}</p>
          </div>
          
          <p class="text" style="text-align: center; margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL || 'https://www.fajasab.com'}/account" class="btn">Ver Estado de Mi Pedido</a>
          </p>
        `;
        const adminEmail = process.env.ADMIN_EMAIL || "amarantojimenezkari@gmail.com";
        const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

        const adminEmailContentHtml = `
          <p class="text">¡Hola Administrador!</p>
          <p class="text">Se ha confirmado un <strong>NUEVO PEDIDO PAGADO</strong> en la tienda <strong>FAJAS AB</strong>.</p>
          
          <div class="order-card">
            <p class="order-title">Resumen del Pedido #${order.reference}</p>
            <div class="item-row"><span class="item-name">Cliente:</span> <span class="item-meta">${order.customerName} (${order.email})</span></div>
            <div class="item-row"><span class="item-name">Teléfono:</span> <span class="item-meta">${order.phone || 'N/A'}</span></div>
            <div class="item-row"><span class="item-name">Monto Total:</span> <span class="item-meta"><strong>${formatPrice(order.totalCents)}</strong></span></div>
          </div>
          
          <div class="order-card" style="margin-top: 20px;">
            <p class="order-title">Productos Solicitados</p>
            ${itemsHtml}
          </div>

          <div class="order-card" style="margin-top: 20px;">
            <p class="order-title">Dirección de Despacho</p>
            <p class="text" style="font-size: 14px; margin-bottom: 0;"><strong>${order.customerName}</strong><br>${addressText}<br>Tel: ${order.phone || 'N/A'}</p>
          </div>
          
          <p class="text" style="text-align: center; margin-top: 25px;">
            <a href="${frontendUrl}/admin" class="btn">Gestionar en Panel Admin</a>
          </p>
        `;

        await Promise.all([
          // Email to Customer
          sendTransactionalEmail({
            to: order.email,
            subject: `¡Confirmación de compra! Pedido #${order.reference} - FAJAS AB`,
            html: getBaseEmailTemplate("Confirmación de Compra", emailContentHtml)
          }),
          // Email to Admin / Store Owner (fajasabcol@gmail.com)
          sendTransactionalEmail({
            to: adminEmail,
            subject: `🚨 [NUEVO PEDIDO #${order.reference}] - ${formatPrice(order.totalCents)} - FAJAS AB`,
            html: getBaseEmailTemplate("¡Nuevo Pedido Recibido!", adminEmailContentHtml)
          })
        ]);
      }
    } catch (emailErr) {
      console.error(`Failed to send confirmation email for order ${reference}:`, emailErr);
    }
  },

  async sendShippingNotification(orderId: string, trackingNumber?: string, carrier?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order || !order.email) return;

      const { sendTransactionalEmail } = await import("./emailService.js");
      const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
      const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

      const getTrackingUrl = (c?: string, num?: string) => {
        if (!num) return null;
        const norm = (c || "").toLowerCase();
        if (norm.includes("servientrega")) return `https://www.servientrega.com/wps/portal/Colombia/transaccional/rastreo-envio?id=${num}`;
        if (norm.includes("interrapidisimo") || norm.includes("inter rapidisimo")) return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${num}`;
        if (norm.includes("coordinadora")) return `https://www.coordinadora.com/portafolio-de-servicios/servicios-linea/rastrear-guias/?guia=${num}`;
        if (norm.includes("envia") || norm.includes("envía")) return `https://envia.co/rastreo?guia=${num}`;
        if (norm.includes("tcc")) return `https://tcc.com.co/rastreo-de-guias/?guia=${num}`;
        return null;
      };

      const trackingUrl = getTrackingUrl(carrier, trackingNumber);

      const trackingInfo = trackingNumber
        ? `<div style="background-color: #FAF8F5; border: 1px solid #C4A46A; padding: 20px; border-radius: 4px; margin: 24px 0; text-align: center;">
             <p style="margin: 0 0 6px 0; font-size: 10px; color: #777777; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600;">Número de Guía / Tracking</p>
             <p style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1C1A17; letter-spacing: 0.1em; font-family: monospace;">${trackingNumber}</p>
             ${carrier ? `<p style="margin: 0 0 16px 0; font-size: 13px; color: #333333;">Transportadora: <strong>${carrier}</strong></p>` : ''}
             ${trackingUrl ? `<a href="${trackingUrl}" target="_blank" class="btn" style="display: inline-block; padding: 12px 28px; background-color: #1C1A17; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em;">Rastrear Paquete en ${carrier}</a>` : ''}
           </div>`
        : '';

      const emailContentHtml = `
        <p class="text">Hola <strong>${order.customerName.split(' ')[0] || 'Cliente'}</strong>,</p>
        <p class="text">¡Buenas noticias! Tu pedido <strong>#${order.reference}</strong> en <strong>FAJAS AB</strong> ha sido despachado y está en camino hacia tu dirección de entrega.</p>
        
        ${trackingInfo}

        <p class="text" style="text-align: center; margin-top: 24px;">
          <a href="${frontendUrl}/account" style="color: #1C1A17; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">Ver Detalles en Mi Cuenta FAJAS AB</a>
        </p>
      `;

      await sendTransactionalEmail({
        to: order.email,
        subject: `¡Tu pedido #${order.reference} ha sido despachado! - FAJAS AB`,
        html: getBaseEmailTemplate("Tu Pedido está en Camino", emailContentHtml)
      });
    } catch (err) {
      console.error("Failed to send shipping email:", err);
    }
  },

  async handlePaymentFailure(reference: string, transactionId: string, amount: number) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { reference },
        include: { items: true }
      });

      if (!order || order.paymentStatus === 'approved') return;

      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'declined' }
      });

      // Release stock
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } }
        });
      }

      // Record payment failure
      await tx.payment.create({
        data: {
          orderId: order.id,
          providerTransactionId: transactionId,
          reference,
          status: 'declined',
          amountCents: amount,
          provider: 'wompi'
        }
      });
    });
  }
};
