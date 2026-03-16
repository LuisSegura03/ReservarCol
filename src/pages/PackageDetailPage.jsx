
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, X, Plus, Minus } from 'lucide-react';
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passengers: 1,
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passengers: '',
  });

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
    setIsSheetOpen(true);
  };

  const parsePrice = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/\./g, '').replace(/,/g, '.');
    const n = Number(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const formatPrice = (value, currency) => {
    const n = parsePrice(value);
    if (currency === 'COP') return `$${n.toLocaleString('es-CO')} COP`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency || ''}`;
  };

  const unitPrice = parsePrice(pkg?.price);
  const totalPrice = unitPrice * (Number(form.passengers) || 1);

  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return value && String(value).trim().length > 0 ? '' : 'Este campo es obligatorio';
      case 'email': {
        const v = String(value || '').trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        return ok ? '' : 'Correo inválido';
      }
      case 'phone': {
        const v = String(value || '').trim();
        const ok = v.length >= 7; // simple length check
        return ok ? '' : 'Teléfono inválido';
      }
      case 'passengers': {
        const n = Number(value || 0);
        return n >= 1 ? '' : 'Al menos 1 pasajero';
      }
      default:
        return '';
    }
  };

  const handleFormChange = (field, val) => {
    const newVal = field === 'passengers' ? Math.max(1, Number(val || 1)) : val;
    const newForm = { ...form, [field]: newVal };
    setForm(newForm);
    // validate this field
    setErrors(prev => ({ ...prev, [field]: validateField(field, newVal) }));
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.keys(form).forEach((k) => {
      nextErrors[k] = validateField(k, form[k]);
    });
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handlePay = async () => {
    // 1. Calculate taxes (assuming 19% VAT)
    const VAT_RATE = 0.19;
    const baseAmount = Math.round(totalPrice / (1 + VAT_RATE));
    const taxValue = totalPrice - baseAmount;

    // 2. Generate reference
    const randomSuffix = Math.floor(Math.random() * 100);
    const reference = `${form.firstName.toUpperCase()}${form.phone}${randomSuffix}`;

    // 3. Construct the payload for the API
    const payload = {
      amount_type: "CLOSE",
      amount: {
        currency: pkg.currency,
        taxes: [
          {
            type: "VAT",
            base: baseAmount,
            value: taxValue,
          },
        ],
        tip_amount: 0,
        total_amount: totalPrice,
      },
      reference: reference,
      description: pkg.name,
      image_url: "https://reservarcolombia.com/assets/Logo-vo49VPOB.png",
    };

    // For now, we just log the payload to the console.
    // In a real scenario, you would make an API call here.
    console.log('Generated Payload for API:', payload);

    toast({
      title: 'Información de pago generada',
      description: 'Revisa la consola del navegador para ver el objeto JSON.',
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
          content={`Descubre nuestro paquete a ${pkg.name} - ${pkg.duration}. ${pkg.currency === 'COP' ? `Desde ${formatPrice(pkg.price, pkg.currency)}` : `Desde ${formatPrice(pkg.price, pkg.currency)}`} por persona.`}
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
                    {formatPrice(pkg.price, pkg.currency)}
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
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="max-w-md">
            <SheetHeader>
              <SheetTitle>Reservar — {pkg.destination?.name || pkg.name}</SheetTitle>
            </SheetHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input value={form.firstName} onChange={e => handleFormChange('firstName', e.target.value)} placeholder="Nombre" />
                {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Apellido</label>
                <Input value={form.lastName} onChange={e => handleFormChange('lastName', e.target.value)} placeholder="Apellido" />
                {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Teléfono</label>
                <Input
                  value={form.phone}
                  onChange={e => handleFormChange('phone', (e.target.value || '').toString().replace(/\D/g, ''))}
                  onPaste={(e) => {
                    const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
                    const digits = pasted.replace(/\D/g, '');
                    e.preventDefault();
                    handleFormChange('phone', digits);
                  }}
                  placeholder="3000000000"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Correo electrónico</label>
                <Input value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="correo@ejemplo.com" type="email" />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Cantidad de personas</label>
                <div className="inline-flex items-center rounded-md border bg-white">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormChange('passengers', Math.max(1, Number(form.passengers) - 1))}
                    aria-label="Disminuir pasajeros"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="px-4 py-2 min-w-[56px] text-center font-semibold">{form.passengers}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFormChange('passengers', Number(form.passengers) + 1)}
                    aria-label="Aumentar pasajeros"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Precio por persona</div>
                  <div className="font-semibold">{formatPrice(unitPrice, pkg.currency)}</div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-muted-foreground">Total ({form.passengers} pax)</div>
                  <div className="text-xl font-bold">{formatPrice(totalPrice, pkg.currency)}</div>
                </div>
              </div>
            </div>

            <SheetFooter>
              <div className="w-full flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                {/** disable pay if form invalid or missing required fields */}
                <Button
                  className="flex-1 bg-primary text-white"
                  onClick={() => {
                    const ok = validateForm();
                    if (!ok) {
                      toast({ title: 'Corrige los errores', description: 'Por favor completa correctamente el formulario.', variant: 'destructive' });
                      return;
                    }
                    handlePay();
                  }}
                  disabled={Object.values(errors).some(Boolean) || !form.firstName || !form.lastName || !form.email}
                >
                  Pagar
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default PackageDetailPage;
