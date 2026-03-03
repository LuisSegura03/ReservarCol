
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const { login } = useAdminContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Error", description: "Todos los campos son obligatorios" });
      return;
    }
    
    if (login(email, password, role)) {
      toast({ title: "Bienvenido", description: "Inicio de sesión exitoso" });
      navigate('/admin/dashboard');
    } else {
      toast({ variant: "destructive", title: "Acceso denegado", description: "Credenciales inválidas" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
              <label className="text-sm font-medium">Rol</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Asesor">Asesor de Ventas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ejemplo@reservarcolombia.com"
                className="bg-white text-gray-900"
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
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">Ingresar</Button>
          </form>

          <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-2">
            <p className="font-semibold">Credenciales de Demo:</p>
            <p>Admin: admin@reservarcolombia.com / admin123</p>
            <p>Asesor: asesor@reservarcolombia.com / asesor123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
