
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BedSingle, CalendarDays, ChevronDown, DollarSign, Plane, Search, Utensils, Map, Shield, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const DestinosNacionales = () => {
  const navigate = useNavigate();
  const [domesticPackages, setDomesticPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState(null);
  const [isDaysOpen, setIsDaysOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // Filtrar paquetes según los criterios
  const filteredPackages = domesticPackages.filter(pkg => {
    const name = (pkg.destination?.name || pkg.name || '').toString().toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());

    const days = Number(pkg.duration_days ?? 0);
    const matchesDays = selectedDays == null ? true : days === selectedDays;

    const price = Number(pkg.price ?? 0);
    const matchesPrice = price <= maxPrice;
    
    return matchesSearch && matchesDays && matchesPrice;
  });

  useEffect(() => {
    if (!isPriceOpen && !isDaysOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPriceOpen(false);
        setIsDaysOpen(false);
      }
    };

    const onPointerDown = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-price-dropdown]')) return;
      if (target.closest('[data-days-dropdown]')) return;
      setIsPriceOpen(false);
      setIsDaysOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isPriceOpen, isDaysOpen]);

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
            if (!allError && allData) {
              setDomesticPackages(allData.filter((pkg) => pkg.destination?.category === 'domestic'));
            }
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

  const handlePackageClick = (packageId) => {
    navigate(`/package/${packageId}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDays(null);
    setMaxPrice(2500000);
    setIsPriceOpen(false);
    setIsDaysOpen(false);
  };

  const isFiltering = searchTerm.trim().length > 0 || selectedDays != null || maxPrice !== 2500000;

  const DestinationCardContent = ({ pkg }) => (
    <>
      <div className="relative h-80 overflow-hidden rounded-t-2xl">
        <img
          src={pkg.destination?.image_url || 'https://images.unsplash.com/photo-1556490042-e06478661fa0'}
          alt={pkg.destination?.name || pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 shadow-[inset_0_18px_22px_rgba(0,0,0,0.28)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2">
          <Sun className="w-4 h-4" />
          <span className="text-xs font-semibold">4</span>
          <Moon className="w-4 h-4" />
          <span className="text-xs font-semibold">3</span>
        </div>

        <div className="absolute left-4 bottom-16">
          <div className="text-2xl font-bold text-white leading-tight">
            {pkg.destination?.name || pkg.name}
          </div>
          <div className="text-2xl font-semibold text-white mt-2">
            {pkg.price ? pkg.price.toLocaleString('es-CO') : '0'} <span className="text-sm font-semibold text-white/90">COP</span>
          </div>
          <div className="text-sm font-semibold text-white/70 mt-1">
            por persona
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-white/80">
              <BedSingle className="w-4 h-4" />
              <span className="text-xs">Hotel</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Utensils className="w-4 h-4" />
              <span className="text-xs">Comida</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Map className="w-4 h-4" />
              <span className="text-xs">Tour</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Seguro</span>
            </div>
          </div>
        </div>

        <div className="absolute left-3 right-3 bottom-3">
          <button
            type="button"
            className="group inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-teal-600 text-black hover:text-white px-4 py-2 text-sm font-medium transition-colors w-full"
            onClick={(e) => {
              e.stopPropagation();
              handlePackageClick(pkg.id);
            }}
          >
            Ver mas
            <span
              aria-hidden
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 border border-gray-200 group-hover:bg-white/20 group-hover:border-white/30 transition-colors"
            >
              →
            </span>
          </button>
        </div>
      </div>
    </>
  );

  const DestinationCard = ({ pkg }) => {
    const className =
      'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer';

    if (isFiltering) {
      return (
        <div className={className} onClick={() => handlePackageClick(pkg.id)}>
          <DestinationCardContent pkg={pkg} />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
        onClick={() => handlePackageClick(pkg.id)}
      >
        <DestinationCardContent pkg={pkg} />
      </motion.div>
    );
  };

  return (
    <section id="destinos-nacionales" className="py-16 bg-emerald-50/40">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Destinos Nacionales</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Conoce nuestros destinos y paquetes a nivel nacional
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <div className="relative flex items-center w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="Busca tu Destino" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-4 pr-12 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="relative w-full md:w-auto" data-days-dropdown>
            <button
              type="button"
              onClick={() => setIsDaysOpen((v) => !v)}
              className="w-full md:w-[150px] bg-teal-600 text-white py-3 px-4 rounded-full flex items-center justify-between gap-3 hover:bg-teal-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {selectedDays == null ? 'Días' : `${selectedDays} Días`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDaysOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute right-0 mt-3 w-full md:w-[260px] bg-white border border-gray-200 shadow-xl rounded-2xl p-4 z-10 origin-top transition-all duration-200 ${
                isDaysOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Días</div>
                <button
                  type="button"
                  onClick={() => setSelectedDays(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={selectedDays ?? 2}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="mt-3 text-sm text-gray-600">
                Seleccionado: <span className="font-semibold">{selectedDays ?? 2} días</span>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-auto" data-price-dropdown>
            <button
              type="button"
              onClick={() => setIsPriceOpen((v) => !v)}
              className="w-full md:w-[190px] bg-teal-600 text-white py-3 px-4 rounded-full flex items-center justify-between gap-3 hover:bg-teal-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {maxPrice.toLocaleString('es-CO')}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute right-0 mt-3 w-full md:w-[260px] bg-white border border-gray-200 shadow-xl rounded-2xl p-4 z-10 origin-top transition-all duration-200 ${
                isPriceOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Precio máximo</div>
                <button
                  type="button"
                  onClick={() => {
                    setMaxPrice(2500000);
                    setIsPriceOpen(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={5000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="mt-3 text-sm text-gray-600">
                Hasta: <span className="font-semibold">${maxPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : domesticPackages.length === 0 ? (
          <div className="text-center text-muted-foreground">No hay paquetes disponibles en este momento.</div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center min-h-[260px]">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Plane className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-800">No se encontraron resultados</div>
            <div className="text-gray-500 mt-2 max-w-md">
              Intenta con otro destino o ajusta los filtros para ver más opciones.
            </div>
            <Button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-teal-600 hover:bg-teal-700 text-white px-8"
            >
              Buscar de nuevo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <DestinationCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinosNacionales;
