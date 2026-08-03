import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function ensureAdminUsers() {
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const { prisma } = await import("./lib/prisma.js");

    let adminRole = await prisma.role.findFirst({ where: { name: "admin" } });
    if (!adminRole) {
      adminRole = await prisma.role.create({ data: { name: "admin" } });
    }

    const hash = await bcrypt.hash("FajasAB2026!", 12);
    const adminEmails = ["fajasabcol@gmail.com", "admin@fajasab.com"];

    for (const email of adminEmails) {
      await prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: hash,
          roleId: adminRole.id,
          emailVerifiedAt: new Date()
        },
        create: {
          email,
          name: "Administrador FAJAS AB",
          passwordHash: hash,
          roleId: adminRole.id,
          emailVerifiedAt: new Date()
        }
      });
    }
    console.log("✅ Admin users ensured successfully.");
  } catch (err) {
    console.error("⚠️ Failed to ensure admin users:", err);
  }
}

async function ensureInitialTestimonials() {
  try {
    const { prisma } = await import("./lib/prisma.js");
    const count = await prisma.testimonial.count();
    if (count === 0) {
      const initialTestimonials = [
        { name: "Milena Gómez", rating: 5, content: "La faja Ariadna es de otro mundo. Cómoda, no se marca en la ropa y comprime justo lo necesario. ¡Súper recomendada!", status: "approved" as const, source: "store" },
        { name: "Sandra V.", rating: 5, content: "Excelente atención por WhatsApp y la calidad de las prendas es impecable. El bra Emy es súper suave para el postquirúrgico.", status: "approved" as const, source: "store" },
        { name: "Valentina Restrepo", rating: 5, content: "Llegó súper rápido a Medellín. La tabla abdominal y la faja me ayudaron muchísimo en mi recuperación. 10/10.", status: "approved" as const, source: "store" },
        { name: "Carolina Mendoza", rating: 5, content: "Increíble la calidad del Powernet. Llevo 3 meses usándola a diario y conserva su compresión firme como el primer día.", status: "approved" as const, source: "store" },
        { name: "Diana Paola Ortiz", rating: 5, content: "El diseño levanta glúteos de la faja es espectacular. Moldea una silueta increíble sin lastimar.", status: "approved" as const, source: "store" },
        { name: "María Fernanda R.", rating: 5, content: "Compré la cinturilla y el bra postquirúrgico. La atención al cliente me asesoró perfectamente con la talla antes de comprar.", status: "approved" as const, source: "store" }
      ];
      for (const t of initialTestimonials) {
        await prisma.testimonial.create({ data: t });
      }
      console.log("✅ Initial approved testimonials ensured in database.");
    }
  } catch (err) {
    console.error("⚠️ Failed to ensure initial testimonials:", err);
  }
}

await ensureAdminUsers();
await ensureInitialTestimonials();

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

