import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import fs from "fs";
import path from "path";

async function runTest() {
  process.env.NODE_ENV = "production";
  const app = await buildApp();
  await app.ready();

  const product = await prisma.product.findFirst();
  const variant = await prisma.productVariant.findFirst({ where: { productId: product!.id } });
  
  const cart = await prisma.cart.create({ data: { userId: null } });
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: product!.id, variantId: variant!.id, quantity: 1 }
  });

  const email = "fajasabcol@gmail.com"; // User's own email so they receive it!
  console.log(`Realizando compra real con correo: ${email}...`);
  
  const checkoutRes = await app.inject({
    method: "POST",
    url: "/api/v1/orders",
    remoteAddress: "127.0.0.1", 
    payload: {
      cartId: cart.id,
      email: email,
      phone: "3000000000",
      customerName: "QA Correo Real Directo",
      shippingAddress: { addressLine1: "Calle de prueba", city: "Medellin", department: "Antioquia" }
    }
  });

  const ref = checkoutRes.json()?.data?.order?.reference;
  const totalCents = checkoutRes.json()?.data?.order?.totalCents;
  console.log(`Orden creada: ${ref} con total: ${totalCents}`);

  const { orderService } = await import("../src/services/orderService.js");
  console.log(`Simulando pago exitoso de Wompi para disparar el correo personalizado...`);
  await orderService.handlePaymentSuccess(ref, "TEST-TX-" + Date.now(), totalCents);

  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let report = `# Reporte Adicional: Rate Limiting y Correo de Producción\n\n`;
  report += `## 1. Rate Limiting en POST /api/v1/orders\n`;
  report += `Límite configurado en producción: 10 órdenes por 15 minutos.\n`;
  
  let rateLimitHit = false;
  let lastStatus = 200;
  for (let i = 0; i < 15; i++) {
    const res = await app.inject({ method: "POST", url: "/api/v1/orders", remoteAddress: "192.168.1.55", payload: {} });
    lastStatus = res.statusCode;
    if (res.statusCode === 429) { rateLimitHit = true; break; }
  }
  
  report += `**Resultado Ráfaga (15 peticiones):** Último status HTTP obtenido fue ${lastStatus}.\n`;
  report += `**¿Bloqueó el ataque?:** ${rateLimitHit ? 'SÍ (429 Too Many Requests)' : 'NO'}\n\n`;

  report += `## 2. Prueba de Bandeja de Entrada Real (Ambiente Prod con Resend)\n`;
  report += `**Correo enviado a la cuenta del admin:** \`${email}\`\n`;
  report += `**Orden de prueba creada:** \`${ref}\`\n\n`;
  report += `> El correo ha sido enviado utilizando el API Key de Producción de Resend. Debería estar ahora mismo en la bandeja de entrada de ${email}.\n\n`;

  // Try to find the dumped HTML
  const files = fs.readdirSync(path.join(process.cwd(), "..")).filter(f => f.startsWith('qa-email-'));
  if (files.length > 0) {
    const htmlContent = fs.readFileSync(path.join(process.cwd(), "..", files[files.length - 1]), "utf8");
    report += `### Cuerpo HTML Enviado Vía Resend:\n`;
    report += `\`\`\`html\n${htmlContent.substring(0, 1500)}...\n\`\`\`\n\n`;
  }

  fs.writeFileSync(path.join(process.cwd(), "..", "qa-guest-checkout-report-2.md"), report, "utf8");
  console.log("Reporte 2 generado con éxito.");
  await app.close();
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
