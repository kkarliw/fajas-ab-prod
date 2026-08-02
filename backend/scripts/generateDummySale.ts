import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const reference = `ORD-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;
  
  // Find a product variant to add to the order
  const variant = await prisma.productVariant.findFirst({
    include: { product: true }
  });

  if (!variant) {
    console.error("No product variants found in the database. Cannot create order.");
    return;
  }

  console.log(`Creando pedido de prueba: ${reference}...`);

  const order = await prisma.order.create({
    data: {
      reference,
      email: "prueba@fajasab.com",
      customerName: "Cliente de Prueba",
      phone: "3001234567",
      status: "fulfilled", // OrderStatus is fulfilled, Shipment is shipped
      paymentStatus: "approved",
      subtotalCents: variant.priceCents || 100000,
      totalCents: variant.priceCents || 100000,
      shippingCents: 0,
      discountCents: 0,
      shippingAddressJson: {
        addressLine1: "Calle Falsa 123",
        city: "Bogotá",
        department: "Bogotá D.C."
      },
      items: {
        create: [
          {
            productId: variant.productId,
            variantId: variant.id,
            skuSnapshot: variant.sku,
            nameSnapshot: variant.product.name,
            sizeSnapshot: variant.size || "M",
            colorSnapshot: variant.colorName || "Beige",
            quantity: 1,
            unitPriceCents: variant.priceCents || 100000,
            totalCents: variant.priceCents || 100000
          }
        ]
      },
      shipments: {
        create: [
          {
            carrier: "Servientrega",
            trackingNumber: `GUIA-${Math.floor(Math.random() * 10000000)}`,
            status: "shipped"
          }
        ]
      }
    },
    include: {
      shipments: true
    }
  });

  console.log("\n=============================================");
  console.log("¡PEDIDO DE PRUEBA CREADO EXITOSAMENTE!");
  console.log("=============================================");
  console.log(`Número de Orden : ${order.reference}`);
  console.log(`Correo          : ${order.email}`);
  console.log(`Estado          : Enviado (shipped)`);
  console.log(`Guía            : ${order.shipments[0]?.trackingNumber}`);
  console.log(`Transportadora  : ${order.shipments[0]?.carrier}`);
  console.log("=============================================");
  console.log("👉 Ve a /track y pruébalo con estos datos.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
