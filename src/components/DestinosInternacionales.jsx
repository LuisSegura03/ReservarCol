import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BedSingle,
  CalendarDays,
  ChevronDown,
  DollarSign,
  Plane,
  Search,
  Utensils,
  Map,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { supabase } from "@/lib/customSupabaseClient";

const DestinosInternacionales = () => {
  const navigate = useNavigate();

  const [internationalPackages, setInternationalPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDays, setSelectedDays] = useState(null);

  const [isDaysOpen, setIsDaysOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  /* ============================= */
  /* Debounce buscador */
  /* ============================= */

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
      }, 300),
    []
  );

  /* ============================= */
  /* Filtrar paquetes (memoizado) */
  /* ============================= */

  const filteredPackages = useMemo(() => {
    return internationalPackages.filter((pkg) => {
      const name = (pkg.destination?.name || pkg.name || "")
        .toString()
        .toLowerCase();

      const matchesSearch = name.includes(searchTerm.toLowerCase());

      const days = Number(pkg.duration_days ?? 0);
      const matchesDays = selectedDays == null ? true : days === selectedDays;

      const price = Number(pkg.price ?? 0);
      const matchesPrice = price <= maxPrice;

      return matchesSearch && matchesDays && matchesPrice;
    });
  }, [internationalPackages, searchTerm, selectedDays, maxPrice]);

  /* ============================= */
  /* Fetch Supabase optimizado */
  /* ============================= */

  const fetchPlans = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("plans")
      .select("*, destination:destinations(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const international = data.filter(
        (pkg) => pkg.destination?.category === "international"
      );

      setInternationalPackages(international);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel("international-plans-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plans" },
        fetchPlans
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "destinations" },
        fetchPlans
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchPlans]);

  /* ============================= */
  /* Callbacks */
  /* ============================= */

  const handlePackageClick = useCallback(
    (packageId) => {
      navigate(`/package/${packageId}`);
    },
    [navigate]
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedDays(null);
    setMaxPrice(5000000);
    setIsPriceOpen(false);
    setIsDaysOpen(false);
  }, []);

  const isFiltering =
    searchTerm.trim().length > 0 ||
    selectedDays != null ||
    maxPrice !== 5000000;

  /* ============================= */
  /* Card Content */
  /* ============================= */

  const DestinationCardContent = ({ pkg }) => (
    <div className="relative h-80 overflow-hidden rounded-t-2xl">
      <img
        src={
          pkg.destination?.image_url ||
          "https://images.unsplash.com/photo-1556490042-e06478661fa0"
        }
        alt={pkg.destination?.name || pkg.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

      <div className="absolute top-3 right-3 bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
        <Sun className="w-4 h-4" />
        <span className="text-xs font-semibold">4</span>
        <Moon className="w-4 h-4" />
        <span className="text-xs font-semibold">3</span>
      </div>

      <div className="absolute left-4 bottom-16">
        <div className="text-2xl font-bold text-white">
          {pkg.destination?.name || pkg.name}
        </div>

        <div className="text-2xl font-semibold text-white mt-2">
          {pkg.price ? pkg.price.toLocaleString("es-CO") : "0"} COP
        </div>

        <div className="text-sm text-white/80 mt-2 flex gap-4">
          <BedSingle className="w-4 h-4" />
          <Utensils className="w-4 h-4" />
          <Map className="w-4 h-4" />
          <Shield className="w-4 h-4" />
        </div>
      </div>

      <div className="absolute left-3 right-3 bottom-3">
        <button
          className="group inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-teal-600 text-black hover:text-white px-4 py-2 text-sm font-medium transition-colors w-full"
          onClick={(e) => {
            e.stopPropagation();
            handlePackageClick(pkg.id);
          }}
        >
          Ver más
          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            →
          </span>
        </button>
      </div>
    </div>
  );

  /* ============================= */
  /* Card optimizada */
  /* ============================= */

  const DestinationCard = React.memo(({ pkg }) => {
    const className =
      "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer";

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
  });

  /* ============================= */
  /* Render */
  /* ============================= */

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">

        <h2 className="text-4xl font-bold text-center mb-8">
          Destinos Internacionales
        </h2>

        {/* Search */}

        <div className="flex justify-center mb-10">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Busca tu destino"
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 pl-4 pr-12 rounded-full border"
            />

            <Search className="absolute right-4 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-b-2 border-teal-600 rounded-full"></div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              No se encontraron resultados
            </p>

            <Button
              onClick={resetFilters}
              className="mt-6 bg-teal-600 hover:bg-teal-700"
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

export default React.memo(DestinosInternacionales);