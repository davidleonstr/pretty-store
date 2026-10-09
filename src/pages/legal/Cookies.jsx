import { Link } from 'react-router-dom';
import LegalLayout, { LEGAL, Section, UL } from './LegalLayout';

export default function Cookies() {
  return (
    <LegalLayout title="Política de Cookies" intro="Las cookies son pequeños archivos que un sitio guarda en tu navegador. Aquí te contamos cómo las usamos.">
      <Section title="1. Resumen">
        <p>
          {LEGAL.store} <b>no usa cookies de publicidad, seguimiento ni analítica de terceros</b>. Por eso no mostramos un aviso de aceptación de cookies.
        </p>
      </Section>
      <Section title="2. Qué usamos">
        <UL>
          <li>
            <b>Cookies estrictamente necesarias:</b> si el sitio llegara a usarlas, sería solo para que funcione (por ejemplo, mantener tu sesión segura en el
            panel de administración). No requieren tu consentimiento.
          </li>
          <li>
            <b>Preferencias y sesión en tu navegador:</b> en lugar de cookies, usamos el almacenamiento del navegador. Lo explicamos en{' '}
            <Link to="/almacenamiento">Almacenamiento Local</Link>.
          </li>
        </UL>
      </Section>
      <Section title="3. Cookies de terceros">
        <p>
          Algunos contenidos, como mapas incrustados de los puntos de retiro, pueden cargarse desde otros servicios que aplican sus propias cookies y políticas.
          Si no quieres cargarlos, puedes bloquearlos desde tu navegador y seguir reservando con la dirección en texto.
        </p>
      </Section>
      <Section title="4. Cómo controlarlas">
        <p>Puedes ver, bloquear o borrar cookies desde la configuración de tu navegador:</p>
        <UL>
          <li>Chrome: Configuración → Privacidad y seguridad → Cookies.</li>
          <li>Firefox: Ajustes → Privacidad y seguridad.</li>
          <li>Safari: Ajustes → Privacidad.</li>
          <li>Edge: Configuración → Cookies y permisos del sitio.</li>
        </UL>
        <p>Bloquear las necesarias podría impedir que algunas partes del sitio funcionen.</p>
      </Section>
      <Section title="5. Contacto">
        <p>
          Dudas: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Más sobre tus datos en <Link to="/politica-de-datos">Uso de Datos</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
