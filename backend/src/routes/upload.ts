import type { FastifyPluginAsync } from "fastify";
import { createWriteStream, mkdirSync } from "fs";
import { join, extname } from "path";
import { randomBytes, createHash } from "crypto";
import { sendSuccess } from "../utils/response.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { pipeline } from "stream/promises";

// Resolve the uploads directory relative to the backend root
const UPLOADS_DIR = join(process.cwd(), "uploads");

// Ensure the uploads directory exists at startup
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

async function uploadToCloudinary(buffer: Buffer, mimetype: string): Promise<string | null> {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

  // Support CLOUDINARY_URL string parsing if provided
  if (!cloudName && process.env.CLOUDINARY_URL) {
    try {
      const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    } catch {/* ignore */}
  }

  if (!cloudName) return null;

  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimetype });
    formData.append("file", blob, "image.jpg");

    if (preset) {
      formData.append("upload_preset", preset);
    } else if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const strToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = createHash("sha1").update(strToSign).digest("hex");

      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
    } else {
      return null;
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json() as any;
    if (res.ok && json.secure_url) {
      return json.secure_url;
    }
    console.warn("⚠️ Cloudinary upload error response:", json);
    return null;
  } catch (err) {
    console.error("⚠️ Failed to upload to Cloudinary:", err);
    return null;
  }
}

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /api/v1/admin/upload
   * Receives multipart form-data ("file").
   * Uploads to Cloudinary (if configured) or local disk.
   */
  app.post(
    "/upload",
    { preHandler: authenticateAdmin },
    async (request, reply) => {
      try {
        const data = await request.file({
          limits: { fileSize: MAX_FILE_SIZE },
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

        const buffer = await data.toBuffer();

        // 1. Try Cloudinary upload if credentials are provided in env
        const cloudinaryUrl = await uploadToCloudinary(buffer, data.mimetype);
        if (cloudinaryUrl) {
          return sendSuccess(reply, { url: cloudinaryUrl }, 201);
        }

        // 2. Fallback to local server disk storage
        const ext = extname(data.filename) || ".jpg";
        const uniqueName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
        const destPath = join(UPLOADS_DIR, uniqueName);

        const { createWriteStream } = await import("fs");
        const { Readable } = await import("stream");
        await pipeline(Readable.from(buffer), createWriteStream(destPath));

        let backendBase = "https://fajas-ab-prod.onrender.com";
        if (process.env.NODE_ENV === "development") {
          const port = process.env.PORT || 3001;
          const host = process.env.HOST || "localhost";
          backendBase = `http://${host}:${port}`;
        } else if (process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL) {
          backendBase = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || backendBase;
        }
        const url = `${backendBase.replace(/\/$/, "")}/uploads/${uniqueName}`;
        return sendSuccess(reply, { url }, 201);
      } catch (err: any) {
        request.log.error(err);
        return reply.status(500).send({ ok: false, error: err?.message || "Error al subir la imagen." });
      }
    }
  );
};
