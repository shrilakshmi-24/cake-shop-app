'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarouselProps {
    images: string[];
}

export function Carousel({ images }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-6xl group-hover:scale-110 transition-transform duration-300">
                🎂
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="relative w-full h-full">
                <Image
                    src={images[0]}
                    alt="Cake Preview"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
        );
    }

    const next = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full h-full group/carousel">
            <Image
                src={images[currentIndex]}
                alt={`Cake Preview ${currentIndex + 1}`}
                fill
                className="object-cover transition-all duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Controls (visible on hover) */}
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button
                    onClick={prev}
                    className="w-8 h-8 rounded-full bg-white/80 backdrop-blur text-gray-800 flex items-center justify-center hover:bg-white shadow-sm"
                >
                    &larr;
                </button>
                <button
                    onClick={next}
                    className="w-8 h-8 rounded-full bg-white/80 backdrop-blur text-gray-800 flex items-center justify-center hover:bg-white shadow-sm"
                >
                    &rarr;
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
