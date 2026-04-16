import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentWaitingPage = () => {
  const { paymentLinkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [paymentStatus, setPaymentStatus] = useState('ACTIVE');
  const [isChecking, setIsChecking] = useState(false);
  const [reservationSaved, setReservationSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [pollTimeoutReached, setPollTimeoutReached] = useState(false);
  const [pollStartTime, setPollStartTime] = useState(null);

  const getPendingReservationDraft = () => {
    if (!paymentLinkId) return null;
    const serialized = sessionStorage.getItem(`pendingReservation:${paymentLinkId}`);
    if (!serialized) return null;

    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error parsing reservation draft:', error);
      return null;
    }
  };

  const saveReservationIfFinal = async (status) => {
    const finalStates = ['PAID', 'REJECTED', 'CANCELLED', 'EXPIRED'];
    if (!paymentLinkId || reservationSaved || !finalStates.includes(status)) return;

    const draft = getPendingReservationDraft();
    if (!draft) {
      console.warn('No se encontró el borrador de reserva para paymentLinkId:', paymentLinkId);
      return;
    }

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('reservations')
        .select('id')
        .eq('payment_link', paymentLinkId)
        .limit(1);

      if (fetchError) throw fetchError;
      if (Array.isArray(existingData) && existingData.length > 0) {
        setReservationSaved(true);
        return;
      }

        const reservationRow = {
        plan_id: draft.plan_id,
        customer_name: draft.customer_name,
        customer_email: draft.customer_email,
        customer_phone: draft.customer_phone,
        number_of_people: draft.number_of_people,
        total_price: draft.total_price,
        payment_link: draft.payment_link,
        status,
        payment_status: status,
      };

      const { error: insertError } = await supabase.from('reservations').insert([reservationRow]);
      if (insertError) throw insertError;

      setReservationSaved(true);
      sessionStorage.removeItem(`pendingReservation:${paymentLinkId}`);
    } catch (error) {
      console.error('Error guardando la reserva:', error);
      setSaveError('No se pudo guardar la reserva en la base de datos. Intenta nuevamente.');
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentLinkId) return;
    setIsChecking(true);
    try {
      const url = `/api/check-payment-status/${paymentLinkId}`;
      const response = await fetch(url);
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (jsonParseError) {
        console.error('No se pudo parsear la respuesta JSON de estado de pago:', text, jsonParseError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo verificar el estado del pago.',
        });
        return;
      }

      const status = data?.status ?? paymentStatus;
      setPaymentStatus(status);

      if (status) {
        await saveReservationIfFinal(status);
      }
    } catch (err) {
      console.error('Error validando estado del pago:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo verificar el estado del pago.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Polling automático cada 5 segundos (solo si no está en estado final)
  useEffect(() => {
    if (!paymentLinkId) return;

    // Detener polling si ya llegó a un estado final
    const finalStates = ['PAID', 'REJECTED', 'CANCELLED', 'EXPIRED'];
    if (finalStates.includes(paymentStatus)) return;

    const interval = setInterval(checkPaymentStatus, 15000);
    return () => clearInterval(interval);
  }, [paymentLinkId, paymentStatus]);

  useEffect(() => {
    if (!paymentLinkId) return;
    setPollStartTime(Date.now());
    setPollingEnabled(true);
    setPollTimeoutReached(false);
    checkPaymentStatus();
  }, [paymentLinkId]);

  useEffect(() => {
    if (!paymentLinkId) return;
    if (!pollingEnabled) return;

    const finalStates = ['PAID', 'REJECTED', 'CANCELLED', 'EXPIRED'];
    if (finalStates.includes(paymentStatus)) return;

    const now = Date.now();
    const startedAt = pollStartTime || now;
    const elapsed = now - startedAt;

    if (elapsed >= 300000) {
      setPollingEnabled(false);
      setPollTimeoutReached(true);
      return;
    }

    const interval = setInterval(() => {
      const currentElapsed = Date.now() - startedAt;
      if (currentElapsed >= 300000) {
        setPollingEnabled(false);
        setPollTimeoutReached(true);
        clearInterval(interval);
        return;
      }
      checkPaymentStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [paymentLinkId, paymentStatus, pollingEnabled, pollStartTime]);

  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'PAID':
        return {
          icon: <Check className="h-8 w-8 text-green-500" />,
          bgClass: 'bg-green-50',
          title: '¡Pago confirmado!',
          message: 'Tu transacción se completó exitosamente.',
          subtitle: `ID de transacción: ${paymentLinkId}`,
        };
      case 'PROCESSING':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
          bgClass: 'bg-blue-50',
          title: 'Procesando pago',
          message: 'Tu pago está siendo procesado.',
          subtitle: 'Esto puede tomar unos segundos.',
        };
      case 'REJECTED':
        return {
          icon: <X className="h-8 w-8 text-red-500" />,
          bgClass: 'bg-red-50',
          title: 'Pago rechazado',
          message: 'Tu pago fue rechazado. Por favor, intenta de nuevo.',
          subtitle: `ID de transacción: ${paymentLinkId}`,
        };
      case 'CANCELLED':
        return {
          icon: <X className="h-8 w-8 text-red-500" />,
          bgClass: 'bg-red-50',
          title: 'Pago cancelado',
          message: 'El pago fue cancelado.',
          subtitle: `ID de transacción: ${paymentLinkId}`,
        };
      case 'EXPIRED':
        return {
          icon: <X className="h-8 w-8 text-orange-500" />,
          bgClass: 'bg-orange-50',
          title: 'Link expirado',
          message: 'El link de pago ha expirado.',
          subtitle: `ID de transacción: ${paymentLinkId}`,
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          bgClass: 'bg-slate-50',
          title: 'Esperando confirmación del pago',
          message: 'Estamos verificando el estado de tu pago.',
          subtitle: 'Mantén esta página abierta mientras se completa la conexión.',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className={`flex-1 flex items-center justify-center ${content.bgClass} px-4`}>
        <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            {content.icon}
          </div>
          <h1 className="mt-8 text-3xl font-semibold text-slate-900">{content.title}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {content.message}
          </p>
          {content.subtitle && (
            <p className="mt-4 text-sm font-medium text-slate-500">
              {content.subtitle}
            </p>
          )}
          {saveError && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {saveError}
            </p>
          )}
          {pollTimeoutReached && paymentStatus !== 'PAID' && paymentStatus !== 'REJECTED' && paymentStatus !== 'CANCELLED' && paymentStatus !== 'EXPIRED' && (
            <p className="mt-4 text-sm font-medium text-amber-700">
              No se obtuvo un estado final en 5 minutos. La comprobación automática se detuvo.
            </p>
          )}
          <div className="mt-6 space-y-3">
            {paymentStatus !== 'PAID' && paymentStatus !== 'REJECTED' && paymentStatus !== 'CANCELLED' && paymentStatus !== 'EXPIRED' && (
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking}
                className="w-full"
                variant="default"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar estado del pago'
                )}
              </Button>
            )}
            {paymentStatus === 'PAID' && (
              <Button
                onClick={() => navigate('/')}
                className="w-full"
                variant="default"
              >
                Continuar al sitio
              </Button>
            )}
            {(paymentStatus === 'REJECTED' || paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') && (
              <Button
                onClick={() => navigate('/')}
                className="w-full"
                variant="default"
              >
                Intentar de nuevo
              </Button>
            )}
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentWaitingPage;