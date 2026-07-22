import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || env.CORS_ORIGIN || "http://localhost:8080",
    credentials: true
  });
}
