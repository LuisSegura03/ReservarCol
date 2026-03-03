
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = () => {
  const images = [
    'https://images.unsplash.com/photo-1654023316125-0c3cbae6ed0b',
    'https://images.unsplash.com/photo-1556490042-e06478661fa0',
    'https://images.unsplash.com/photo-1564932995457-e929308c67c3',
    'https://images.unsplash.com/photo-1610885845692-9d4d879e905e'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="relative h-[600px] w-full rounded-3xl mt-8 px-12">
      <div className="relative h-full overflow-hidden rounded-3xl">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <img
              src={images[currentIndex]}
              alt={`Destino ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        <div className="absolute inset-0 flex flex-col items-start justify-end text-left pl-16 pr-8 pb-12">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4 max-w-md"
          >
            DESCUBRE<br /><span className="text-4xl md:text-5xl font-semibold">nuestros Destinos</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-md"
          >
            Convierte tus sueños en viajes inolvidables y deja que el mundo sea tu próximo destino.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg px-8 py-3 rounded-full"
              onClick={() => {
                document.getElementById('destinos-nacionales')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explora Paquetes
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
