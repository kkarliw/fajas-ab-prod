type SkeletonVariant = "text" | "card" | "image" | "circle";

type SkeletonProps = {
  variant?: SkeletonVariant;
  className?: string;
};

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-none",
  card: "h-32 w-full rounded-none",
  image: "aspect-[3/4] w-full rounded-none",
  circle: "rounded-full",
};

const Skeleton = ({ variant = "text", className = "" }: SkeletonProps) => {
  return <div aria-hidden className={`animate-pulse bg-muted ${variantClasses[variant]} ${className}`} />;
};

export default Skeleton;
