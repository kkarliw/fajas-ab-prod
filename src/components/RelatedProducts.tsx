import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { formatCOP } from "@/context/CartContext";

const RelatedProducts = ({ currentSlug }: { currentSlug?: string }) => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["relatedProducts", currentSlug],
    queryFn: async () => {
      if (!currentSlug) return [];
      const res = await api.products.getRelated(currentSlug);
      return res || [];
    },
    enabled: !!currentSlug
  });

  if (isLoading || items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">
            Curado para ti
          </p>
          <h2
            id="related-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
          >
            También te puede interesar
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.slice(0, 4).map((product, i) => (
            <motion.article
              key={product.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group"
            >
              <Link to={`/product/${product.slug}`} className="block">
                <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-cream-dark">
                  <img
                    src={product.images?.[0]?.url || ""}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 font-semibold">
                      {product.tag}
                    </span>
                  )}
                  <button
                    onClick={(e) => e.preventDefault()}
                    aria-label={`Marcar ${product.name} como favorito`}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm text-foreground hover:text-gold transition-colors"
                  >
                    <Heart size={16} />
                  </button>
                </div>
              </Link>
              <h3 className="font-display text-sm font-semibold tracking-wide">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium tabular-nums">{formatCOP(product.priceCents / 100)}</span>
                {product.compareAtPriceCents && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatCOP(product.compareAtPriceCents / 100)}
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
