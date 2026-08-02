import Fastify from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import { join } from "path";
import { mkdirSync } from "fs";
import { registerCors } from "./plugins/cors.js";
import { registerHelmet } from "./plugins/helmet.js";
import { registerJwt } from "./plugins/jwt.js";
import { registerRateLimit } from "./plugins/rateLimit.js";
import { routes } from "./routes/index.js";
import { AppError } from "./utils/errors.js";

const UPLOADS_DIR = join(process.cwd(), "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.setErrorHandler((error: any, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ ok: false, error: error.message });
    }

    if (error.name === "ZodError") {
      return reply.status(400).send({ ok: false, error: error.message });
    }

    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    app.log.error(error);
    return reply.status(statusCode).send({ ok: false, error: message });
  });

  await registerCors(app);
  await registerHelmet(app);
  await app.register(cookie);
  await registerJwt(app);
  await registerRateLimit(app);

  // Enable multipart/form-data parsing for file uploads
  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB global limit
  });

  // Serve uploaded files as static assets at /uploads/*
  await app.register(staticFiles, {
    root: UPLOADS_DIR,
    prefix: "/uploads/",
    decorateReply: false,
  });

  await app.register(routes, { prefix: "/api/v1" });

  return app;
}
