import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testimonials = [
    {
      name: "MARÍA CAMILA R.",
      rating: 5,
      content: "La calidad es incomparable. Llevo 6 meses usándola a diario y sigue como nueva. Moldea sin incomodar, es como una segunda piel.",
      source: "store",
      status: "approved"
    },
    {
      name: "VALENTINA T.",
      rating: 5,
      content: "Por fin una faja que no se enrolla ni aprieta de más. Diseño impecable y la atención de AB fue excepcional.",
      source: "store",
      status: "approved"
    },
    {
      name: "SARA M.",
      rating: 5,
      content: "La uso después de mi cirugía y la diferencia se siente desde el primer día. Cómoda, firme y con un acabado de lujo.",
      source: "store",
      status: "approved"
    }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t
    });
  }
  
  console.log("Testimonials seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
