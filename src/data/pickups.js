// Puntos de retiro predefinidos (DATOS DE PRUEBA: ajusta nombres, coordenadas y horarios).
// Los mismos puntos y horarios se usan para compra con tarjeta y para reserva.
export const PICKUPS = [
  {
    id: 'parque-central-chalchuapa',
    name: 'Parque Central de Chalchuapa',
    address: 'Frente a la iglesia, Chalchuapa, Santa Ana',
    lat: 13.9887,
    lon: -89.6775,
    hours: [
      { id: 'lv-1000', label: 'Lunes a viernes · 10:00 AM' },
      { id: 'lv-1500', label: 'Lunes a viernes · 3:00 PM' },
      { id: 'sab-1100', label: 'Sábado · 11:00 AM' },
    ],
  },
  {
    id: 'entrada-tazumal',
    name: 'Entrada del Tazumal',
    address: 'Parque Arqueológico Tazumal, Chalchuapa',
    lat: 13.9768,
    lon: -89.6667,
    hours: [
      { id: 'mi-1400', label: 'Miércoles · 2:00 PM' },
      { id: 'sab-1000', label: 'Sábado · 10:00 AM' },
      { id: 'dom-1300', label: 'Domingo · 1:00 PM' },
    ],
  },
  {
    id: 'parque-libertad-santa-ana',
    name: 'Parque Libertad, Santa Ana',
    address: 'Centro de Santa Ana',
    lat: 13.9946,
    lon: -89.5599,
    hours: [
      { id: 'ma-1600', label: 'Martes · 4:00 PM' },
      { id: 'vi-1700', label: 'Viernes · 5:00 PM' },
      { id: 'sab-1500', label: 'Sábado · 3:00 PM' },
    ],
  },
];
