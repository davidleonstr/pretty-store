import { slugify } from '@/lib/slug';

const BG = ['#FFD5E0', '#FFE6EC', '#F6B1C3', '#F7B4C9'];
const DECO = ['✨', '💖', '🌸'];

// Fotos de prueba (ilustraciones). En producción cada foto puede traer { src: 'https://...' }.
export const photosFor = (emoji, seed = 0) =>
  [0, 1, 2].map((k) => ({ emoji, bg: BG[(seed + k) % BG.length], deco: DECO[k] }));

const P = (name, emoji, priceCents, tag, description) => ({
  slug: slugify(name),
  name,
  emoji,
  priceCents,
  tag,
  description,
  photos: photosFor(emoji, name.length),
});

// Precios en centavos USD. Todos son menores a $3.00.
export const PRODUCTS = [
  P('Mascarilla de fresa', '🍓', 175, 'Cuidado', 'Mascarilla facial que huele a fresas con crema. Diez minutos y a brillar.'),
  P('Antifaz de nubes', '☁️', 225, 'Dormir', 'Antifaz suavecito con relleno de nube para sueños profundos.'),
  P('Vela de vainilla', '🕯️', 275, 'Aroma', 'Vela pequeña de vainilla en frasquito rosa. Dura unas 15 horas.'),
  P('Té de manzanilla', '🍵', 150, 'Dormir', 'Cinco bolsitas de té de manzanilla para las noches tranquilas.'),
  P('Scrunchie de satén', '🌸', 125, 'Accesorios', 'Colita de satén que no jala ni maltrata el cabello.'),
  P('Gomitas de melocotón', '🍑', 100, 'Dulces', 'Bolsita de gomitas con sabor a melocotón. Peligrosamente adictivas.'),
  P('Labial cereza', '🍒', 200, 'Maquillaje', 'Labial cremoso en tono cereza, acabado satinado.'),
  P('Brillo labial perlado', '✨', 175, 'Maquillaje', 'Gloss con destellos perlados y sabor a algodón de azúcar.'),
  P('Espejito de bolsillo', '🪞', 150, 'Accesorios', 'Espejo redondo con tapa dibujada, cabe en cualquier bolsito.'),
  P('Lazo de satén', '🎀', 125, 'Accesorios', 'Lazo grande de satén rosa para el cabello o para decorar regalos.'),
  P('Stickers kawaii', '⭐', 100, 'Papelería', 'Hoja de stickers con estrellitas, nubes y gatitos.'),
  P('Jabón de rosas', '🌹', 200, 'Cuidado', 'Jabón artesanal de pétalos de rosa con aroma suave.'),
  P('Bálsamo de miel', '🍯', 125, 'Cuidado', 'Bálsamo para labios con miel. Hidrata y deja un brillito.'),
  P('Crema de lavanda', '💜', 250, 'Cuidado', 'Crema de manos con lavanda, ligera y de rápida absorción.'),
  P('Esmalte lila', '💅', 175, 'Maquillaje', 'Esmalte lila pastel de secado rápido.'),
  P('Glitter corporal', '💫', 225, 'Maquillaje', 'Gel con glitter fino para fiestas y fotos bonitas.'),
  P('Diadema de estrellas', '👑', 250, 'Accesorios', 'Diadema dorada con estrellitas para sentirte princesa.'),
  P('Libreta de nubes', '📓', 275, 'Papelería', 'Libreta pequeña de tapa dura con hojas punteadas.'),
  P('Llavero de conejito', '🐰', 150, 'Accesorios', 'Conejito de peluche en versión llavero.'),
  P('Palomitas dulces', '🍿', 125, 'Dulces', 'Palomitas con caramelo rosa, listas para la peli de la noche.'),
  P('Paleta de sombras rosa', '🎨', 275, 'Maquillaje', 'Seis sombras en tonos rosados, mate y con brillo.'),
  P('Chocolate de fresa', '🍫', 100, 'Dulces', 'Barrita de chocolate blanco con trocitos de fresa.'),
  P('Pulsera de perlitas', '📿', 200, 'Accesorios', 'Pulsera elástica de perlitas rosadas.'),
  P('Clip de mariposa', '🦋', 100, 'Accesorios', 'Clip metálico con mariposa de colores pastel.'),
];
