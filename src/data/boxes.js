import { slugify } from '@/lib/slug';
import { photosFor } from './products';

// items: nombres de productos. Se resuelven por slug contra PRODUCTS.
const B = (name, emoji, priceCents, tag, short, description, items) => ({
  slug: slugify(name),
  name,
  emoji,
  priceCents,
  tag, // "Para ti" | "Regalo" | "Combo"
  short,
  description,
  items: items.map((n) => ({ slug: slugify(n), qty: 1 })),
  photos: photosFor(emoji, name.length),
});

export const BOX_TAGS = ['Para ti', 'Regalo', 'Combo'];

export const BOXES = [
  B(
    'Caja Dulce Sueño', '🌙', 2400, 'Para ti',
    'Una noche de spa en casa.',
    'Todo lo necesario para una noche de descanso: mascarilla, aromas, té calentito y un antifaz de nube. Viene en una caja rosa con lazo y tarjetita.',
    ['Mascarilla de fresa', 'Antifaz de nubes', 'Vela de vainilla', 'Té de manzanilla', 'Scrunchie de satén', 'Gomitas de melocotón'],
  ),
  B(
    'Caja Cerezita', '🍒', 1800, 'Para ti',
    'Labios y detalles en rojo cereza.',
    'Una cajita pequeña con todo para tus labios y un toque de papelería kawaii. Perfecta para llevar en la mochila.',
    ['Labial cereza', 'Brillo labial perlado', 'Espejito de bolsillo', 'Lazo de satén', 'Stickers kawaii'],
  ),
  B(
    'Caja Jardín Secreto', '🌷', 2200, 'Para ti',
    'Aromas de flores para consentirte.',
    'Rosas, lavanda y miel en una caja inspirada en un jardín escondido. Ideal para cuidar piel y manos.',
    ['Jabón de rosas', 'Bálsamo de miel', 'Crema de lavanda', 'Té de manzanilla', 'Lazo de satén'],
  ),
  B(
    'Caja Unicornio', '🦄', 2800, 'Regalo',
    'Brillos, estrellas y mucha magia.',
    'Una caja llena de brillo para quien ama lo mágico: esmalte, glitter, diadema y dulces. Viene decorada con arcoíris dibujado.',
    ['Esmalte lila', 'Glitter corporal', 'Diadema de estrellas', 'Gomitas de melocotón', 'Libreta de nubes', 'Stickers kawaii'],
  ),
  B(
    'Caja Mini Detalle', '🎁', 900, 'Regalo',
    'Un detalle pequeño que dice mucho.',
    'La opción para sorprender sin complicarte: tres cositas lindas en una cajita con moño.',
    ['Bálsamo de miel', 'Llavero de conejito', 'Stickers kawaii'],
  ),
  B(
    'Caja Mejores Amigas', '👯', 3200, 'Combo',
    'Combo doble para compartir.',
    'Una caja para dos con accesorios y detalles iguales, para que cada una tenga el suyo. Incluye una tarjetita para escribirse notas.',
    ['Pulsera de perlitas', 'Clip de mariposa', 'Scrunchie de satén', 'Llavero de conejito', 'Brillo labial perlado', 'Chocolate de fresa', 'Stickers kawaii'],
  ),
  B(
    'Caja Cumple Feliz', '🎂', 3500, 'Regalo',
    'Para celebrar a lo grande.',
    'La caja de cumpleaños más completa: maquillaje, dulces y accesorios, con envoltura de fiesta y tarjeta dedicada.',
    ['Paleta de sombras rosa', 'Labial cereza', 'Diadema de estrellas', 'Vela de vainilla', 'Chocolate de fresa', 'Gomitas de melocotón', 'Lazo de satén'],
  ),
  B(
    'Caja Noche de Películas', '🍿', 2000, 'Combo',
    'Combo de peli, snacks y mantita de mimos.',
    'Lo básico para una noche de películas con tu mejor amiga: snacks, té, mascarillas y antifaces.',
    ['Palomitas dulces', 'Chocolate de fresa', 'Té de manzanilla', 'Mascarilla de fresa', 'Antifaz de nubes'],
  ),
];
