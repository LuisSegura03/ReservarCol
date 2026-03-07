import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminSignIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { error };
    // ¿Este usuario existe en mi tabla y está activo?
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData){
      return {error: {message: 'usuario no autorizado'}};
    }
    if( userData.status !== 'active'){
      return {error: {message: 'usuario no activo'}};
    }

    setUser(userData);
    return { error: null};

  };
  const adminSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return(
   <AdminAuthContext.Provider value={{ user, adminSignIn, adminSignOut }}>
    {children}
   </AdminAuthContext.Provider>

)
}

export const useAdminAuth = () => useContext(AdminAuthContext);

