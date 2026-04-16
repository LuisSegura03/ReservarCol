
import React, { useState } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ReservasManagement = () => {
  const { solicitudes, updateSolicitud } = useAdminContext();
  const { toast } = useToast();

  const handleStatusChange = (id, newStatus) => {
    updateSolicitud(id, newStatus);
    toast({ title: "Estado actualizado", description: `La solicitud ahora está ${newStatus}` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Gestión de reservas de paquetes turísticos</p>
        </div>

        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado Pago</TableHead>
                <TableHead>Estado Reserva</TableHead>
                <TableHead>Fecha Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No hay reservas registradas.</TableCell>
                </TableRow>
              ) : (
                solicitudes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.customer_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{s.customer_email}</div>
                      <div className="text-xs text-muted-foreground">{s.customer_phone}</div>
                    </TableCell>
                    <TableCell>{s.number_of_people}</TableCell>
                    <TableCell>${s.total_price?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.payment_status === 'PAID' ? 'bg-green-100 text-green-800' :
                        s.payment_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        s.payment_status === 'CANCELLED' ? 'bg-yellow-100 text-yellow-800' :
                        s.payment_status === 'EXPIRED' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select value={s.status} onValueChange={(val) => handleStatusChange(s.id, val)}>
                        <SelectTrigger className="w-32 bg-white text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pendiente</SelectItem>
                          <SelectItem value="Confirmed">Confirmada</SelectItem>
                          <SelectItem value="Cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReservasManagement;
