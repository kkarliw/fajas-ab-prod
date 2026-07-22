import Skeleton from "@/components/ui/Skeleton";

const ProductCardSkeleton = () => {
  return (
    <article className="product-card group relative">
      <div className="block relative overflow-hidden bg-cream-2 aspect-[3/4]">
        <Skeleton variant="image" className="absolute inset-0" />
        <Skeleton variant="text" className="absolute top-3 left-3 h-5 w-20 bg-cream/70" />
        <Skeleton variant="circle" className="absolute top-3 right-3 w-8 h-8 bg-cream/70" />
        <div className="quick-cta absolute inset-x-3 bottom-3">
          <Skeleton variant="text" className="h-8 w-full bg-cream/80" />
        </div>
      </div>
      <div className="pt-4 pb-2 text-center space-y-2">
        <Skeleton variant="text" className="h-3 w-3/4 mx-auto" />
        <div className="flex items-baseline justify-center gap-2">
          <Skeleton variant="text" className="h-5 w-24" />
        </div>
      </div>
    </article>
  );
};

export default ProductCardSkeleton;
