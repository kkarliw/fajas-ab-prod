import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../utils/errors.js";

export async function authenticateAdmin(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError("Unauthorized", 401);
  }

  const user = request.user as { sub: string; role: string };
  if (user.role !== "admin") {
    throw new AppError("Forbidden: Requires admin privileges", 403);
  }
}
