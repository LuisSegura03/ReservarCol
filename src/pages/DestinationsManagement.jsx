
import React, { useState } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DestinationsManagement = () => {
  const { destinos, addDestino, updateDestino, deleteDestino, user } = useAdminContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image_url: '',
    status: 'Active'
  });

  const filtered = destinos.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (destino = null) => {
    if (destino) {
      setEditingId(destino.id);
      setFormData({
        name: destino.name,
        category: destino.category,
        description: destino.description || '',
        image_url: destino.image_url || '',
        status: destino.status || 'Active'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: '', description: '', image_url: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast({ variant: 'destructive', title: 'Error', description: 'Nombre y categoría son requeridos.' });
      return;
    }
    
    try {
      if (editingId) {
        await updateDestino(editingId, formData);
        toast({ title: 'Éxito', description: 'Destino actualizado correctamente.' });
      } else {
        await addDestino(formData);
        toast({ title: 'Éxito', description: 'Destino creado correctamente.' });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este destino?')) {
      try {
        await deleteDestino(id);
        toast({ title: 'Éxito', description: 'Destino eliminado correctamente.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Destinos</h1>
            <p className="text-muted-foreground">Gestiona los destinos turísticos</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Destino
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Buscar destino..." 
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
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="capitalize">{d.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {d.status || 'Activo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(d)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    {user?.role === 'Admin' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Destino' : 'Nuevo Destino'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre *</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. San Andrés" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría *</label>
                <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="internacional">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL de Imagen</label>
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default DestinationsManagement;
