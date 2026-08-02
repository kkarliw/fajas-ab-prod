import { Link } from "react-router-dom";
import { Heart, ImageOff } from "lucide-react";
import { useState } from "react";
import { CatalogProduct, formatCOP } from "@/data/catalog";
import LazyImage from "@/components/LazyImage";
import { getProductImageUrl } from "@/lib/utils";

const tagStyles: Record<string, string> = {
  bestseller: "bg-ink text-gold-light",
  new: "bg-gold text-ink",
  sale: "bg-[#8A3A2A] text-[#F0E0D0]",
  promo: "bg-pink-600 text-white",
  low_stock: "bg-orange-500 text-white",
};

const tagLabels: Record<string, string> = {
  bestseller: "Bestseller",
  new: "Nuevo",
  sale: "Sale",
  promo: "Promo Especial",
  low_stock: "Pocas Unidades",
};

const ProductCard = ({ product }: { product: CatalogProduct }) => {
  const [wished, setWished] = useState(false);
  const needsZoom = ["brasieres", "shorts", "accesorios", "cinturillas"].includes(product.category.toLowerCase());

  return (
    <article className="product-card group relative w-full">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden bg-cream-2 aspect-[2/3]">
        {product.name ? (
          <LazyImage
            src={getProductImageUrl(product.gallery?.[0] ?? product.image, product.slug)}
            alt={product.name}
            className={`product-image absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ${needsZoom ? "scale-[1.15] group-hover:scale-[1.20]" : "group-hover:scale-105"
              } ${product.isOutOfStock ? 'grayscale opacity-75' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/35 bg-cream-2">
            <ImageOff size={28} strokeWidth={1.4} />
            <span className="text-[10px] uppercase tracking-[0.18em]">Sin foto</span>
          </div>
        )}
        {product.isOutOfStock ? (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-[0.18em] font-body font-medium bg-red-600/90 text-white z-10">
            Agotado
          </span>
        ) : product.tag ? (
          <span
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-[0.18em] font-body font-medium z-10 ${tagStyles[product.tag] ?? "bg-ink text-ink-soft"
              }`}
          >
            {tagLabels[product.tag] ?? product.tag}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={(e) => {
            e.preventDefault();
            setWished((v) => !v);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 inline-flex items-center justify-center bg-cream/90 hover:bg-cream transition-colors z-10"
        >
          <Heart
            size={12}
            strokeWidth={1.4}
            className={`sm:w-3.5 sm:h-3.5 ${wished ? "fill-gold text-gold" : "text-ink"}`}
          />
        </button>
        <div className="quick-cta absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <span className={`block w-full text-center py-1.5 sm:py-2.5 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] font-body shadow-sm ${product.isOutOfStock ? 'bg-red-600/90 text-white' : 'bg-cream/95 text-ink'}`}>
            {product.isOutOfStock ? 'Agotado' : 'Ver producto'}
          </span>
        </div>
      </Link>
      <div className="pt-4 pb-2 text-center">
        <h3 className="text-[12px] uppercase tracking-[0.18em] font-body text-ink/85">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="font-display text-[18px] text-ink">{formatCOP(product.price)}</span>
          {product.originalPrice && (
            <span className="font-body text-[12px] text-ink/45 line-through">
              {formatCOP(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
