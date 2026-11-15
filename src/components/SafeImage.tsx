import { Radio } from 'lucide-react';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className = '', fallbackTitle }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-violet-950 via-[#1B1238] to-pink-950 p-4 text-center ${className}`}
      >
        <Radio className="mb-1.5 h-6 w-6 text-pink-400/80" />
        {fallbackTitle && (
          <span className="line-clamp-1 text-xs font-medium text-slate-200">{fallbackTitle}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
