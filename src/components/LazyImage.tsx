import { useState } from "react";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

const LazyImage = ({ src, alt, className, style }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => setIsLoaded(true);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={handleLoad}
      style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.2s ease-out", ...style }}
    />
  );
};

export default LazyImage;
