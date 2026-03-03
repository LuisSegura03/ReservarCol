
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminContext } from '@/context/AdminContext';
import { LayoutDashboard, Map, Briefcase, Inbox, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAdminContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Map, label: 'Destinos', path: '/admin/destinos' },
    { icon: Briefcase, label: 'Planes', path: '/admin/planes' },
    { icon: Inbox, label: 'Solicitudes', path: '/admin/solicitudes' },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 p-4">
      <div className="mb-8 px-4">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
        <p className="text-xs text-slate-400">{user?.role} - {user?.email}</p>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden md:block">
        <SidebarContent />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-8">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium">{user?.email}</span>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{user?.role}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
