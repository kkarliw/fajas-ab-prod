const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_REVIEWS = [
  {
    content: 'La calidad es incomparable. Llevo 6 meses usándola a diario y sigue como nueva. Moldea sin incomodar, es como una segunda piel.',
    name: 'MARÍA CAMILA R.',
    rating: 5,
    source: 'store',
    status: 'approved'
  },
  {
    content: 'Por fin una faja que no se enrolla ni aprieta de más. Diseño impecable y la atención de AB fue excepcional.',
    name: 'VALENTINA T.',
    rating: 5,
    source: 'store',
    status: 'approved'
  },
  {
    content: 'La uso después de mi cirugía y la diferencia se siente desde el primer día. Cómoda, firme y con un acabado de lujo.',
    name: 'SARA M.',
    rating: 5,
    source: 'store',
    status: 'approved'
  }
];

async function run() {
  for (const review of DEFAULT_REVIEWS) {
    const exists = await prisma.testimonial.findFirst({ where: { name: review.name, content: review.content } });
    if (!exists) {
      await prisma.testimonial.create({ data: review });
    }
  }
  console.log('Seeded successfully!');
}
run().finally(() => prisma.$disconnect());
