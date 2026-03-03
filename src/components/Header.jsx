
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Destinos Nacionales', href: '#destinos-nacionales' },
    { name: 'Destinos Internacionales', href: '#destinos-internacionales' },
    { name: 'Contacto', href: '#contacto' }
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reservar Colombia</h1>
              <p className="text-xs text-white/90">Agencia de Viajes</p>
              <p className="text-[10px] text-white/70">RNT: 12345678</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-white hover:text-white/80 transition-colors font-medium"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-white hover:text-white/80 transition-colors font-medium"
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary text-white border-white/20">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  link.href.startsWith('#') ? (
                    <button
                      key={link.name}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left text-lg font-medium hover:text-white/80 transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium hover:text-white/80 transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
