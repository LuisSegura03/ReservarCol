
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const AdminContext = createContext();

export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { toast } = useToast();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [destinos, setDestinos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDestinations = useCallback(async () => {
    try {
      console.log('Fetching destinations...');
      const { data, error: fetchError } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setDestinos(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los destinos' });
    }
  }, [toast]);

  const fetchPlanes = useCallback(async () => {
    try {
      console.log('Fetching plans...');
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*, destination:destinations(*)')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      setPlanes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los planes' });
    }
  }, [toast]);

  const fetchReservations = useCallback(async () => {
    try {
      console.log('Fetching reservations...');
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*, plan:plans(name)')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      setSolicitudes(data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('adminUser', JSON.stringify(user));
    else localStorage.removeItem('adminUser');
  }, [user]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDestinations(), fetchPlanes(), fetchReservations()]);
      setLoading(false);
    };
    loadAll();

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
  }, [fetchDestinations, fetchPlanes, fetchReservations]);

  const login = (email, password, role) => {
    if ((email === 'admin@reservarcolombia.com' && password === 'admin123' && role === 'Admin') ||
        (email === 'asesor@reservarcolombia.com' && password === 'asesor123' && role === 'Asesor')) {
      setUser({ email, role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addDestino = async (destino) => {
    try {
      console.log('Adding destination:', destino);
      const { error } = await supabase.from('destinations').insert([destino]);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      console.error('Error adding destination:', err);
      throw err;
    }
  };

  const updateDestino = async (id, data) => {
    try {
      console.log('Updating destination:', id, data);
      const { error } = await supabase.from('destinations').update(data).eq('id', id);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      console.error('Error updating destination:', err);
      throw err;
    }
  };

  const deleteDestino = async (id) => {
    try {
      console.log('Deleting destination:', id);
      const { error } = await supabase.from('destinations').delete().eq('id', id);
      if (error) throw error;
      await fetchDestinations();
      return true;
    } catch (err) {
      console.error('Error deleting destination:', err);
      throw err;
    }
  };

  const addPlan = async (plan) => {
    try {
      console.log('Adding plan:', plan);
      const { error } = await supabase.from('plans').insert([plan]);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      console.error('Error adding plan:', err);
      throw err;
    }
  };

  const updatePlan = async (id, data) => {
    try {
      console.log('Updating plan:', id, data);
      const { error } = await supabase.from('plans').update(data).eq('id', id);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      console.error('Error updating plan:', err);
      throw err;
    }
  };

  const deletePlan = async (id) => {
    try {
      console.log('Deleting plan:', id);
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      await fetchPlanes();
      return true;
    } catch (err) {
      console.error('Error deleting plan:', err);
      throw err;
    }
  };

  const updateSolicitud = async (id, status) => {
    try {
      console.log('Updating reservation:', id, status);
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
      await fetchReservations();
      return true;
    } catch (err) {
      console.error('Error updating reservation:', err);
      throw err;
    }
  };

  const deleteSolicitud = async (id) => {
    try {
      console.log('Deleting reservation:', id);
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw error;
      await fetchReservations();
      return true;
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  };

  return (
    <AdminContext.Provider value={{
      user, login, logout, loading, error,
      destinos, fetchDestinations, addDestino, updateDestino, deleteDestino,
      planes, fetchPlanes, addPlan, updatePlan, deletePlan,
      solicitudes, fetchReservations, updateSolicitud, deleteSolicitud
    }}>
      {children}
    </AdminContext.Provider>
  );
};
