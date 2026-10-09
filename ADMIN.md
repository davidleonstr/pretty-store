# Panel de administración

1. Copia `src/admin/`, `src/lib/adminApi.js` y los `src/lib/api.js` / `src/pages/*` actualizados a tu proyecto.
2. Registra UNA ruta, fuera del layout público (sin header/footer de la tienda):

   ```jsx
   import AdminApp from '@/admin/AdminApp';
   <Route path="/admin/*" element={<AdminApp />} />
   ```
3. Proxy de Vite (o `VITE_API_URL=http://localhost:5000`):

   ```js
   server: { proxy: { '/api': 'http://localhost:5000', '/media': 'http://localhost:5000' } }
   ```
4. Crea el primer administrador en el backend:
   `flask --app wsgi create-admin --nombre "Tu Nombre" --correo tu@correo.com`

Rutas: /admin (panel), /admin/pedidos, /productos, /cajitas, /categorias, /retiros, /horas, /imagenes, /administradores, /cuenta.
Solo usa clases que ya existen en tu CSS (sketch, btn, field, sticker, bubble, h-title, petal-*) y lucide-react / react-router-dom.
