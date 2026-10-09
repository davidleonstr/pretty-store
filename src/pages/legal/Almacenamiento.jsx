import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import LegalLayout, { LEGAL, Section, UL } from './LegalLayout';

export default function Almacenamiento() {
  const [done, setDone] = useState(false);

  // Borra lo que este sitio guardó en este navegador (localStorage y sessionStorage).
  const clear = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* el navegador puede bloquear el acceso: no pasa nada */
    }
    setDone(true);
  };

  return (
    <LegalLayout title="Almacenamiento Local" intro="Además de cookies, los sitios pueden guardar pequeños datos en tu navegador (localStorage y sessionStorage). Esto es lo que hace el nuestro.">
      <Section title="1. Qué es">
        <p>
          Es un espacio del navegador, propio de este sitio, que se queda en <b>tu dispositivo</b>. No se envía automáticamente a nuestros servidores como una
          cookie y otros sitios no pueden leerlo.
        </p>
      </Section>
      <Section title="2. Qué guardamos">
        <UL>
          <li>
            <b>Tu carrito:</b> para que no pierdas lo que elegiste si recargas o cierras la página (si tu carrito se guarda en el navegador).
          </li>
          <li>
            <b>Sesión del panel de administración:</b> solo para el personal; un token de renovación que mantiene la sesión iniciada. Los clientes no lo usan.
          </li>
        </UL>
        <p>
          No guardamos contraseñas de clientes, datos de pago ni información para rastrearte. Tus datos de contacto solo se envían cuando confirmas una reserva
          (ver <Link to="/politica-de-datos">Uso de Datos</Link>).
        </p>
      </Section>
      <Section title="3. Por cuánto tiempo">
        <p>
          El almacenamiento local permanece hasta que lo borres tú o tu navegador. El de sesión se borra al cerrar la pestaña. El token del panel se elimina al
          cerrar sesión.
        </p>
      </Section>
      <Section title="4. Bórralo cuando quieras">
        <p>
          Puedes limpiar los datos del sitio desde tu navegador o con el botón de abajo. Tu carrito se vaciará y, si eres administrador, tendrás que iniciar
          sesión de nuevo.
        </p>
        <button type="button" onClick={clear} className="btn btn-white">
          <Trash2 size={18} /> Borrar datos guardados en este navegador
        </button>
        {done && (
          <p role="status" className="font-semibold">
            Listo, borramos lo que {LEGAL.store} tenía guardado aquí.
          </p>
        )}
      </Section>
      <Section title="5. Contacto">
        <p>
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> · Consulta también <Link to="/politica-de-cookies">Cookies</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
