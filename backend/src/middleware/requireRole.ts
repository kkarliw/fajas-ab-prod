import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../utils/errors.js";

export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role)) {
      throw new AppError("Forbidden", 403);
    }
  };
}
