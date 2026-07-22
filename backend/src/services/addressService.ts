import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

type CreateAddressInput = {
  name: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  department: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export const addressService = {
  async getAddresses(userId: string) {
    return prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });
  },

  async createAddress(userId: string, input: CreateAddressInput) {
    if (input.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const existingCount = await prisma.userAddress.count({ where: { userId } });

    return prisma.userAddress.create({
      data: {
        userId,
        name: input.name,
        phone: input.phone || null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        department: input.department,
        postalCode: input.postalCode || null,
        country: input.country || "CO",
        isDefault: input.isDefault || existingCount === 0
      }
    });
  },

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new AppError("Dirección no encontrada", 404);
    }

    await prisma.userAddress.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const nextAddress = await prisma.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });
      if (nextAddress) {
        await prisma.userAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return { message: "Dirección eliminada" };
  },

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new AppError("Dirección no encontrada", 404);
    }

    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    return prisma.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true }
    });
  }
};
