
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ConfiguracionPage = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Configuración guardada", description: "Los cambios se aplicaron correctamente." });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Ajustes generales de la empresa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input defaultValue="Reservar Colombia" className="bg-white text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email de Contacto</label>
              <Input defaultValue="info@reservarcolombia.com" className="bg-white text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input defaultValue="+57 300 123 4567" className="bg-white text-gray-900" />
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracionPage;
