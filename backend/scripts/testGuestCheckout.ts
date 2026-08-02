import { prisma } from "../src/lib/prisma.js";
import { orderService } from "../src/services/orderService.js";
import { authService } from "../src/services/authService.js";

async function runTest() {
  const testEmail = `guest_test_${Date.now()}@example.com`;
  console.log(`--- INICIANDO PRUEBA E2E PARA: ${testEmail} ---`);

  // 1. Create a dummy cart with one item
  const product = await prisma.product.findFirst();
  const variant = await prisma.productVariant.findFirst({ where: { productId: product!.id } });
  
  const cart = await prisma.cart.create({ data: { userId: null } });
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product!.id,
      variantId: variant!.id,
      quantity: 1,
    }
  });

  // 2. Checkout as Guest (userId = null)
  console.log("\n1. Simulando Checkout de Invitado...");
  const order = await orderService.createOrderFromCart(
    cart.id,
    testEmail,
    "3001234567",
    "Prueba Invitado",
    { addressLine1: "Calle Falsa 123", city: "Bogota", department: "Bogota D.C." },
    null,
    undefined
  );

  // 3. Verify order created with userId = null
  const dbOrder = await prisma.order.findUnique({ where: { id: order.id } });
  console.log(`Orden Creada: ${dbOrder!.reference}`);
  console.log(`¿userId es null?: ${dbOrder!.userId === null ? 'SÍ (Correcto)' : 'NO (Error)'}`);

  // 4. Test Guest Tracking
  console.log("\n2. Probando endpoint de Rastreo de Invitado...");
  const trackedOrder = await orderService.getOrderByIdOrReference(dbOrder!.reference);
  if (trackedOrder && trackedOrder.email === testEmail) {
    console.log(`Rastreo exitoso para ${testEmail} de la orden ${trackedOrder.reference}`);
  } else {
    console.log("Error en rastreo");
  }

  // 5. Register User with same email
  console.log("\n3. Registrando usuario con el mismo correo...");
  await authService.register({
    email: testEmail,
    password: "Password123!",
    name: "Prueba Invitado",
  });

  const newUser = await prisma.user.findUnique({ where: { email: testEmail } });
  console.log(`Usuario registrado con ID: ${newUser!.id}`);

  // 6. Verify Email -> Should link orders
  console.log("\n4. Verificando correo del usuario (Esto debería vincular la orden)...");
  await authService.verifyEmail({ email: testEmail, code: newUser!.verificationCode! }, {} as any);

  // 7. Check if order is now linked
  const linkedOrder = await prisma.order.findUnique({ where: { id: order.id } });
  console.log(`\n--- RESULTADO DE VINCULACIÓN ---`);
  console.log(`Orden ${linkedOrder!.reference} ahora pertenece al userId: ${linkedOrder!.userId}`);
  console.log(`¿Coincide con el nuevo usuario?: ${linkedOrder!.userId === newUser!.id ? 'SÍ (¡ÉXITO!)' : 'NO (Error)'}`);

  console.log("\n--- FIN DE PRUEBA ---");
}

runTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
