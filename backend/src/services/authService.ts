import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import type { UserDTO } from "../types/dtos.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type UpdateMeInput = {
  name?: string;
  phone?: string;
};

type JwtPayload = {
  sub: string;
  role: string;
  tokenType: "access" | "refresh";
};

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};

function toUserDTO(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: { name: string };
  createdAt: Date;
}): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role?.name || "customer",
    createdAt: user.createdAt.toISOString()
  };
}

async function getCustomerRoleId() {
  const role = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer" }
  });

  return role.id;
}

function issueTokens(userId: string, role: string) {
  const payload = { sub: userId, role };
  const accessToken = jwt.sign({ ...payload, tokenType: "access" }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
  const refreshToken = jwt.sign({ ...payload, tokenType: "refresh" }, env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new AppError("Este correo electrónico ya se encuentra registrado.", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const roleId = await getCustomerRoleId();

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await prisma.user.create({
      data: {
        roleId,
        email: input.email,
        passwordHash,
        name: input.name,
        phone: input.phone ?? null,
        verificationCode,
        verificationExpires
      },
      include: { role: true }
    });

    // Send email without awaiting, to not block the request
    (async () => {
      try {
        const { sendTransactionalEmail } = await import("./emailService.js");
        const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
        const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";
        
        const html = getBaseEmailTemplate(
          "Código de Verificación",
          `
          <p class="text">Hola <strong>${user.name}</strong>,</p>
          <p class="text">Bienvenid@ a <strong>FAJAS AB</strong>. Estamos encantados de acompañarte a resaltar la belleza natural de tu figura.</p>
          <p class="text">Para activar tu cuenta y acceder a tu perfil y pedidos, ingresa el siguiente código de verificación de 6 dígitos:</p>
          
          <div class="code-box">
            <div class="code-value">${verificationCode}</div>
          </div>
          
          <p class="text" style="font-size: 13px; color: #7A7060; text-align: center;">Este código expirará en 15 minutos por tu seguridad.</p>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${frontendUrl}/verify-email?email=${encodeURIComponent(user.email)}&code=${verificationCode}" class="btn">Verificar Mi Cuenta</a>
          </div>
          `
        );
        await sendTransactionalEmail({ to: user.email, subject: "Tu código de verificación - FAJAS AB", html });
      } catch (err) {
        console.error("Error sending verification email", err);
      }
    })();

    return { message: "Account created successfully. Please check your email to verify your account." };
  },

  async verifyEmail(input: { email: string, code: string }, reply: FastifyReply) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: true }
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (user.emailVerifiedAt) {
      throw new AppError("El correo ya se encuentra verificado", 400);
    }

    if (!user.verificationCode || user.verificationCode !== input.code) {
      throw new AppError("El código de verificación es incorrecto", 400);
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      throw new AppError("El código de verificación ha expirado", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerifiedAt: new Date(),
        verificationCode: null,
        verificationExpires: null
      }
    });

    // Link guest orders automatically!
    try {
      await prisma.order.updateMany({
        where: { email: user.email, userId: null },
        data: { userId: user.id }
      });
    } catch (err) {
      console.error("Failed to link guest orders on verify:", err);
    }

    // Issue tokens to log them in directly
    const { accessToken, refreshToken } = issueTokens(user.id, user.role.name);
    if (typeof reply?.setCookie === "function") {
      reply.setCookie("refreshToken", refreshToken, refreshCookieOptions);
    }

    return { user: toUserDTO(user), accessToken };
  },

  async login(input: LoginInput, reply: FastifyReply) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: { role: true }
    });

    const validPassword = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !validPassword) {
      console.warn(`[Login Failed] email: "${normalizedEmail}", userFound: ${!!user}, validPass: ${validPassword}`);
      throw new AppError("Correo electrónico o contraseña incorrectos.", 401);
    }

    if (!user.emailVerifiedAt) {
      throw new AppError("Por favor verifica tu correo electrónico antes de iniciar sesión.", 403);
    }

    const roleName = user.role?.name || "customer";
    const { accessToken, refreshToken } = issueTokens(user.id, roleName);

    if (typeof reply?.setCookie === "function") {
      reply.setCookie("refreshToken", refreshToken, refreshCookieOptions);
    }

    return { user: toUserDTO(user), accessToken };
  },

  async logout(reply: FastifyReply) {
    reply.clearCookie("refreshToken", {
      ...refreshCookieOptions,
      maxAge: undefined
    });
  },

  async refresh(request: FastifyRequest) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError("Sesión expirada. Por favor, inicia sesión nuevamente.", 401);
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError("Sesión expirada. Por favor, inicia sesión nuevamente.", 401);
    }

    if (payload.tokenType !== "refresh") {
      throw new AppError("Sesión expirada. Por favor, inicia sesión nuevamente.", 401);
    }

    const { accessToken } = issueTokens(payload.sub, payload.role);

    return { accessToken };
  },

  async me(request: FastifyRequest) {
    const payload = request.user as JwtPayload | undefined;
    if (!payload?.sub) {
      throw new AppError("No autorizado", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true }
    });

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    return { user: toUserDTO(user) };
  },

  async updateMe(request: FastifyRequest, input: UpdateMeInput) {
    const payload = request.user as JwtPayload | undefined;
    if (!payload?.sub) {
      throw new AppError("No autorizado", 401);
    }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {})
      },
      include: { role: true }
    });

    return { user: toUserDTO(user) };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return { message: "Si la cuenta existe, hemos enviado un código de recuperación a tu correo." };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires
      }
    });

    (async () => {
      try {
        const { sendTransactionalEmail } = await import("./emailService.js");
        const { getBaseEmailTemplate } = await import("../utils/emailTemplate.js");
        const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";
        
        const html = getBaseEmailTemplate(
          "Restablecer Contraseña",
          `
          <p class="text">Hola <strong>${user.name}</strong>,</p>
          <p class="text">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>FAJAS AB</strong>.</p>
          <p class="text">Tu código de seguridad para ingresar tu nueva clave es:</p>
          
          <div class="code-box">
            <div class="code-value">${resetCode}</div>
          </div>
          
          <p class="text" style="font-size: 13px; color: #7A7060; text-align: center;">Este código expirará en 15 minutos por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${frontendUrl}/reset-password?email=${encodeURIComponent(user.email)}&code=${resetCode}" class="btn">Restablecer Contraseña</a>
          </div>
          `
        );
        await sendTransactionalEmail({ to: user.email, subject: "Código para restablecer contraseña - FAJAS AB", html });
      } catch (err) {
        console.error("Error sending reset password email", err);
      }
    })();

    return { message: "Si la cuenta existe, hemos enviado un código de recuperación a tu correo." };
  },

  async resetPassword(input: { email: string; code: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new AppError("Usuario no encontrado o código inválido", 400);
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== input.code) {
      throw new AppError("El código de recuperación es incorrecto", 400);
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new AppError("El código de recuperación ha expirado", 400);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordCode: null,
        resetPasswordExpires: null
      }
    });

    return { message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión." };
  }
};
