import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import fs from "fs";
import path from "path";

const headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

let sidToken = "";

async function fetchTempEmail() {
  const res = await fetch("https://api.guerrillamail.com/ajax.php?f=get_email_address");
  const json = await res.json();
  sidToken = json.sid_token;
  return json.email_addr;
}

async function checkEmails() {
  const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sidToken}`);
  const json = await res.json();
  return (json.list || []).filter((m: any) => m.mail_subject !== "Welcome to Guerrilla Mail");
}

async function readEmail(msgId: string) {
  const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${msgId}&sid_token=${sidToken}`);
  return await res.json();
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  process.env.NODE_ENV = "production";
  const app = await buildApp();
  await app.ready();

  let report = `# Reporte Adicional: Rate Limiting y Correo de Producción\n\n`;

  // 1. Rate Limit Test on POST /api/v1/orders
  report += `## 1. Rate Limiting en POST /api/v1/orders\n`;
  report += `Límite configurado en producción: 10 órdenes por 15 minutos.\n`;
  
  let rateLimitHit = false;
  let lastStatus = 200;
  
  // We don't want to actually create 11 orders in DB if we can avoid it. 
  // We can just send invalid payloads to trigger the rate limit quickly.
  // The rate limit triggers BEFORE validation.
  for (let i = 0; i < 15; i++) {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/orders",
      remoteAddress: "192.168.1.55",
      payload: {} // invalid body, but rate limit triggers first!
    });
    lastStatus = res.statusCode;
    if (res.statusCode === 429) {
      rateLimitHit = true;
      break;
    }
  }
  
  report += `**Resultado Ráfaga (15 peticiones):** Último status HTTP obtenido fue ${lastStatus}.\n`;
  report += `**¿Bloqueó el ataque?:** ${rateLimitHit ? 'SÍ (429 Too Many Requests)' : 'NO'}\n\n`;

  // 2. Real Email Test
  report += `## 2. Prueba de Bandeja de Entrada Real (Ambiente Prod con Resend)\n`;
  const emailAddress = await fetchTempEmail();
  
  report += `**Correo temporal generado:** \`${emailAddress}\`\n\n`;
  
  // Create a real order
  const product = await prisma.product.findFirst();
  const variant = await prisma.productVariant.findFirst({ where: { productId: product!.id } });
  
  const cart = await prisma.cart.create({ data: { userId: null } });
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId: product!.id, variantId: variant!.id, quantity: 1 }
  });

  console.log(`Realizando compra real con correo: ${emailAddress}...`);
  const checkoutRes = await app.inject({
    method: "POST",
    url: "/api/v1/orders",
    remoteAddress: "127.0.0.1", // different IP to avoid rate limit
    payload: {
      cartId: cart.id,
      email: emailAddress,
      phone: "3000000000",
      customerName: "QA Correo Real",
      shippingAddress: { addressLine1: "Calle de prueba", city: "Medellin", department: "Antioquia" }
    }
  });

  const ref = checkoutRes.json()?.data?.order?.reference;
  report += `**Orden de prueba creada:** \`${ref}\`\n`;
  
  console.log("Esperando a que llegue el correo a Resend (hasta 60s)...");
  
  let foundMsgId = null;
  for (let attempt = 1; attempt <= 6; attempt++) {
    await sleep(10000);
    console.log(`Intento ${attempt}... Buscando en la bandeja de entrada...`);
    const messages = await checkEmails();
    if (messages.length > 0) {
      foundMsgId = messages[0].mail_id;
      break;
    }
  }
  
  if (foundMsgId) {
    const msgData = await readEmail(foundMsgId);
    report += `**¡CORREO RECIBIDO EN BANDEJA REAL!**\n`;
    report += `**De:** ${msgData.mail_from}\n`;
    report += `**Asunto:** ${msgData.mail_subject}\n`;
    report += `**Fecha:** ${msgData.mail_date}\n\n`;
    report += `### Cuerpo HTML Recibido:\n`;
    report += `\`\`\`html\n${(msgData.mail_body || "").substring(0, 1500)}...\n\`\`\`\n\n`;
  } else {
    report += `**Error:** No se recibió el correo después de 10 segundos.\n\n`;
  }

  // Escribir archivo final
  fs.writeFileSync(path.join(process.cwd(), "..", "qa-guest-checkout-report-2.md"), report, "utf8");
  console.log("Reporte 2 generado con éxito.");
  await app.close();
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
