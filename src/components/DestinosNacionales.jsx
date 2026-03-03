
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PackageCard from './PackageCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const DestinosNacionales = () => {
  const navigate = useNavigate();
  const [domesticPackages, setDomesticPackages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*, destination:destinations!inner(*)')
          .eq('destination.category', 'domestic')
          .order('created_at', { ascending: false });

        console.log('DestinosNacionales - initial query result', { data, error });

        if (!error && data && data.length > 0) {
          setDomesticPackages(data);
        } else {
          if (error) console.warn('DestinosNacionales - query error:', error);
          // Fallback: intentar obtener todos los planes sin filtrar por relación
          try {
            const { data: allData, error: allError } = await supabase
              .from('plans')
              .select('*, destination:destinations!inner(*)')
              .order('created_at', { ascending: false });
            console.log('DestinosNacionales - fallback query result', { allData, allError });
            if (!allError && allData) setDomesticPackages(allData);
          } catch (fallbackErr) {
            console.error('DestinosNacionales - fallback error:', fallbackErr);
          }
        }
      } catch (err) {
        console.error('Error fetching national plans:', err);
      }
      setLoading(false);
    };

    fetchPlans();

    const channel = supabase.channel('national-plans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, fetchPlans)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destinations' }, fetchPlans)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const itemsPerPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const maxIndex = Math.max(0, domesticPackages.length - itemsPerPage);

  const goToPrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  const handlePackageClick = (packageId) => {
    navigate(`/package/${packageId}`);
  };

  return (
    <section id="destinos-nacionales" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Destinos Nacionales
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre la belleza de Colombia con nuestros paquetes turísticos
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : domesticPackages.length === 0 ? (
          <div className="text-center text-muted-foreground">No hay paquetes disponibles en este momento.</div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {domesticPackages.slice(currentIndex, currentIndex + itemsPerPage).map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      package={{
                        id: pkg.id,
                        name: pkg.destination?.name || pkg.name,
                        image: pkg.destination?.image_url || '',
                        duration: `${pkg.duration_days} Días, ${pkg.duration_nights} Noches`,
                        price: pkg.price ? pkg.price.toLocaleString('es-CO') : '0',
                        currency: pkg.currency
                      }}
                      onClick={() => handlePackageClick(pkg.id)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {currentIndex > 0 && (
              <Button
                onClick={goToPrevious}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white shadow-lg hover:bg-gray-50 rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {currentIndex < maxIndex && (
              <Button
                onClick={goToNext}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white shadow-lg hover:bg-gray-50 rounded-full w-12 h-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinosNacionales;
