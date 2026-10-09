# Pretty Store 🌸

Tienda de cajitas y productos para ellas. React + Vite + Tailwind + Lucide, con skeletons en todas las cargas.

## Correr

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (carpeta dist/)
```

Al publicar, configura el hosting para que todas las rutas devuelvan `index.html` (SPA fallback).

## Rutas

| Ruta | Qué muestra |
| --- | --- |
| `/cajas`, `/cajas/buscar/dulce` | Listado y búsqueda de cajas |
| `/caja/caja-dulce-sueno` | Detalle de caja: fotos, descripción, qué trae, precio |
| `/productos`, `/productos/buscar/te` | Listado y búsqueda de productos |
| `/producto/te-de-manzanilla` | Detalle de producto |
| `/bolsito` | Carrito de productos sueltos (máx. $3.00) |
| `/reservar/caja/:nombre` | Reserva de una caja |
| `/reservar/productos` | Reserva de productos del bolsito |
| `/retiro` | Puntos de retiro con mapa y horarios |

Los nombres van en minúsculas, separados por `-` y sin tildes (`src/lib/slug.js`).
`/caja/Caja-Dulce-Sueño` también funciona: se normaliza al buscar.

## Estilo

Paleta tomada del logo (`tailwind.config.js` → `petal`). Bordes "dibujados" con el filtro SVG `#wobble`
(`Layout.jsx`) aplicado a un pseudo-elemento, más sombras duras y trama de puntitos (`index.css`).
