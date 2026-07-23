import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function registerCors(app: FastifyInstance) {
  const allowedOrigins = [
    env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    "https://www.fajasab.com",
    "https://fajasab.com",
    "http://www.fajasab.com",
    "http://fajasab.com",
  ].filter(Boolean) as string[];

  await app.register(cors, {
    origin: (origin, cb) => {
      // allow requests with no origin (like mobile apps, curl, Wompi webhooks)
      if (!origin) return cb(null, true);
      
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".hostingersite.com") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost")
      ) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true
  });
}

