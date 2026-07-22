import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { sendMarketingEmail } from "../services/emailService.js";

const createSubscriberSchema = z.object({
  email: z.string().email(),
  source: z.string().optional()
});

export const subscribersRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      try {
        const data = createSubscriberSchema.parse(request.body);
        
        // Use upsert to handle if they subscribe multiple times
        const subscriber = await prisma.newsletterSubscriber.upsert({
          where: { email: data.email },
          update: { 
            status: "active",
            source: data.source || "store"
          },
          create: {
            email: data.email,
            source: data.source || "store",
            status: "active",
            consentAt: new Date()
          }
        });

        // Send Welcome Email with Coupon (if enabled and configured)
        if (subscriber.status === "active") {
          try {
            const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
            const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

            const settingsBlock = await prisma.contentBlock.findFirst({
              where: { key: "store_settings" }
            });

            let couponHtml = "";
            let promoCode = "BIENVENIDA10";

            if (settingsBlock && settingsBlock.payloadJson) {
              const settings = settingsBlock.payloadJson as any;
              if (settings?.promoPopup?.couponCode) {
                promoCode = settings.promoPopup.couponCode;
              }
            }

            couponHtml = `
              <div class="code-box">
                <div class="code-value">${promoCode}</div>
              </div>
            `;

            const emailContentHtml = `
              <p class="text">¡Nos alegra darte la bienvenida a <strong>FAJAS AB</strong>!</p>
              <p class="text">Como agradecimiento por suscribirte a nuestro boletín exclusivo, aquí tienes tu código de bienvenida especial para tu primera compra:</p>
              
              ${couponHtml}
              
              <p class="text">Ingresa este código durante el checkout para disfrutar de tu beneficio exclusivo.</p>
              
              <p class="text" style="text-align: center; margin-top: 25px;">
                <a href="${frontendUrl}/shop" class="btn">Explorar Colecciones en FAJAS AB</a>
              </p>
            `;

            await sendMarketingEmail({
              to: subscriber.email,
              subject: "¡Bienvenid@ a FAJAS AB! Tu regalo de bienvenida te espera",
              html: getBaseEmailTemplate("¡Gracias por unirte a FAJAS AB!", emailContentHtml)
            });
          } catch (e) {
            console.error("Failed to send welcome email:", e);
          }
        }

        return sendSuccess(reply, subscriber, 201);
      } catch (err: any) {
        return reply.status(400).send({ ok: false, error: err?.message || "Error al suscribirse." });
      }
    }
  );
};
