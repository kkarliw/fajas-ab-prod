import { prisma } from "../src/lib/prisma.js";

const initialTestimonials = [
  { name: "Milena Gómez", rating: 5, content: "La faja Ariadna es de otro mundo. Cómoda, no se marca en la ropa y comprime justo lo necesario. ¡Súper recomendada!", status: "approved" as const, source: "store" },
  { name: "Sandra V.", rating: 5, content: "Excelente atención por WhatsApp y la calidad de las prendas es impecable. El bra Emy es súper suave para el postquirúrgico.", status: "approved" as const, source: "store" },
  { name: "Valentina Restrepo", rating: 5, content: "Llegó súper rápido a Medellín. La tabla abdominal y la faja me ayudaron muchísimo en mi recuperación. 10/10.", status: "approved" as const, source: "store" },
  { name: "Carolina Mendoza", rating: 5, content: "Increíble la calidad del Powernet. Llevo 3 meses usándola a diario y conserva su compresión firme como el primer día.", status: "approved" as const, source: "store" },
  { name: "Diana Paola Ortiz", rating: 5, content: "El diseño levanta glúteos de la faja es espectacular. Moldea una silueta increíble sin lastimar.", status: "approved" as const, source: "store" },
  { name: "María Fernanda R.", rating: 5, content: "Compré la cinturilla y el bra postquirúrgico. La atención al cliente me asesoró perfectamente con la talla antes de comprar.", status: "approved" as const, source: "store" }
];

async function main() {
  const existing = await prisma.testimonial.findMany();
  console.log(`Current testimonials in DB: ${existing.length}`);
  
  if (existing.length === 0) {
    for (const t of initialTestimonials) {
      await prisma.testimonial.create({ data: t });
    }
    console.log("Successfully seeded 6 approved initial testimonials into DB!");
  } else {
    console.log("Testimonials already exist in database.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
