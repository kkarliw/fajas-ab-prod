import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/response.js";
import crypto from "crypto";

const createPqrSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  orderId: z.string().optional(),
  type: z.enum(["peticion", "queja", "reclamo", "sugerencia", "felicitacion"]),
  subject: z.string().min(3),
  message: z.string().min(10)
});

export const pqrRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request, reply) => {
    try {
      const data = createPqrSchema.parse(request.body);
      
      // Generate a unique ticket number: PQR-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomStr = crypto.randomBytes(2).toString("hex").toUpperCase();
      const ticketNumber = `PQR-${dateStr}-${randomStr}`;

      const ticket = await prisma.pqrTicket.create({
        data: {
          ticketNumber,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          orderId: data.orderId || null,
          type: data.type,
          subject: data.subject,
          message: data.message,
          status: "open",
          priority: "medium"
        }
      });

      // Send email to admin & confirmation to customer
      try {
        const { sendSupportEmail } = await import("../services/emailService.js");
        const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
        const adminEmail = process.env.ADMIN_EMAIL || "fajasabcol@gmail.com";
        const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

        // Admin Notification
        const adminHtml = getBaseEmailTemplate(
          "Nuevo Ticket PQR",
          `
          <p class="text">Se ha radicado una nueva solicitud de cliente en <strong>FAJAS AB</strong>:</p>
          <div class="order-card">
            <p class="order-title">Ticket #${ticket.ticketNumber}</p>
            <div class="item-row"><span class="item-name">Tipo:</span> <span class="item-meta">${data.type.toUpperCase()}</span></div>
            <div class="item-row"><span class="item-name">Cliente:</span> <span class="item-meta">${data.name} (${data.email})</span></div>
            ${data.phone ? `<div class="item-row"><span class="item-name">Teléfono:</span> <span class="item-meta">${data.phone}</span></div>` : ''}
            <div class="item-row"><span class="item-name">Asunto:</span> <span class="item-meta">${data.subject}</span></div>
          </div>
          <p class="order-title" style="margin-top: 20px;">Mensaje del Cliente:</p>
          <div style="background-color: #FAF8F5; padding: 18px; border: 1px solid #E2DCD0; border-radius: 8px; font-size: 14px; color: #1C1A17; line-height: 1.6;">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
          <p class="text" style="text-align: center; margin-top: 25px;">
            <a href="${frontendUrl}/admin/pqr" class="btn">Gestionar en Panel Admin</a>
          </p>
          `
        );

        // Customer Confirmation
        const customerHtml = getBaseEmailTemplate(
          "Solicitud de Soporte Recibida",
          `
          <p class="text">Hola <strong>${data.name}</strong>,</p>
          <p class="text">Hemos recibido tu solicitud (<strong>#${ticket.ticketNumber}</strong>) en <strong>FAJAS AB</strong>. Nuestro equipo de atención al cliente revisará tu mensaje minuciosamente.</p>
          <div class="order-card">
            <p class="order-title">Resumen de tu Solicitud</p>
            <div class="item-row"><span class="item-name">Radicado:</span> <span class="item-meta">${ticket.ticketNumber}</span></div>
            <div class="item-row"><span class="item-name">Tipo:</span> <span class="item-meta">${data.type.toUpperCase()}</span></div>
            <div class="item-row"><span class="item-name">Asunto:</span> <span class="item-meta">${data.subject}</span></div>
          </div>
          <p class="text">Te daremos respuesta al correo <strong>${data.email}</strong> en un plazo máximo de 24 a 48 horas hábiles.</p>
          <p class="text" style="text-align: center; margin-top: 25px;">
            <a href="${frontendUrl}/pqr" class="btn">Consultar PQRs en FAJAS AB</a>
          </p>
          `
        );

        await Promise.all([
          sendSupportEmail({
            to: adminEmail,
            subject: `[PQR #${ticket.ticketNumber}] ${data.subject} - FAJAS AB`,
            html: adminHtml
          }),
          sendSupportEmail({
            to: data.email,
            subject: `Hemos recibido tu PQR #${ticket.ticketNumber} - FAJAS AB`,
            html: customerHtml
          })
        ]);
      } catch (emailErr) {
        console.error("No se pudo enviar los correos del PQR:", emailErr);
      }

      return sendSuccess(reply, { ticketNumber: ticket.ticketNumber, id: ticket.id }, 201);
    } catch (err: any) {
      return reply.status(400).send({ ok: false, error: err?.message || "Error al crear PQR." });
    }
  });

  // El cliente también podría querer ver el estado de su PQR con el número de ticket
  app.get("/:ticketNumber", async (request, reply) => {
    const { ticketNumber } = request.params as { ticketNumber: string };
    const { email } = request.query as { email?: string };

    if (!email) {
      return reply.status(403).send({ ok: false, error: "Email is required to view ticket status." });
    }

    try {
      const ticket = await prisma.pqrTicket.findUnique({
        where: { ticketNumber: ticketNumber.toUpperCase() },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!ticket || ticket.email.toLowerCase() !== email.toLowerCase()) {
        return reply.status(404).send({ ok: false, error: "Ticket no encontrado." });
      }

      // No devolvemos todos los datos sensibles, solo lo necesario para el cliente
      return sendSuccess(reply, {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
        type: ticket.type,
        subject: ticket.subject,
        messages: ticket.messages.map(m => ({
          sender: m.senderType,
          message: m.message,
          createdAt: m.createdAt
        }))
      });
    } catch (err: any) {
      return reply.status(500).send({ ok: false, error: "Error al obtener el PQR." });
    }
  });
};
