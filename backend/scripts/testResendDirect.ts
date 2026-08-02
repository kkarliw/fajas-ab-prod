import { Resend } from "resend";

async function testResend() {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("No RESEND_API_KEY in .env");
    return;
  }
  const resend = new Resend(resendApiKey);

  console.log("Sending direct test email via Resend...");
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "fajasabcol@gmail.com",
      subject: "Test de Resend (Modo Onboarding)",
      html: "<p>Hola, esto es una prueba de Resend usando el dominio de onboarding.</p>"
    });
    
    console.log("Respuesta completa de Resend:", JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error("Excepción al enviar:", error.message, error);
  }
}

testResend();
