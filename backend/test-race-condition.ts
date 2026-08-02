import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1/orders';

async function runTest() {
  console.log("--- INICIANDO TEST DE CONCURRENCIA (RACE CONDITION) ---");

  // 1. Setup Data
  console.log("1. Preparando datos de prueba en BD...");
  const category = await prisma.category.findFirst() || await prisma.category.create({
    data: { name: 'Test Category', slug: 'test-category-' + Date.now() }
  });

  const product = await prisma.product.create({
    data: {
      name: 'Producto Race Condition ' + Date.now(),
      slug: 'race-cond-' + Date.now(),
      description: 'Prueba de stock',
      basePriceCents: 100000,
      categoryId: category.id,
      status: 'published'
    }
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: 'SKU-RACE-' + Date.now(),
      stock: 1, // EXACTAMENTE 1 UNIDAD
      reservedStock: 0,
      priceCents: 100000
    }
  });

  const cart = await prisma.cart.create({ data: {} });
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      variantId: variant.id,
      quantity: 1
    }
  });

  console.log(`Producto creado: ${product.name}`);
  console.log(`Stock Inicial: ${variant.stock}, Reservado: ${variant.reservedStock}`);
  console.log(`Cart ID: ${cart.id}`);

  // 2. Disparar 10 peticiones simultáneas
  console.log("\n2. Disparando 10 peticiones POST concurrentes a /api/v1/orders...");
  const requests = Array.from({ length: 10 }).map((_, i) => {
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartId: cart.id,
        email: `cliente${i}@test.com`,
        phone: '3000000000',
        customerName: `Test Cliente ${i}`,
        shippingAddress: { addressLine1: "Calle 123", city: "Bogota", department: "Cundinamarca", country: "CO" }
      })
    }).then(async res => {
      const data = await res.json();
      return { status: res.status, data };
    }).catch(err => {
      return { status: 500, error: err.message };
    });
  });

  const results = await Promise.all(requests);

  // 3. Analizar resultados
  let successCount = 0;
  let outOfStockCount = 0;
  let otherErrorCount = 0;

  console.log("\n--- RESULTADOS DE LAS 10 PETICIONES ---");
  results.forEach((res, index) => {
    if (res.status === 201) {
      successCount++;
      console.log(`Petición ${index + 1}: ÉXITO (Orden creada: ${res.data?.data?.order?.reference})`);
    } else if (res.status === 400 && res.data?.error?.includes("quedó sin stock")) {
      outOfStockCount++;
      console.log(`Petición ${index + 1}: RECHAZADA (Agotado: "${res.data.error}")`);
    } else {
      otherErrorCount++;
      console.log(`Petición ${index + 1}: ERROR INESPERADO (Status ${res.status}):`, res.data || res.error);
    }
  });

  console.log("\n--- RESUMEN FINAL ---");
  console.log(`- Peticiones Exitosas (Compraron la unidad): ${successCount}`);
  console.log(`- Peticiones Rechazadas por Stock Agotado: ${outOfStockCount}`);
  console.log(`- Otros errores (ej. carrito borrado): ${otherErrorCount}`);

  // 4. Verificar stock final en BD
  const finalVariant = await prisma.productVariant.findUnique({ where: { id: variant.id } });
  console.log(`\nStock Final en BD -> Total: ${finalVariant?.stock} | Reservado: ${finalVariant?.reservedStock}`);

  await prisma.$disconnect();
}

runTest().catch(e => console.error(e));
