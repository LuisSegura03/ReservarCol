
import React, { useState } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SolicitudesManagement = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes</h1>
          <p className="text-muted-foreground">Gestión de reservas y peticiones</p>
        </div>

        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No hay solicitudes pendientes.</TableCell>
                </TableRow>
              ) : (
                solicitudes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.customerName}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </TableCell>
                    <TableCell>{s.destination}</TableCell>
                    <TableCell>{s.date}</TableCell>
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

export default SolicitudesManagement;
