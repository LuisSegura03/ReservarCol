import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/customSupabaseClient';

const BookingFlowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passengers: 1,
    departureDate: '',
    returnDate: '',
    originCity: '',
    numberOfAdults: 1,
    numberOfChildren: 0,
    childrenAges: '',
    specialRequirements: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passengers: '',
    departureDate: '',
    returnDate: '',
    originCity: '',
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
        const ok = v.length >= 7;
        return ok ? '' : 'Teléfono inválido';
      }
      case 'passengers': {
        const n = Number(value || 0);
        return n >= 1 ? '' : 'Al menos 1 pasajero';
      }
      case 'departureDate':
      case 'returnDate':
        return value ? '' : 'Esta fecha es obligatoria';
      case 'originCity':
        return value && String(value).trim().length > 0 ? '' : 'Ciudad de origen requerida';
      default:
        return '';
    }
  };

  const handleFormChange = (field, val) => {
    let newVal = val;
    
    if (field === 'numberOfAdults') {
      newVal = Math.max(1, Number(val));
    } else if (field === 'numberOfChildren') {
      newVal = Math.max(0, Number(val));
    }
    
    const newForm = { ...form, [field]: newVal };

    // Actualizar total de pasajeros
    if (field === 'numberOfAdults' || field === 'numberOfChildren') {
        newForm.passengers = Number(newForm.numberOfAdults) + Number(newForm.numberOfChildren);
    }
    
    setForm(newForm);
    setErrors(prev => ({ ...prev, [field]: validateField(field, newVal) }));
  };

  const validateStep1 = () => {
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'departureDate', 'returnDate', 'originCity'];
    const nextErrors = {};
    fieldsToValidate.forEach((k) => {
      nextErrors[k] = validateField(k, form[k]);
    });
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else {
      toast({
        title: 'Corrige los errores',
        description: 'Por favor completa correctamente los campos obligatorios.',
        variant: 'destructive',
      });
    }
  };

  const savePendingReservationDraft = (paymentLinkId) => {
    if (!paymentLinkId || !pkg) return;

    const reservationDraft = {
      plan_id: pkg.id,
      customer_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim(),
      number_of_people: Number(form.passengers),
      number_of_adults: Number(form.numberOfAdults),
      number_of_children: Number(form.numberOfChildren),
      children_ages: form.childrenAges.trim(),
      departure_date: form.departureDate,
      return_date: form.returnDate,
      origin_city: form.originCity.trim(),
      special_requirements: form.specialRequirements.trim(),
      total_price: totalPrice,
      payment_link: paymentLinkId,
      status: 'ACTIVE',
      payment_status: 'ACTIVE',
    };

    sessionStorage.setItem(`pendingReservation:${paymentLinkId}`, JSON.stringify(reservationDraft));
  };

  const handlePay = async () => {
    let redirecting = false;
    setIsPaying(true);

    const VAT_RATE = 0.19;
    const baseAmount = Math.round(totalPrice / (1 + VAT_RATE));
    const taxValue = totalPrice - baseAmount;

    const randomSuffix = Math.floor(Math.random() * 100);
    const reference = `${form.phone}${randomSuffix}`;

    const payload = {
      amount_type: 'CLOSE',
      amount: {
        currency: pkg.currency,
        taxes: [
          {
            type: 'VAT',
            base: baseAmount,
            value: taxValue,
          },
        ],
        tip_amount: 0,
        total_amount: totalPrice,
      },
      reference: reference,
      description: pkg.name,
      image_url: 'https://reservarcolombia.com/assets/Logo-vo49VPOB.png',
    };

    const isDevelopment = import.meta.env.DEV;
    const proxyUrl = isDevelopment ? '/api/create-payment-link' : '/proxy.php';

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let apiResponse;

      try {
        apiResponse = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error('No se pudo parsear la respuesta como JSON:', responseText);
        throw new Error(`El servidor devolvió una respuesta no válida. Contenido: ${responseText.slice(0, 50)}...`);
      }

      if (!response.ok) {
        throw apiResponse || { message: `Error ${response.status}: ${response.statusText}` };
      }

      if (apiResponse?.payload?.url) {
        redirecting = true;
        const paymentLinkId = apiResponse.payload.payment_link;
        savePendingReservationDraft(paymentLinkId);
        toast({
          title: 'Link de pago generado',
          description: 'Se abrió la pasarela de pago en una nueva pestaña.',
        });
        window.open(apiResponse.payload.url, '_blank');
        navigate(`/payment-waiting/${paymentLinkId}`);
      } else {
        console.error('Respuesta inesperada de la API:', apiResponse);
        toast({
          variant: 'destructive',
          title: 'Error en Respuesta',
          description: 'No se recibió un link de pago válido.',
        });
        alert(`Respuesta inesperada de la API:\n\n${JSON.stringify(apiResponse, null, 2)}`);
      }
    } catch (apiError) {
      console.error('Error al generar el link de pago:', apiError);
      toast({
        variant: 'destructive',
        title: 'Error al generar el link',
        description: 'Hubo un problema con la API. Revisa la consola para más detalles.',
      });
      alert(`Error:\n\n${apiError.message || JSON.stringify(apiError, null, 2)}`);
    } finally {
      if (!redirecting) {
        setIsPaying(false);
      }
    }
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
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-12 relative max-w-2xl mx-auto px-8">
          {/* Connecting Line Background */}
          <div className="absolute top-[20px] left-[10%] right-[10%] h-1 bg-gray-200 -z-10 rounded-full"></div>
          {/* Connecting Line Progress */}
          <div 
            className="absolute top-[20px] left-[10%] h-1 bg-primary transition-all duration-700 ease-in-out -z-10 rounded-full"
            style={{ width: currentStep === 1 ? '0%' : '80%' }}
          ></div>

          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center group">
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 shadow-sm ${
                  currentStep >= 1 ? 'bg-primary text-white shadow-primary/30 ring-4 ring-primary/20' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}>
                {currentStep === 1 && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary opacity-20"></span>
                )}
                {currentStep > 1 ? <Check className="w-5 h-5 animate-in zoom-in duration-300" /> : '1'}
              </div>
              <span className={`mt-3 text-sm font-semibold tracking-wide transition-colors duration-300 ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                Datos reserva
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group">
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 shadow-sm ${
                  currentStep >= 2 ? 'bg-primary text-white shadow-primary/30 ring-4 ring-primary/20' : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                {currentStep === 2 && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary opacity-20"></span>
                )}
                2
              </div>
              <span className={`mt-3 text-sm font-semibold tracking-wide transition-colors duration-300 ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                Pago
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                  <CardTitle className="text-2xl text-slate-800">Tu selección y datos</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Completa la información para tu viaje a <span className="font-semibold text-primary">{pkg.destination?.name || pkg.name}</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                      Datos personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Nombre <span className="text-red-500">*</span></label>
                        <Input
                          value={form.firstName}
                          onChange={e => handleFormChange('firstName', e.target.value)}
                          placeholder="Tu nombre"
                          className="bg-slate-50"
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Apellido <span className="text-red-500">*</span></label>
                        <Input
                          value={form.lastName}
                          onChange={e => handleFormChange('lastName', e.target.value)}
                          placeholder="Tu apellido"
                          className="bg-slate-50"
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Correo electrónico <span className="text-red-500">*</span></label>
                        <Input
                          value={form.email}
                          onChange={e => handleFormChange('email', e.target.value)}
                          placeholder="correo@ejemplo.com"
                          type="email"
                          className="bg-slate-50"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                        <Input
                          value={form.phone}
                          onChange={e => handleFormChange('phone', (e.target.value || '').toString().replace(/\D/g, ''))}
                          placeholder="300 000 0000"
                          inputMode="numeric"
                          className="bg-slate-50"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2"></div>

                  {/* Travel Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                      Detalles del viaje
                    </h3>
                    <div className="space-y-5 pl-11">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Ciudad de origen <span className="text-red-500">*</span></label>
                        <Input
                          value={form.originCity}
                          onChange={e => handleFormChange('originCity', e.target.value)}
                          placeholder="Ej. Bogotá, Medellín, Cali..."
                          className="bg-slate-50 max-w-md"
                        />
                        {errors.originCity && <p className="text-red-500 text-xs mt-1.5">{errors.originCity}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-1.5">Fecha de salida <span className="text-red-500">*</span></label>
                          <Input
                            type="date"
                            value={form.departureDate}
                            onChange={e => handleFormChange('departureDate', e.target.value)}
                            className="bg-slate-50"
                          />
                          {errors.departureDate && (
                            <p className="text-red-500 text-xs mt-1.5">{errors.departureDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-1.5">Fecha de retorno <span className="text-red-500">*</span></label>
                          <Input
                            type="date"
                            value={form.returnDate}
                            onChange={e => handleFormChange('returnDate', e.target.value)}
                            className="bg-slate-50"
                          />
                          {errors.returnDate && (
                            <p className="text-red-500 text-xs mt-1.5">{errors.returnDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2"></div>

                  {/* Passengers */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                      Acompañantes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-11 max-w-md">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Adultos</label>
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"
                            onClick={() => handleFormChange('numberOfAdults', Math.max(1, Number(form.numberOfAdults) - 1))}
                          >
                            −
                          </Button>
                          <div className="flex-1 text-center font-semibold text-slate-700">
                            {form.numberOfAdults}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"
                            onClick={() => handleFormChange('numberOfAdults', Number(form.numberOfAdults) + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Niños</label>
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"
                            onClick={() => handleFormChange('numberOfChildren', Math.max(0, Number(form.numberOfChildren) - 1))}
                          >
                            −
                          </Button>
                          <div className="flex-1 text-center font-semibold text-slate-700">
                            {form.numberOfChildren}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"
                            onClick={() => handleFormChange('numberOfChildren', Number(form.numberOfChildren) + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    {Number(form.numberOfChildren) > 0 && (
                      <div className="mt-5 pl-11 max-w-md">
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Edades de los niños</label>
                        <Input
                          value={form.childrenAges}
                          onChange={e => handleFormChange('childrenAges', e.target.value)}
                          placeholder="Ej. 5, 8, 12"
                          className="bg-slate-50"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">Separadas por coma</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2"></div>

                  {/* Special Requirements */}
                  <div className="pl-11">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Requisitos especiales (opcional)</label>
                    <Input
                      value={form.specialRequirements}
                      onChange={e => handleFormChange('specialRequirements', e.target.value)}
                      placeholder="Alergias, necesidades dietéticas, accesibilidad..."
                      className="bg-slate-50"
                    />
                  </div>

                  {/* Next Button */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-100">
                    <Button variant="outline" className="w-full sm:w-1/3" onClick={() => navigate('/')}>
                      Cancelar
                    </Button>
                    <Button className="w-full sm:w-2/3 bg-primary hover:bg-primary/90 text-white shadow-md" onClick={handleNextStep}>
                      Continuar al pago
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Check className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl text-slate-800">Confirma y paga</CardTitle>
                  </div>
                  <p className="text-sm text-slate-500">
                    Revisa que la información sea correcta antes de proceder al pago.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Booking Summary */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-4">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                      Resumen de tu reserva
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Destino</p>
                        <p className="font-semibold text-slate-800">{pkg.destination?.name || pkg.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Pasajeros</p>
                        <p className="font-medium text-slate-800">{form.passengers} ({form.numberOfAdults} Adultos{Number(form.numberOfChildren) > 0 ? `, ${form.numberOfChildren} Niños` : ''})</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Fechas</p>
                        <p className="font-medium text-slate-800">
                          {new Date(form.departureDate).toLocaleDateString('es-CO')} - {new Date(form.returnDate).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Titular</p>
                        <p className="font-medium text-slate-800">{form.firstName} {form.lastName}</p>
                        <p className="text-sm text-slate-600">{form.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-2">Desglose de precio</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Precio por persona</span>
                      <span className="font-medium">{formatPrice(unitPrice, pkg.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Cantidad de personas</span>
                      <span className="font-medium">x {form.passengers}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total a pagar</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(totalPrice, pkg.currency)}</span>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex gap-3 items-start bg-emerald-50 text-emerald-800 p-4 rounded-lg text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <p>
                      Tus pagos son procesados de forma segura por Bold. Al hacer clic en pagar, serás redirigido a una pasarela segura.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Button variant="outline" className="w-full sm:w-1/3" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      className="w-full sm:w-2/3 bg-primary hover:bg-primary/90 text-white shadow-md text-lg h-12"
                      onClick={handlePay}
                      disabled={isPaying}
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        `Pagar ${formatPrice(totalPrice, pkg.currency)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Package Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-slate-200 shadow-sm overflow-hidden">
              <div className="h-48 w-full relative">
                <img
                  src={pkg.destination?.image_url || pkg.image || ''}
                  alt={pkg.destination?.name || pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold">{pkg.destination?.name || pkg.name}</h3>
                  <p className="text-sm text-white/90">{pkg.duration_days} Días, {pkg.duration_nights} Noches</p>
                </div>
              </div>
              
              <CardContent className="p-5 space-y-5">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{formatPrice(unitPrice, pkg.currency)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Por persona en acomodación doble</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-800">El plan incluye:</h4>
                  <ul className="space-y-2">
                    {(pkg.inclusions || []).slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex gap-2.5 items-start">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.inclusions?.length > 4 && (
                    <p className="text-xs text-primary font-medium pl-6">
                      +{pkg.inclusions.length - 4} beneficios más
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 bg-slate-50 -mx-5 px-5 pb-5 -mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total actual</p>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-slate-700">{form.passengers} personas</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(totalPrice, pkg.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingFlowPage;
