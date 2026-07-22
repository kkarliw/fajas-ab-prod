const fs = require('fs');
const catalog = require('./rawCatalog.json');

const categories = [
  { name: 'Brasieres', slug: 'brasieres', description: 'Brasieres postoperatorios y de uso diario' },
  { name: 'Shorts', slug: 'shorts', description: 'Shorts levanta glúteos y moldeadores' },
  { name: 'Cinturillas', slug: 'cinturillas', description: 'Cinturillas de alta compresión' },
  { name: 'Fajas', slug: 'fajas', description: 'Fajas moldeadoras y postoperatorias' },
  { name: 'Accesorios', slug: 'accesorios', description: 'Tablas, espumas y accesorios postquirúrgicos' },
];

let seedCode = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ${JSON.stringify(categories, null, 2)};

const products = ${JSON.stringify(catalog, null, 2)};

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: 'active',
      },
    });
  }

  console.log('Seeding products...');
  for (const prod of products) {
    const category = await prisma.category.findUnique({ where: { slug: prod.category.toLowerCase() } });
    if (!category) continue;

    // Build the description with bullets
    let fullDescription = prod.description;
    if (prod.bullets && prod.bullets.length > 0) {
      fullDescription += '\\n\\nCaracterísticas:\\n- ' + prod.bullets.join('\\n- ');
    }

    const tagStr = prod.tag === 'Bestseller' ? 'bestseller' : prod.tag === 'Nuevo' ? 'new' : prod.tag === 'Sale' ? 'sale' : null;

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: fullDescription,
        categoryId: category.id,
        basePriceCents: prod.price * 100,
        compareAtPriceCents: prod.originalPrice ? prod.originalPrice * 100 : null,
        material: prod.material,
        controlLevel: prod.control,
        uses: prod.uses,
        tag: tagStr,
        status: 'published',
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: fullDescription,
        categoryId: category.id,
        basePriceCents: prod.price * 100,
        compareAtPriceCents: prod.originalPrice ? prod.originalPrice * 100 : null,
        material: prod.material,
        controlLevel: prod.control,
        uses: prod.uses,
        tag: tagStr,
        status: 'published',
      },
    });

    // Handle Variants
    if (!prod.sizes || prod.sizes.length === 0) prod.sizes = ["Única"];
    if (!prod.colors || prod.colors.length === 0) prod.colors = ["Único"];
    
    const currentSkus = [];
    
    for (const size of prod.sizes) {
      for (const color of prod.colors) {
        const sku = \`\${prod.slug}-\${size}-\${color}\`.toUpperCase();
        currentSkus.push(sku);
        await prisma.productVariant.upsert({
          where: { sku },
          update: {
            size,
            colorName: color,
            priceCents: prod.price * 100,
          },
          create: {
            productId: createdProduct.id,
            sku,
            size,
            colorName: color,
            priceCents: prod.price * 100,
            stock: 10,
            status: 'active',
          },
        });
      }
    }

    // Handle Images
    await prisma.productImage.deleteMany({
      where: { productId: createdProduct.id }
    });

    let images = [];
    if (prod.gallery && prod.gallery.length > 0) {
      images = prod.gallery;
    } else if (prod.image) {
      images = [prod.image];
    } else {
      images = ['https://via.placeholder.com/600'];
    }

    for (let i = 0; i < images.length; i++) {
      let url = images[i];
      if (url && url.startsWith('@/assets/')) {
        url = url.replace('@/assets/', '/src/assets/');
      }
      
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: url || 'https://via.placeholder.com/600',
          alt: \`\${prod.name} - Imagen \${i + 1}\`,
          sortOrder: i,
          isPrimary: i === 0,
        }
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

fs.writeFileSync('prisma/seed.ts', seedCode);
console.log('Done writing seed.ts');
