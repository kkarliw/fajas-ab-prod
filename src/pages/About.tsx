import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Award, Heart, Sparkles } from "lucide-react";
import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

// Group photoshoot campaign images
import groupPhoto2 from "@/assets/Fajas AB/fotos grupales/_A9A4461.jpg";
import groupPhoto3 from "@/assets/Fajas AB/fotos grupales/_A9A4476.jpg";
import groupPhoto4 from "@/assets/Fajas AB/fotos grupales/_A9A4578.jpg";
import groupPhoto5 from "@/assets/Fajas AB/fotos grupales/_A9A4843.jpg";

// Group photoshoot campaign videos
// Videos are served statically from /public/videos/ to avoid bundling large assets

const pillars = [
  { 
    t: "Diseño Inteligente", 
    d: "Diseño inteligente enfocado en el cuerpo real. Estructuras pensadas para moldear y acompañar de forma anatómica.",
    icon: Sparkles
  },
  { 
    t: "Tecnología y Materiales", 
    d: "Materiales de alto nivel y tecnología textil que garantizan frescura, alta compresión y cuidado de la piel.",
    icon: Shield
  },
  { 
    t: "Soporte Postquirúrgico", 
    d: "Enfoque en soporte postquirúrgico real para brindar seguridad y alivio en momentos donde el cuerpo más lo necesita.",
    icon: Award
  },
  { 
    t: "Experiencia Premium", 
    d: "Detalle, intención y acompañamiento en cada etapa de compra, porque entendemos que este producto es parte de tu proceso.",
    icon: Heart
  },
];

const About = () => (
  <div className="min-h-screen bg-cream">
    <Ticker />
    <Navbar />
    <PromoBar />

    {/* Hero Section with Looping Video Backdrop */}
    <section className="relative h-[80dvh] min-h-[500px] flex items-center justify-center overflow-hidden bg-ink text-ink-soft">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          src="/videos/736A9821.MP4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute min-w-[100dvh] min-h-[100vw] top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -rotate-90 origin-center opacity-30 filter brightness-90"
        />
      </div>
      
      {/* Centered Content */}
      <div className="container-luxe relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gold-light text-xs font-semibold tracking-[0.25em] uppercase mb-6"
        >
          NOSOTROS · FAJAS AB
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.02] text-ink-soft font-light"
        >
          Nuestra historia, <br />
          <span className="italic text-gold font-normal">nuestro propósito</span>.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 font-body text-[15px] sm:text-[17px] text-ink-soft/85 leading-relaxed max-w-2xl mx-auto font-medium"
        >
          Fajas Ab nace desde una necesidad real, no desde una tendencia.
        </motion.p>
      </div>
    </section>

    {/* Story Section */}
    <section className="border-b border-hairline bg-cream overflow-hidden">
      <div className="container-luxe py-20 lg:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">
        {/* Text Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-left"
        >
          <p className="eyebrow text-ink/50 mb-4">Nuestra Historia</p>
          <h2 className="font-display text-[36px] sm:text-[46px] leading-[1.08] text-ink mb-8">
            El origen de <br />
            <span className="italic text-gold font-normal">Fajas Ab</span>
          </h2>
          <div className="space-y-6 font-body text-[14px] text-ink/85 leading-relaxed">
            <p>
              Todo comenzó al ver de cerca los procesos postquirúrgicos: mujeres y hombres atravesando momentos delicados, donde el cuerpo necesita soporte, pero también seguridad, confianza y acompañamiento. Fue ahí donde entendimos algo clave: no se trataba solo de una faja, se trataba de cómo una persona se siente en su propio cuerpo durante su recuperación.
            </p>
            <p>
              Muchas opciones en el mercado cumplían una función básica, pero pocas realmente entendían la importancia de este proceso. Incomodidad, materiales de baja calidad y falta de asesoría eran parte de la experiencia… y eso no estaba bien.
            </p>
            <p className="font-medium text-ink">
              Decidimos crear una marca enfocada en elevar el estándar. Incorporamos tecnología de punta en nuestros diseños, materiales de alta calidad y estructuras pensadas no solo para moldear, sino para acompañar el proceso de recuperación de forma segura y cómoda.
            </p>
            <p>
              Cada faja está diseñada con un propósito: brindar soporte, mejorar la experiencia postquirúrgica y devolver la confianza en cada etapa del proceso.
            </p>
          </div>
        </motion.div>

        {/* Image Grid Collage */}
        <div className="relative flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="w-full max-w-[380px] aspect-[3/4] bg-cream-2 overflow-hidden border border-border/60 shadow-xl"
          >
            <img src={groupPhoto2} alt="Editorial Fajas AB" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </motion.div>
          
          {/* Overlapping small editorial shot */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="absolute -left-4 -bottom-8 w-[180px] sm:w-[220px] aspect-[3/4] bg-cream border border-border/85 shadow-2xl hidden sm:block"
          >
            <img src={groupPhoto3} alt="Detalle Fajas AB" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </motion.div>
        </div>
      </div>
    </section>

    {/* Cinematic Full-Width Video Banner */}
    <section className="relative h-[65dvh] min-h-[450px] flex items-center justify-center overflow-hidden bg-ink text-ink-soft">
      <div className="absolute inset-0">
        <video 
          src="/videos/736A9821.MP4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute min-w-[100dvh] min-h-[100vw] top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -rotate-90 origin-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>
      
      <div className="container-luxe relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <span className="text-[10px] tracking-[0.3em] font-bold text-gold-light uppercase bg-gold-dark/45 px-4 py-1.5 border border-gold-light/20">
            ¿QUÉ NOS MOTIVÓ?
          </span>
          <h2 className="font-display text-[32px] sm:text-[44px] leading-tight text-ink-soft mt-6 font-light">
            Transformar una experiencia incómoda <br />
            <span className="italic text-gold font-normal">en una de cuidado.</span>
          </h2>
          <p className="mt-5 font-body text-[14px] sm:text-[15px] text-ink-soft/85 max-w-lg mx-auto leading-relaxed">
            Entendimos que detrás de cada compra hay una historia: una cirugía, un cambio, una decisión importante. Y queríamos estar a la altura de ese momento.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Pillars Section */}
    <section className="bg-cream-2 border-b border-hairline overflow-hidden">
      <div className="container-luxe py-20 lg:py-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="eyebrow text-ink/50 mb-3">DIFERENCIACIÓN</p>
          <h2 className="font-display text-[36px] sm:text-[46px] leading-tight text-ink">
            ¿Qué nos <span className="italic text-gold">diferencia</span>?
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline/15 border border-hairline/10">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div 
                key={p.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-cream-2 p-8 sm:p-10 flex flex-col justify-between hover:bg-cream transition-colors duration-500 group relative text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-ink-soft transition-all duration-300">
                    <Icon size={18} strokeWidth={1.2} />
                  </div>
                  <h3 className="font-display text-[22px] text-ink mb-3 group-hover:text-gold transition-colors">{p.t}</h3>
                  <p className="font-body text-[13px] text-ink/70 leading-relaxed">{p.d}</p>
                </div>
                <div className="mt-8 font-display text-gold/30 text-[32px] font-light leading-none group-hover:text-gold transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Editorial Split: Mission/Vision & Loop Video */}
    <section className="border-b border-hairline bg-cream overflow-hidden">
      <div className="container-luxe py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Vertical video loop + detail image overlay */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[3/4] w-full max-w-[450px] overflow-hidden relative"
          >
            <video 
              src="/videos/736A9843.MP4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute w-[180%] h-[180%] max-w-none top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover -rotate-90 origin-center"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20, y: -20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute right-4 lg:-right-6 -bottom-6 w-[200px] aspect-[4/5] bg-cream border border-border shadow-2xl overflow-hidden hidden sm:block"
          >
            <img src={groupPhoto4} alt="Prendas de alta costura" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </motion.div>
        </div>

        {/* Right Column: Mission and Vision in luxury text format */}
        <div className="space-y-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase mb-2 block">PROPÓSITO</span>
            <h3 className="font-display text-[28px] sm:text-[34px] text-ink leading-tight mb-4">Nuestra Misión</h3>
            <p className="font-body text-[14px] text-ink/75 leading-relaxed">
              Acompañar procesos de recuperación con fajas de alta calidad que brindan soporte, comodidad y confianza.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase mb-2 block">PROYECCIÓN</span>
            <h3 className="font-display text-[28px] sm:text-[34px] text-ink leading-tight mb-4">Nuestra Visión</h3>
            <p className="font-body text-[14px] text-ink/75 leading-relaxed">
              Ser una marca líder en fajas postquirúrgicas, reconocida por su innovación, calidad y enfoque en el bienestar del cliente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Final Call to Action Section with Large Editorial BG */}
    <section className="relative py-28 lg:py-36 bg-ink text-ink-soft overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={groupPhoto5} 
          alt="Campaña Fajas AB" 
          className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      </div>
      
      <div className="container-luxe relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="eyebrow text-gold-light/75 mb-6 block">¿QUÉ QUEREMOS QUE SIENTAS?</span>
          <h2 className="font-display text-[38px] sm:text-[54px] lg:text-[62px] leading-[1.08] text-ink-soft font-light">
            Queremos que recuperes <br />
            <span className="italic text-gold font-normal">tu confianza.</span>
          </h2>
          <p className="mt-6 font-body text-[14px] sm:text-[15px] text-ink-soft/75 max-w-md mx-auto leading-relaxed">
            Queremos que cuando recibas tu faja sientas tranquilidad. Que sientas que tomaste una buena decisión, que tu cuerpo está siendo cuidado y que estás usando un producto a la altura de tu proceso.
          </p>
          <div className="mt-12 flex justify-center">
            <Link 
              to="/shop" 
              className="inline-flex items-center justify-center bg-gold text-ink px-10 py-4 text-[11px] tracking-[0.22em] uppercase font-bold hover:bg-gold/90 transition-colors shadow-lg"
            >
              Explorar Colección <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;
