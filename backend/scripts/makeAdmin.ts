import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    });

    if (!user) {
      console.log(`User with email ${email} not found. Creating a new admin account...`);
      // Hash a default password: "adminpassword123"
      const passwordHash = await bcrypt.hash("adminpassword123", 12);

      user = await prisma.user.create({
        data: {
          email,
          name: "Admin User",
          passwordHash,
          roleId: adminRole.id,
        },
      });
      console.log(`Created new admin account!`);
      console.log(`Email: ${email}`);
      console.log(`Password: adminpassword123`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { roleId: adminRole.id },
      });
      console.log(`Successfully made existing user ${email} an admin!`);
    }
    console.log("You may need to log out and log back in to get a new token.");
  } catch (error) {
    console.error("Error making admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Please provide an email address.");
  console.error("Usage: npx tsx scripts/makeAdmin.ts <email>");
  process.exit(1);
}

makeAdmin(email);
