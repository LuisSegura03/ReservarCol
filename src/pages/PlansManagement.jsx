
import React, { useState } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const PlansManagement = () => {
  const { planes, destinos, addPlan, updatePlan, deletePlan, user } = useAdminContext();
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
    status: 'Active',
    inclusions: ['Vuelos', 'Hotel', 'M. Pension', 'Traslados', 'Tour', 'Seguro'],
    exclusions: ['Tarjeta de ingreso', 'Alimentación extra', 'Tarifa Ecológica'],
    terms_conditions: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const filtered = planes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        name: plan.name,
        destination_id: plan.destination_id || '',
        duration_days: plan.duration_days || 1,
        duration_nights: plan.duration_nights || 0,
        price: plan.price || '',
        currency: plan.currency || 'COP',
        available_dates: plan.available_dates || '',
        status: plan.status || 'Active',
        inclusions: Array.isArray(plan.inclusions) ? plan.inclusions : [],
        exclusions: Array.isArray(plan.exclusions) ? plan.exclusions : [],
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
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre, destino y precio son requeridos.' });
      return;
    }

    try {
      if (editingId) {
        await updatePlan(editingId, formData);
        toast({ title: 'Éxito', description: 'Plan actualizado correctamente.' });
      } else {
        await addPlan(formData);
        toast({ title: 'Éxito', description: 'Plan creado correctamente.' });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      try {
        await deletePlan(id);
        toast({ title: 'Éxito', description: 'Plan eliminado correctamente.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    }
  };

  const DynamicList = ({ items, onChange, label }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <Input 
            value={item} 
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              onChange(newItems);
            }} 
          />
          <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
            <X className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, ''])}>Añadir Ítem</Button>
    </div>
  );

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
        </div>

        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.destination?.name || 'Desconocido'}</TableCell>
                  <TableCell>{p.duration_days} Días / {p.duration_nights} Noches</TableCell>
                  <TableCell>{p.currency} {p.price}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Plan *</label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Plan Básico" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destino *</label>
                    <Select value={formData.destination_id} onValueChange={val => setFormData({...formData, destination_id: val})}>
                      <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent>
                        {destinos.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Días *</label>
                    <Input type="number" min="1" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Noches *</label>
                    <Input type="number" min="0" value={formData.duration_nights} onChange={e => setFormData({...formData, duration_nights: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio por Persona *</label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Moneda</label>
                    <Select value={formData.currency} onValueChange={val => setFormData({...formData, currency: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Input value={formData.available_dates} onChange={e => setFormData({...formData, available_dates: e.target.value})} placeholder="Ej. Todo el año" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Activo</SelectItem>
                      <SelectItem value="Inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <DynamicList label="Incluye" items={formData.inclusions} onChange={newItems => setFormData({...formData, inclusions: newItems})} />
                </div>

                <div className="border-t pt-4">
                  <DynamicList label="No Incluye" items={formData.exclusions} onChange={newItems => setFormData({...formData, exclusions: newItems})} />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">Términos y Condiciones</label>
                  <Textarea value={formData.terms_conditions} onChange={e => setFormData({...formData, terms_conditions: e.target.value})} rows={4} />
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

export default PlansManagement;
