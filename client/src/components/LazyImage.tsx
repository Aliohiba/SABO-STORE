import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
}

export default function LazyImage({ src, alt, className = "", aspectRatio = "1/1" }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "50px",
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={`relative overflow-hidden bg-muted ${className}`} style={{ aspectRatio }}>
            {!isLoaded && (
                <div className="absolute inset-0 bg-muted/50 animate-pulse" />
            )}
            {isInView && (
                <motion.img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            )}
        </div>
    );
}
