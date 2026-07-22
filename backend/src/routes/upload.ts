import type { FastifyPluginAsync } from "fastify";
import { createWriteStream, mkdirSync } from "fs";
import { join, extname } from "path";
import { randomBytes } from "crypto";
import { sendSuccess } from "../utils/response.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { pipeline } from "stream/promises";

// Resolve the uploads directory relative to the backend root
const UPLOADS_DIR = join(process.cwd(), "uploads");

// Ensure the uploads directory exists at startup
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /api/v1/admin/upload
   * Receives a multipart form-data with field name "file".
   * Returns a JSON { ok: true, data: { url: "/uploads/<filename>" } }
   *
   * The URL is short and fits comfortably in the ProductImage.url VARCHAR column.
   * For production, replace this handler with a Cloudinary/S3 upload.
   */
  app.post(
    "/upload",
    { preHandler: authenticateAdmin },
    async (request, reply) => {
      try {
        const data = await request.file({
          limits: {
            fileSize: MAX_FILE_SIZE,
          },
        });

        if (!data) {
          return reply.status(400).send({ ok: false, error: "No se recibió ningún archivo." });
        }

        if (!ALLOWED_MIME.includes(data.mimetype)) {
          return reply.status(400).send({
            ok: false,
            error: `Tipo de archivo no permitido (${data.mimetype}). Solo JPEG, PNG, WEBP o AVIF.`,
          });
        }

        // Generate a unique filename: <timestamp>-<random>.<ext>
        const ext = extname(data.filename) || ".jpg";
        const uniqueName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
        const destPath = join(UPLOADS_DIR, uniqueName);

        // Stream the file to disk
        await pipeline(data.file, createWriteStream(destPath));

        // Check for truncation (file exceeded size limit)
        if ((data.file as any).truncated) {
          return reply.status(413).send({
            ok: false,
            error: `El archivo supera el límite de ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
          });
        }

        const url = `/uploads/${uniqueName}`;
        return sendSuccess(reply, { url }, 201);
      } catch (err: any) {
        request.log.error(err);
        return reply.status(500).send({ ok: false, error: err?.message || "Error al subir la imagen." });
      }
    }
  );
};
