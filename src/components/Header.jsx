
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si está en la parte superior, siempre mostrar el header
      if (currentScrollY <= 0) {
        setIsVisible(true);
        return;
      }
      
      // Si hace scroll hacia abajo, ocultar el header
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } 
      // Si hace scroll hacia arriba, mostrar el header
      else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 bg-white rounded-2xl mx-4 mt-4 px-6">
          <Link to="/" className="flex items-center w-50 gap-3">
            <img 
              src="/src/assets/logo.png" 
              alt="Reservar Colombia Logo" 
              className="w-36 h-36 mb-3 object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiNGRjcwNDMiLz4KPHR5cGUNCg0KCQkJCQkJCQkJCQkJaWQ9dDpkZWZhdWx0DQoJCQkJCQkJCQkJCWZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiINCgkJCQkJCQkJCQkJZm9udC1zaXplPSIxMiINCgkJCQkJCQkJCQkJZmlsbD0id2hpdGUiDQoJCQkJCQkJCQkJCQl0ZXh0LWFuY2hvcj0ibWlkZGxlIg0KCQkJCQkJCQkJCQkJZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UkM8L3RleHQ+Cjwvc3ZnPgo=';
              }}
            />
          </Link>

          <nav className="hidden md:flex items-center justify-center flex-1 gap-12">
            {navLinks.slice(0, 3).map((link) => (
              link.href.startsWith('#') ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white text-gray-700 border-gray-200">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.slice(0, 3).map((link) => (
                  link.href.startsWith('#') ? (
                    <button
                      key={link.name}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium hover:text-primary transition-colors"
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
