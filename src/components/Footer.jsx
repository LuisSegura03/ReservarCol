
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MessageCircle, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-primary text-white py-12 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Reservar Colombia</h3>
            <p className="text-white/90 mb-2">Agencia de Viajes</p>
            <p className="text-white/80 text-sm">RNT: 12345678</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-white/90 text-sm">Bogotá, Colombia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span className="text-white/90 text-sm">+57 300 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="text-white/90 text-sm">info@reservarcolombia.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@reservarcolombia.com"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center flex flex-col items-center">
          <p className="text-white/80 text-sm">
            &copy; {new Date().getFullYear()} Reservar Colombia. Todos los derechos reservados.
          </p>
          <div className="mt-4 absolute bottom-4 right-4">
            <Link to="/admin" className="text-xs text-white/30 hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
