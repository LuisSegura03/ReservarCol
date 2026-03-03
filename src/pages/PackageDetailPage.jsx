
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/customSupabaseClient';

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('plans')
          .select('*, destination:destinations(*)')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching plan:', fetchError);
          setError(fetchError.message || 'Error al cargar el plan');
          setPkg(null);
        } else if (data) {
          setPkg(data);
          setError(null);
        } else {
          setPkg(null);
          setError('Plan no encontrado');
        }
      } catch (err) {
        console.error('Unexpected error fetching plan:', err);
        setError(err.message || 'Error inesperado');
        setPkg(null);
      }
      setLoading(false);
    };

    if (id) fetchPlan();
  }, [id]);

  const handleSelectPlan = () => {
    toast({
      title: "¡Funcionalidad en desarrollo! 🚧",
      description: "Esta característica estará disponible pronto. Por favor, contacta con nosotros para reservar.",
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Paquete no encontrado</h1>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{pkg.name} - Reservar Colombia</title>
        <meta
          name="description"
          content={`Descubre nuestro paquete a ${pkg.name} - ${pkg.duration}. ${pkg.currency === 'COP' ? `Desde $${pkg.price} COP` : `Desde $${pkg.price} USD`} por persona.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img
            src={pkg.destination?.image_url || pkg.image || ''}
            alt={pkg.destination?.name || pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">{pkg.destination?.name || pkg.name}</h1>
              <p className="text-xl md:text-2xl text-white/90">{pkg.duration_days ? `${pkg.duration_days} Días, ${pkg.duration_nights} Noches` : pkg.duration}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Incluye</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(pkg.inclusions || []).map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-destructive">No Incluye</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(pkg.exclusions || []).map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                            <X className="w-3 h-3 text-destructive" />
                          </div>
                        </div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Condiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(pkg.conditions || (pkg.terms_conditions ? [pkg.terms_conditions] : [])).map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary font-bold">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl">
                <CardHeader className="bg-primary text-white rounded-t-lg">
                  <CardTitle className="text-3xl font-bold">
                    {pkg.currency === 'COP' ? `$${pkg.price} COP` : `$${pkg.price} USD`}
                  </CardTitle>
                  <p className="text-white/90">Por persona en acomodación doble</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="font-semibold">{pkg.duration}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Destino</p>
                    <p className="font-semibold">{pkg.name}</p>
                  </div>
                  <Button
                    onClick={handleSelectPlan}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-lg py-6"
                  >
                    Seleccionar Plan
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Al hacer clic, te contactaremos para procesar tu reserva
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PackageDetailPage;
