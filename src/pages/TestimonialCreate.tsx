import { useMemo, useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/api";

const TestimonialCreate = () => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = useMemo(() => name.trim().length >= 2 && city.trim().length >= 2 && comment.trim().length >= 10, [name, city, comment]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    
    try {
      const formattedName = city.trim() ? `${name.trim()} - ${city.trim()}` : name.trim();
      await api.testimonials.createTestimonial({
        name: formattedName,
        rating: rating,
        content: comment.trim()
      });
      setDone(true);
      setName("");
      setCity("");
      setComment("");
      setRating(5);
    } catch (err: any) {
      // Error handling can be added here
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 px-4 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">
              Testimonios
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Nos encanta escucharte
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto sm:mx-0">
              Déjanos una reseña aquí mismo para publicarla en nuestra tienda, o si prefieres, escríbenos directamente en Google para ayudarnos a crecer.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
              <a href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-border shadow-sm rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Déjanos una reseña en Google
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-background border border-border p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-3">
                Tu calificación
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    aria-label={`Calificar con ${i + 1} estrellas`}
                    className="p-1"
                  >
                    <Star
                      size={22}
                      className={i < rating ? "fill-gold text-gold" : "text-border"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
                  Ciudad
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="Bogotá, Medellín..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
                Comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground resize-none"
                placeholder="Cuéntanos qué te gustó de tu prenda..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="inline-flex items-center gap-2 bg-gold text-ink px-8 py-3 text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-gold/85 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitting ? "Guardando..." : "Publicar testimonio"}
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-border px-8 py-3 text-[11px] tracking-[0.25em] uppercase font-semibold text-foreground hover:bg-cream-dark transition-colors"
              >
                Volver a inicio
              </Link>
            </div>

            {done && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 size={16} className="text-gold" />
                Tu testimonio quedó guardado.
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestimonialCreate;
