
import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PackageDetailPage from './pages/PackageDetailPage';
import { Toaster } from './components/ui/toaster';

// Admin imports
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DestinosManagement from './pages/DestinosManagement';
import PlanesManagement from './pages/PlanesManagement';
import SolicitudesManagement from './pages/SolicitudesManagement';
import ConfiguracionPage from './pages/ConfiguracionPage';

import { seedDestinations, seedPlans } from '@/lib/seedData';

function App() {
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Starting data initialization...');
        await seedDestinations();
        await seedPlans();
        console.log('Data initialization complete.');
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initializeData();
  }, []);

  return (
    <Router>
      <AdminProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/package/:id" element={<PackageDetailPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/destinos" element={<ProtectedRoute><DestinosManagement /></ProtectedRoute>} />
          <Route path="/admin/planes" element={<ProtectedRoute><PlanesManagement /></ProtectedRoute>} />
          <Route path="/admin/solicitudes" element={<ProtectedRoute><SolicitudesManagement /></ProtectedRoute>} />
          <Route path="/admin/configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
        </Routes>
        <Toaster />
      </AdminProvider>
    </Router>
  );
}

export default App;
