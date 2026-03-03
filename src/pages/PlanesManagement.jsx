
import React, { useState, useEffect } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const PlanesManagement = () => {
  const { planes, destinos, loading, error, fetchPlanes, fetchDestinations, addPlan, updatePlan, deletePlan, user } = useAdminContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '',
    destination_id: '',
    duration_days: 1,
    duration_nights: 0,
    price: '',
    currency: 'COP',
    available_dates: '',
    status: 'active',
    inclusions: '',
    exclusions: '',
    terms_conditions: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPlanes();
    fetchDestinations();
  }, [fetchPlanes, fetchDestinations]);

  const filtered = planes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingId(plan.id);
      
      // Convert arrays to newline separated strings for textareas if they are arrays
      const formatArray = (arr) => Array.isArray(arr) ? arr.join('\n') : (arr || '');

      setFormData({
        name: plan.name,
        destination_id: plan.destination_id || '',
        duration_days: plan.duration_days || 1,
        duration_nights: plan.duration_nights || 0,
        price: plan.price || '',
        currency: plan.currency || 'COP',
        available_dates: plan.available_dates || '',
        status: plan.status || 'active',
        inclusions: formatArray(plan.inclusions),
        exclusions: formatArray(plan.exclusions),
        terms_conditions: plan.terms_conditions || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.destination_id || !formData.price) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre, destino y precio son obligatorios.' });
      return;
    }

    try {
      // Parse newline strings back to arrays for JSONB columns
      const parseTextarea = (text) => text ? text.split('\n').map(item => item.trim()).filter(Boolean) : [];
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days, 10),
        duration_nights: parseInt(formData.duration_nights, 10),
        inclusions: parseTextarea(formData.inclusions),
        exclusions: parseTextarea(formData.exclusions)
      };

      if (editingId) {
        await updatePlan(editingId, payload);
        toast({ title: 'Éxito', description: 'Plan actualizado correctamente.' });
      } else {
        await addPlan(payload);
        toast({ title: 'Éxito', description: 'Plan creado correctamente.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Error al guardar el plan.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      try {
        await deletePlan(id);
        toast({ title: 'Éxito', description: 'Plan eliminado correctamente.' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: err.message || 'Error al eliminar el plan.' });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planes y Paquetes</h1>
            <p className="text-muted-foreground">Administra la oferta de viajes</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Plan
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Buscar por nombre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white text-gray-900"
          />
          <Button variant="outline" size="icon" onClick={fetchPlanes} title="Recargar">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex justify-between items-center">
            <span>Error cargando planes: {error}</span>
            <Button variant="outline" size="sm" onClick={fetchPlanes}>Reintentar</Button>
          </div>
        )}

        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Cargando planes...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron planes.</TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.destination?.name || 'Desconocido'}</TableCell>
                    <TableCell>{p.duration_days} Días / {p.duration_nights} Noches</TableCell>
                    <TableCell>{p.currency} {p.price ? p.price.toLocaleString('es-CO') : '0'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' || p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.status === 'active' || p.status === 'Active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      {user?.role === 'Admin' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Plan *</label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Plan Básico" className="text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destino *</label>
                    <Select value={formData.destination_id} onValueChange={val => setFormData({...formData, destination_id: val})}>
                      <SelectTrigger className="text-gray-900"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent>
                        {destinos.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Días *</label>
                    <Input type="number" min="1" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} className="text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Noches *</label>
                    <Input type="number" min="0" value={formData.duration_nights} onChange={e => setFormData({...formData, duration_nights: e.target.value})} className="text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio por Persona *</label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Moneda</label>
                    <Select value={formData.currency} onValueChange={val => setFormData({...formData, currency: val})}>
                      <SelectTrigger className="text-gray-900"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fechas Disponibles</label>
                  <Input value={formData.available_dates} onChange={e => setFormData({...formData, available_dates: e.target.value})} placeholder="Ej. Todo el año" className="text-gray-900" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                    <SelectTrigger className="text-gray-900"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">Incluye (Un ítem por línea)</label>
                  <Textarea 
                    value={formData.inclusions} 
                    onChange={e => setFormData({...formData, inclusions: e.target.value})} 
                    rows={4} 
                    className="text-gray-900 font-mono text-sm"
                    placeholder="Vuelos&#10;Hotel&#10;Desayunos"
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">No Incluye (Un ítem por línea)</label>
                  <Textarea 
                    value={formData.exclusions} 
                    onChange={e => setFormData({...formData, exclusions: e.target.value})} 
                    rows={4} 
                    className="text-gray-900 font-mono text-sm"
                    placeholder="Gastos personales&#10;Propinas"
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">Términos y Condiciones</label>
                  <Textarea 
                    value={formData.terms_conditions} 
                    onChange={e => setFormData({...formData, terms_conditions: e.target.value})} 
                    rows={3} 
                    className="text-gray-900"
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 border-t pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PlanesManagement;
