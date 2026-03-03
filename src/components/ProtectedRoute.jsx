
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminContext } from '@/context/AdminContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAdminContext();

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
