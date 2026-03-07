import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, ArrowLeft, Home } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, adminSignIn } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Error", description: "Todos los campos son obligatorios" });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await adminSignIn(email, password);
      
      if (error) {
        toast({ variant: "destructive", title: "Acceso denegado", description: error.message });
      } else {
        // El login fue exitoso, redirigir al dashboard
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Flecha para regresar a la landing page */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Volver al inicio</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Acceso Administrativo</CardTitle>
          <CardDescription>Reservar Colombia Panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ejemplo@reservarcolombia.com"
                className="bg-white text-gray-900"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="bg-white text-gray-900"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-2">
            <p className="font-semibold">Credenciales de Demo:</p>
            <p>Admin: admin@reservarcolombia.com / admin123</p>
            <p>Asesor: asesor@reservarcolombia.com / asesor123</p>
            <p className="text-green-600 mt-2">✓ Sistema con contraseñas encriptadas</p>
          </div>

          {/* Botón adicional para ir a la landing page */}
          <div className="mt-4 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              Ir a la página principal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
