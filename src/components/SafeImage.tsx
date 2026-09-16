import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: string;
  fallbackSrc?: string;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  'FinCommerce Hardware': 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=85',
  'Smart Tech & Sound': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=85',
  'Artisanal & Handloom': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&auto=format&fit=crop&q=85',
  'Workspace & Ergonomics': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85',
  'Organics & Superfoods': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=85',
  default: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=85',
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackCategory,
  fallbackSrc,
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      const fallback =
        fallbackSrc ||
        (fallbackCategory && CATEGORY_FALLBACKS[fallbackCategory]) ||
        CATEGORY_FALLBACKS.default;
      setImgSrc(fallback);
    }
    if (onError) onError(e);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center">
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse" />
      )}
      <img
        {...props}
        src={imgSrc}
        alt={alt || 'Product image'}
        loading={props.loading || 'lazy'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
