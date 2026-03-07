import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Building, Utensils, Car, Map, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const PackageCard = ({ package: pkg, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const serviceIcons = [
    { icon: Plane, label: 'Vuelos' },
    { icon: Building, label: 'Hotel' },
    { icon: Utensils, label: 'M. Pensión' },
    { icon: Car, label: 'Traslados' },
    { icon: Map, label: 'Tour' },
    { icon: Shield, label: 'Seguro' }
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-[#0d9488] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full" onClick={onClick}>
        <div className="relative h-64 overflow-hidden">
          
          {/* Skeleton mientras carga */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-teal-700 animate-pulse" />
          )}

          <img
            src={`${pkg.image}?w=400&q=60&auto=format&fit=crop`}
            alt={pkg.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
            {pkg.name}
          </h3>
        </div>
        <CardContent className="p-6 space-y-4 bg-[#0d9488]">
          <div className="space-y-2">
            <p className="text-sm text-white/90">{pkg.duration}</p>
            <p className="text-2xl font-bold text-white">
              {pkg.currency === 'COP' ? `$${pkg.price} COP` : `$${pkg.price} USD`}
            </p>
            <p className="text-xs text-white/80">Por persona en acomodación doble</p>
          </div>

          <div className="grid grid-cols-6 gap-2 py-4">
            {serviceIcons.map(({ icon: Icon, label }, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-center text-white/80">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-white text-teal-600 hover:bg-white/90 font-semibold">
            Ver Detalles
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PackageCard;