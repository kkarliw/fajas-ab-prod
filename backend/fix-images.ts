import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const images = await prisma.productImage.findMany();
  let updated = 0;
  for (const img of images) {
    if (img.url.startsWith('/src/assets/')) {
      const newUrl = img.url.replace('/src/assets/', '/assets/');
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} images.`);
}

run().finally(() => prisma.$disconnect());
