
import { supabase } from '@/lib/customSupabaseClient';

export const seedDestinations = async () => {
  try {
    console.log('Seeding destinations...');
    const { count, error: countError } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count === 0) {
      const destinations = [
        {
          name: 'San Andrés',
          category: 'domestic',
          description: 'Disfruta del mar de los siete colores.',
          image_url: 'https://images.unsplash.com/photo-1599807539583-8ebb86d1036b',
          status: 'active'
        },
        {
          name: 'Cartagena',
          category: 'domestic',
          description: 'La heroica, ciudad amurallada llena de historia.',
          image_url: 'https://images.unsplash.com/photo-1534679334002-2daee02d4a46',
          status: 'active'
        },
        {
          name: 'Santa Marta',
          category: 'domestic',
          description: 'Magia de tenerlo todo, sierra y mar.',
          image_url: 'https://images.unsplash.com/photo-1600791833083-8caba2c4c5e0',
          status: 'active'
        },
        {
          name: 'Tayrona',
          category: 'domestic',
          description: 'Naturaleza virgen y playas espectaculares.',
          image_url: 'https://images.unsplash.com/photo-1629270018330-1a5d3f2006e0',
          status: 'active'
        },
        {
          name: 'Cancún',
          category: 'international',
          description: 'Paraíso en la Riviera Maya.',
          image_url: 'https://images.unsplash.com/photo-1692964870783-351ebe62edc6',
          status: 'active'
        },
        {
          name: 'Bora Bora',
          category: 'international',
          description: 'Romance y lujo en la Polinesia Francesa.',
          image_url: 'https://images.unsplash.com/photo-1666030551337-1d003e116c43',
          status: 'active'
        },
        {
          name: 'Costa Rica',
          category: 'international',
          description: 'Pura vida, biodiversidad sin igual.',
          image_url: 'https://images.unsplash.com/photo-1688660563017-6b26083db4b0',
          status: 'active'
        },
        {
          name: 'Machu Picchu',
          category: 'international',
          description: 'Maravilla del mundo antiguo en Perú.',
          image_url: 'https://images.unsplash.com/photo-1470513026140-5baf5d823f96',
          status: 'active'
        }
      ];

      const { error: insertError } = await supabase.from('destinations').insert(destinations);
      if (insertError) throw insertError;
      console.log('Destinations seeded successfully');
    } else {
      console.log('Destinations already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding destinations:', error);
  }
};

export const seedPlans = async () => {
  try {
    console.log('Seeding plans...');
    const { count, error: countError } = await supabase
      .from('plans')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count === 0) {
      const { data: destinations, error: destError } = await supabase.from('destinations').select('id, name');
      if (destError) throw destError;

      if (!destinations || destinations.length === 0) {
         console.warn('No destinations found, cannot seed plans.');
         return;
      }

      const destMap = destinations.reduce((acc, d) => {
        acc[d.name] = d.id;
        return acc;
      }, {});

      const plans = [
        {
          destination_id: destMap['San Andrés'],
          name: 'Plan San Andrés',
          duration_days: 4,
          duration_nights: 3,
          price: 1659000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Johnny Cay, Vuelta a la Isla, Acuario, Hayness cay, La Bahia, Manglares)', 'Seguro'],
          exclusions: ['Tarjeta de ingreso ($153.000)', 'Alimentación no descrita', 'Tarifa Ecológica ($15.000)'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Cartagena'],
          name: 'Plan Cartagena',
          duration_days: 5,
          duration_nights: 4,
          price: 1899000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel 4 estrellas', 'Desayunos', 'Cenas', 'Traslados', 'Tours (City tour, Islas del Rosario, Playa Blanca)', 'Seguro'],
          exclusions: ['Entrada Castillo San Felipe ($25.000)', 'Alimentación no descrita', 'Actividades opcionales'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Santa Marta'],
          name: 'Plan Santa Marta',
          duration_days: 4,
          duration_nights: 3,
          price: 1450000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Ciudad Perdida o Tayrona)', 'Seguro'],
          exclusions: ['Entrada a parques ($50.000)', 'Alimentación no descrita', 'Equipo de senderismo'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Tayrona'],
          name: 'Plan Tayrona',
          duration_days: 3,
          duration_nights: 2,
          price: 1200000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Entrada Parque Tayrona con guía)', 'Seguro'],
          exclusions: ['Entrada al parque en algunos casos', 'Alimentación no descrita', 'Actividades adicionales'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Cancún'],
          name: 'Plan Cancún',
          duration_days: 5,
          duration_nights: 4,
          price: 2450000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Resort all-inclusive', 'Desayunos/almuerzos/cenas', 'Traslados', 'Tours (Playas, piscinas, entretenimiento)', 'Seguro'],
          exclusions: ['Bebidas alcohólicas premium', 'Excursiones opcionales', 'Propinas'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Bora Bora'],
          name: 'Plan Bora Bora',
          duration_days: 6,
          duration_nights: 5,
          price: 4500000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Overwater bungalow', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Snorkel, lagoon tour, island exploration)', 'Seguro'],
          exclusions: ['Bebidas alcohólicas', 'Actividades acuáticas adicionales', 'Propinas'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Costa Rica'],
          name: 'Plan Costa Rica',
          duration_days: 5,
          duration_nights: 4,
          price: 2100000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Volcán, selva, playas, vida silvestre)', 'Seguro'],
          exclusions: ['Entrada a parques nacionales adicionales', 'Alimentación no descrita', 'Actividades opcionales'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        },
        {
          destination_id: destMap['Machu Picchu'],
          name: 'Plan Machu Picchu',
          duration_days: 4,
          duration_nights: 3,
          price: 3200000,
          currency: 'COP',
          available_dates: 'Consulta con tu asesor',
          status: 'active',
          inclusions: ['Vuelos', 'Hotel', 'Desayunos', 'Cenas', 'Traslados', 'Tours (Entrada Machu Picchu con guía especializado)', 'Seguro'],
          exclusions: ['Entrada a sitios arqueológicos adicionales', 'Alimentación no descrita', 'Equipo de montaña'],
          terms_conditions: 'Tarifas sujetas a cambios y disponibilidad. Valor por persona en acomodación doble'
        }
      ].filter(p => p.destination_id); // Ensure only valid plans are added

      if (plans.length > 0) {
        const { error: insertError } = await supabase.from('plans').insert(plans);
        if (insertError) throw insertError;
        console.log('Plans seeded successfully');
      } else {
        console.warn('No valid plans to seed (missing destination IDs).');
      }
    } else {
      console.log('Plans already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding plans:', error);
  }
};
