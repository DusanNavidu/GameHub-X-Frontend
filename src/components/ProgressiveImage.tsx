import { useState } from "react";

interface ProgressiveImageProps {
  lowResSrc: string;
  highResSrc: string;
  alt: string;
  className?: string;
}

export default function ProgressiveImage({ lowResSrc, highResSrc, alt, className = "" }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 🔴 Low Quality Image (Blur වෙලා පෙන්වයි) */}
      <img
        src={lowResSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
          isLoaded ? "opacity-0" : "opacity-100"
        } blur-md scale-105`}
      />
      
      {/* 🟢 High Quality Image (Load වුණාට පස්සේ මතුවේ) */}
      <img
        src={highResSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`relative w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}