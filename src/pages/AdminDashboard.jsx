
import React from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Briefcase, Inbox, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const AdminDashboard = () => {
  const { destinos, planes, solicitudes } = useAdminContext();

  const stats = [
    { title: 'Total Destinos', value: destinos.length, icon: Map, color: 'text-blue-500' },
    { title: 'Total Planes', value: planes.length, icon: Briefcase, color: 'text-green-500' },
    { title: 'Solicitudes', value: solicitudes.length, icon: Inbox, color: 'text-purple-500' },
    { title: 'Conversión', value: '12%', icon: TrendingUp, color: 'text-pink-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de la plataforma</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">El panel de estadísticas detalladas estará disponible pronto.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
