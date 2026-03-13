import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLocation } from 'react-router-dom';

const AdminContext = createContext();

export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { toast } = useToast();
  const { user: authUser } = useAdminAuth();
  const location = useLocation();
  
  const [destinos, setDestinos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── FETCH ───────────────────────────────────────────────

  const fetchDestinations = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setDestinos(data || []);
    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los destinos' });
    }
  }, [toast]);

  const fetchPlanes = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*, destination:destinations(*)')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setPlanes(data || []);
    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los planes' });
    }
  }, [toast]);

  const fetchReservations = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*, plan:plans(name)')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setSolicitudes(data || []);
    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las reservaciones' });
    }
  }, [toast]);

  // ─── CARGAR DATOS SOLO EN RUTAS ADMIN ────────────────────

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAuthenticated = authUser !== null;

    if (!isAuthenticated || !isAdminRoute) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDestinations(), fetchPlanes(), fetchReservations()]);
      setLoading(false);
    };
    loadAll();

    // Realtime subscriptions
    const destSub = supabase.channel('destinations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'destinations' }, fetchDestinations)
      .subscribe();

    const planSub = supabase.channel('plans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, fetchPlanes)
      .subscribe();

    const resSub = supabase.channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchReservations)
      .subscribe();

    return () => {
      supabase.removeChannel(destSub);
      supabase.removeChannel(planSub);
      supabase.removeChannel(resSub);
    };
  }, [fetchDestinations, fetchPlanes, fetchReservations, authUser, location.pathname]);

  // ─── DESTINOS CRUD ────────────────────────────────────────

  const addDestino = async (destino) => {
    try {
      const { error } = await supabase.from('destinations').insert([destino]);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo agregar el destino' });
      throw err;
    }
  };

  const updateDestino = async (id, data) => {
    try {
      const { error } = await supabase.from('destinations').update(data).eq('id', id);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el destino' });
      throw err;
    }
  };

  const deleteDestino = async (id) => {
    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el destino' });
      throw err;
    }
  };

  // ─── PLANES CRUD ──────────────────────────────────────────

  const addPlan = async (plan) => {
    try {
      const { error } = await supabase.from('plans').insert([plan]);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo agregar el plan' });
      throw err;
    }
  };

  const updatePlan = async (id, data) => {
    try {
      const { error } = await supabase.from('plans').update(data).eq('id', id);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el plan' });
      throw err;
    }
  };

  const deletePlan = async (id) => {
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el plan' });
      throw err;
    }
  };

  // ─── RESERVACIONES CRUD ───────────────────────────────────

  const updateSolicitud = async (id, status) => {
    try {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
      await fetchReservations();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la reservación' });
      throw err;
    }
  };

  const deleteSolicitud = async (id) => {
    try {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw error;
      await fetchReservations();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la reservación' });
      throw err;
    }
  };

  // ─── PROVIDER ─────────────────────────────────────────────

  return (
    <AdminContext.Provider value={{
      loading,
      error,
      destinos,
      fetchDestinations,
      addDestino,
      updateDestino,
      deleteDestino,
      planes,
      fetchPlanes,
      addPlan,
      updatePlan,
      deletePlan,
      solicitudes,
      fetchReservations,
      updateSolicitud,
      deleteSolicitud,
    }}>
      {children}
    </AdminContext.Provider>
  );
};