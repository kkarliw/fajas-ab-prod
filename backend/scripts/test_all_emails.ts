import { getBaseEmailTemplate } from "../src/utils/emailTemplate.js";
import { sendTransactionalEmail, sendMarketingEmail, sendSupportEmail } from "../src/services/emailService.js";

const TARGET_EMAIL = process.env.TEST_DESTINATION_EMAIL || "fajasabcol@gmail.com";
const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runEmailTests() {
  console.log("=================================================");
  console.log("  PRUEBA SISTÉMICA DE TODOS LOS CORREOS FAJAS AB");
  console.log("  Destino de prueba:", TARGET_EMAIL);
  console.log("=================================================\n");

  const results: { type: string; sender: string; subject: string; success: boolean; resendId?: string; error?: string }[] = [];

  // 1. Verificación de Cuenta
  try {
    console.log("1. Enviando: Código de Verificación de Cuenta...");
    const html = getBaseEmailTemplate(
      "Código de Verificación",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">Bienvenid@ a <strong>FAJAS AB</strong>. Estamos encantados de acompañarte a resaltar la belleza natural de tu figura.</p>
      <p class="text">Para activar tu cuenta y acceder a tu perfil y pedidos, ingresa el siguiente código de verificación de 6 dígitos:</p>
      
      <div class="code-box">
        <div class="code-value">849201</div>
      </div>
      
      <p class="text" style="font-size: 13px; color: #7A7060; text-align: center;">Este código expirará en 15 minutos por tu seguridad.</p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/verify-email?email=${encodeURIComponent(TARGET_EMAIL)}&code=849201" class="btn">Verificar Mi Cuenta</a>
      </div>
      `
    );
    const res = await sendTransactionalEmail({
      to: TARGET_EMAIL,
      subject: "Tu código de verificación - FAJAS AB",
      html
    });
    results.push({ type: "1. Verificación Cuenta", sender: "pedidos@fajasab.com", subject: "Tu código de verificación - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "1. Verificación Cuenta", sender: "pedidos@fajasab.com", subject: "Tu código de verificación - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 2. Restablecimiento de Contraseña
  try {
    console.log("2. Enviando: Restablecer Contraseña...");
    const html = getBaseEmailTemplate(
      "Restablecer Contraseña",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>FAJAS AB</strong>.</p>
      <p class="text">Tu código de seguridad para ingresar tu nueva clave es:</p>
      
      <div class="code-box">
        <div class="code-value">394812</div>
      </div>
      
      <p class="text" style="font-size: 13px; color: #7A7060; text-align: center;">Este código expirará en 15 minutos por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/reset-password?email=${encodeURIComponent(TARGET_EMAIL)}&code=394812" class="btn">Restablecer Contraseña</a>
      </div>
      `
    );
    const res = await sendTransactionalEmail({
      to: TARGET_EMAIL,
      subject: "Código para restablecer contraseña - FAJAS AB",
      html
    });
    results.push({ type: "2. Restablecer Clave", sender: "pedidos@fajasab.com", subject: "Código para restablecer contraseña - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "2. Restablecer Clave", sender: "pedidos@fajasab.com", subject: "Código para restablecer contraseña - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 3. Confirmación de Compra (Factura)
  try {
    console.log("3. Enviando: Confirmación de Compra y Factura...");
    const html = getBaseEmailTemplate(
      "Confirmación de Compra",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">¡Gracias por elegir <strong>FAJAS AB</strong>! Hemos recibido tu pago y tu pedido se encuentra en preparación. A continuación te presentamos la factura y detalle de tu compra:</p>
      
      <div class="order-card">
        <p class="order-title">Factura de Pedido #ORD-2026-99182</p>
        <div class="item-row clearfix">
          <span class="item-name">Faja Reloj de Arena Luxe de Alta Compresión</span><br>
          <span class="item-meta">Talla: M | Color: Negro | Cantidad: 1</span>
          <span class="item-price">$180.000</span>
        </div>
        <div class="item-row clearfix">
          <span class="item-name">Tabla Abdominal Moldeadora Postquirúrgica</span><br>
          <span class="item-meta">Talla: Única | Color: Beige | Cantidad: 1</span>
          <span class="item-price">$45.000</span>
        </div>
        
        <div class="totals clearfix" style="margin-top: 15px;">
          <div class="totals-row clearfix">
            <span class="totals-label">Subtotal</span>
            <span class="totals-value">$225.000</span>
          </div>
          <div class="totals-row clearfix" style="color: #2E7D32;">
            <span class="totals-label">Descuento (CUPON20)</span>
            <span class="totals-value">-$45.000</span>
          </div>
          <div class="totals-row clearfix">
            <span class="totals-label">Envío a Domicilio</span>
            <span class="totals-value">$12.000</span>
          </div>
          <div class="totals-row totals-grand clearfix">
            <span class="totals-label" style="color: #1C1A17;">Total Pagado</span>
            <span class="totals-value">$192.000</span>
          </div>
        </div>
      </div>
      
      <div class="order-card" style="margin-top: 20px;">
        <p class="order-title">Dirección de Entrega</p>
        <p class="text" style="font-size: 14px; margin-bottom: 0;"><strong>Karla Jiménez</strong><br>Calle 100 # 15 - 20, Apto 502<br>Bogotá D.C., Cundinamarca<br>Tel: 3001234567</p>
      </div>
      
      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/account" class="btn">Ver Estado de Mi Pedido</a>
      </p>
      `
    );
    const res = await sendTransactionalEmail({
      to: TARGET_EMAIL,
      subject: "¡Confirmación de compra! Pedido #ORD-2026-99182 - FAJAS AB",
      html
    });
    results.push({ type: "3. Factura Compra", sender: "pedidos@fajasab.com", subject: "¡Confirmación de compra! Pedido #ORD-2026-99182 - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "3. Factura Compra", sender: "pedidos@fajasab.com", subject: "¡Confirmación de compra! Pedido #ORD-2026-99182 - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 4. Notificación de Despacho (Guía de Rastreo)
  try {
    console.log("4. Enviando: Guía de Rastreo y Despacho...");
    const html = getBaseEmailTemplate(
      "Tu Pedido está en Camino",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">¡Buenas noticias! Tu pedido <strong>#ORD-2026-99182</strong> en <strong>FAJAS AB</strong> ha sido despachado y se encuentra en camino hacia tu dirección de entrega.</p>
      
      <div style="background-color: #FAF8F5; border: 1px dashed #C4A46A; padding: 18px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #7A7060; text-transform: uppercase; letter-spacing: 0.1em;">Número de Guía / Tracking</p>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1C1A17; letter-spacing: 0.05em;">SERVIENTREGA-998877112</p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #555048;">Transportadora: <strong>Servientrega Colombia</strong></p>
      </div>

      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/account" class="btn">Rastrear Mi Pedido en FAJAS AB</a>
      </p>
      `
    );
    const res = await sendTransactionalEmail({
      to: TARGET_EMAIL,
      subject: "¡Tu pedido #ORD-2026-99182 ha sido despachado! - FAJAS AB",
      html
    });
    results.push({ type: "4. Despacho Guía", sender: "pedidos@fajasab.com", subject: "¡Tu pedido #ORD-2026-99182 ha sido despachado! - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "4. Despacho Guía", sender: "pedidos@fajasab.com", subject: "¡Tu pedido #ORD-2026-99182 ha sido despachado! - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 5. Confirmación PQR al Cliente
  try {
    console.log("5. Enviando: Confirmación PQR al Cliente...");
    const html = getBaseEmailTemplate(
      "Solicitud de Soporte Recibida",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">Hemos recibido tu solicitud (<strong>#PQR-20260722-A109</strong>) en <strong>FAJAS AB</strong>. Nuestro equipo de atención al cliente revisará tu caso con la mayor prioridad.</p>
      <div class="order-card">
        <p class="order-title">Resumen de tu Solicitud</p>
        <div class="item-row"><span class="item-name">Radicado:</span> <span class="item-meta">PQR-20260722-A109</span></div>
        <div class="item-row"><span class="item-name">Tipo:</span> <span class="item-meta">PETICIÓN / ASESORÍA DE TALLA</span></div>
        <div class="item-row"><span class="item-name">Asunto:</span> <span class="item-meta">Consulta sobre medidas de cintura e historia postquirúrgica</span></div>
      </div>
      <p class="text">Te daremos respuesta a este correo en un plazo máximo de 24 a 48 horas hábiles.</p>
      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/pqr" class="btn">Consultar PQRs en FAJAS AB</a>
      </p>
      `
    );
    const res = await sendSupportEmail({
      to: TARGET_EMAIL,
      subject: "Hemos recibido tu PQR #PQR-20260722-A109 - FAJAS AB",
      html
    });
    results.push({ type: "5. PQR Cliente", sender: "soporte@fajasab.com", subject: "Hemos recibido tu PQR #PQR-20260722-A109 - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "5. PQR Cliente", sender: "soporte@fajasab.com", subject: "Hemos recibido tu PQR #PQR-20260722-A109 - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 6. Alerta PQR al Administrador
  try {
    console.log("6. Enviando: Alerta PQR para Administrador...");
    const html = getBaseEmailTemplate(
      "Nuevo Ticket PQR",
      `
      <p class="text">Se ha radicado una nueva solicitud de cliente en <strong>FAJAS AB</strong>:</p>
      <div class="order-card">
        <p class="order-title">Ticket #PQR-20260722-A109</p>
        <div class="item-row"><span class="item-name">Tipo:</span> <span class="item-meta">PETICIÓN</span></div>
        <div class="item-row"><span class="item-name">Cliente:</span> <span class="item-meta">Karla Jiménez (${TARGET_EMAIL})</span></div>
        <div class="item-row"><span class="item-name">Teléfono:</span> <span class="item-meta">3001234567</span></div>
        <div class="item-row"><span class="item-name">Asunto:</span> <span class="item-meta">Consulta sobre medidas de cintura</span></div>
      </div>
      <p class="order-title" style="margin-top: 20px;">Mensaje del Cliente:</p>
      <div style="background-color: #FAF8F5; padding: 18px; border: 1px solid #E2DCD0; border-radius: 8px; font-size: 14px; color: #1C1A17; line-height: 1.6;">
        Hola equipo FAJAS AB, me gustaría saber si la faja reloj de arena en talla M sirve para una cintura de 74 cm. ¡Gracias!
      </div>
      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/admin/pqr" class="btn">Gestionar en Panel Admin</a>
      </p>
      `
    );
    const res = await sendSupportEmail({
      to: TARGET_EMAIL,
      subject: "[PQR #PQR-20260722-A109] Consulta sobre medidas - FAJAS AB",
      html
    });
    results.push({ type: "6. PQR Admin", sender: "soporte@fajasab.com", subject: "[PQR #PQR-20260722-A109] Consulta sobre medidas - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "6. PQR Admin", sender: "soporte@fajasab.com", subject: "[PQR #PQR-20260722-A109] Consulta sobre medidas - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 7. Bienvenida Suscriptor Newsletter
  try {
    console.log("7. Enviando: Bienvenida Suscriptor Boletín...");
    const html = getBaseEmailTemplate(
      "¡Gracias por unirte a FAJAS AB!",
      `
      <p class="text">¡Nos alegra darte la bienvenida a <strong>FAJAS AB</strong>!</p>
      <p class="text">Como agradecimiento por suscribirte a nuestro boletín exclusivo, aquí tienes tu código de bienvenida especial para tu primera compra:</p>
      
      <div class="code-box">
        <div class="code-value">BIENVENIDA10</div>
      </div>
      
      <p class="text">Ingresa este código durante el checkout para disfrutar de tu beneficio exclusivo.</p>
      
      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/shop" class="btn">Explorar Colecciones en FAJAS AB</a>
      </p>
      `
    );
    const res = await sendMarketingEmail({
      to: TARGET_EMAIL,
      subject: "¡Bienvenid@ a FAJAS AB! Tu regalo de bienvenida te espera",
      html
    });
    results.push({ type: "7. Bienvenida Boletín", sender: "hola@fajasab.com", subject: "¡Bienvenid@ a FAJAS AB! Tu regalo de bienvenida te espera", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "7. Bienvenida Boletín", sender: "hola@fajasab.com", subject: "¡Bienvenid@ a FAJAS AB! Tu regalo de bienvenida te espera", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  await delay(2000);

  // 8. Campaña de Marketing Masivo
  try {
    console.log("8. Enviando: Campaña de Marketing Masivo...");
    const html = getBaseEmailTemplate(
      "Nueva Colección Luxe 2026",
      `
      <p class="text">Hola <strong>Karla Jiménez</strong>,</p>
      <p class="text">Te presentamos en primicia nuestra nueva línea de <strong>Fajas Reloj de Arena Luxe</strong> diseñadas con tecnología de microcápsulas de vitamina E y compresión de alta definición.</p>
      <div style="text-align: center; margin: 25px 0;">
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop" alt="Colección Luxe" style="max-width: 100%; border-radius: 8px; margin: 0 auto;">
      </div>
      <p class="text">Aprovecha precios de lanzamiento exclusivos y envío gratis a toda Colombia en pedidos superiores a $150.000.</p>
      
      <p class="text" style="text-align: center; margin-top: 25px;">
        <a href="${frontendUrl}/shop" class="btn">Ver Colección Luxe en FAJAS AB</a>
      </p>
      `
    );
    const res = await sendMarketingEmail({
      to: TARGET_EMAIL,
      subject: "Descubre la Nueva Colección Luxe - FAJAS AB",
      html
    });
    results.push({ type: "8. Campaña Marketing", sender: "hola@fajasab.com", subject: "Descubre la Nueva Colección Luxe - FAJAS AB", success: !!res?.id, resendId: res?.id });
    console.log("   ✅ Éxito! Resend ID:", res?.id);
  } catch (err: any) {
    results.push({ type: "8. Campaña Marketing", sender: "hola@fajasab.com", subject: "Descubre la Nueva Colección Luxe - FAJAS AB", success: false, error: err.message });
    console.log("   ❌ Error:", err.message);
  }

  console.log("\n=================================================");
  console.log("  RESUMEN DE PRUEBAS DE ENVÍO DE CORREOS");
  console.log("=================================================");
  console.table(results);
}

runEmailTests();
