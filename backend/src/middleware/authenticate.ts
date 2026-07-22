import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../utils/errors.js";

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError("Unauthorized", 401);
  }
}
