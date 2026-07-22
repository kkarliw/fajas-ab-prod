import type { FastifyReply } from "fastify";

export const sendSuccess = <T>(reply: FastifyReply, data: T, statusCode = 200) =>
  reply.status(statusCode).send({ data });
