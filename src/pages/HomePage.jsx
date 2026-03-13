
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import DestinosNacionales from '@/components/DestinosNacionales';
import DestinosInternacionales from '@/components/DestinosInternacionales';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Reservar Colombia - Agencia de Viajes</title>
        <meta
          name="description"
          content="Descubre los mejores destinos nacionales e internacionales con Reservar Colombia. Paquetes turísticos todo incluido con vuelos, hoteles, tours y más."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col pt-16">
        <Header />
        <main className="flex-1">
          <HeroCarousel />
          <DestinosNacionales />
          <DestinosInternacionales />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
