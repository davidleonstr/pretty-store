import { Link } from 'react-router-dom';
import LegalLayout, { LEGAL, Section, UL } from './LegalLayout';

export default function UsoDeDatos() {
  return (
    <LegalLayout title="Uso de Datos" intro={`Esta política explica qué datos personales recoge ${LEGAL.store}, para qué los usamos y qué derechos tienes.`}>
      <Section title="1. Qué datos recogemos">
        <UL>
          <li><b>Al reservar:</b> nombres, apellidos, número de celular, correo electrónico y la nota opcional que escribas.</li>
          <li><b>De tu reserva:</b> productos o cajita elegidos, total, lugar y hora de retiro, estado y fecha de creación.</li>
          <li><b>Técnicos:</b> tu dirección IP, usada de forma temporal para limitar abusos (por ejemplo, demasiados intentos seguidos).</li>
        </UL>
        <p>No pedimos datos de tarjetas ni de pago: el pago se hace en persona al retirar.</p>
      </Section>
      <Section title="2. Para qué los usamos">
        <UL>
          <li>Preparar tu pedido y coordinar el retiro.</li>
          <li>Contactarte sobre tu reserva (cambios, confirmaciones, imprevistos).</li>
          <li>Permitirte ver, modificar o cancelar tu reserva con tu código.</li>
          <li>Llevar el control de inventario y ventas, y proteger el sitio contra abusos.</li>
        </UL>
        <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
      </Section>
      <Section title="3. Con quién los compartimos">
        <p>
          Solo con el equipo de {LEGAL.store} que gestiona los pedidos y con los proveedores que alojan el sitio y su base de datos, únicamente para operarlo.
          También podríamos entregarlos si una autoridad competente lo exige por ley.
        </p>
      </Section>
      <Section title="4. Cuánto tiempo los conservamos">
        <p>
          Mientras sean necesarios para atender tu pedido y llevar nuestros registros. Puedes pedirnos que eliminemos tus datos cuando ya no haya un motivo
          legítimo para conservarlos.
        </p>
      </Section>
      <Section title="5. Seguridad">
        <p>
          Usamos conexiones cifradas y acceso restringido al panel de administración. Tu código de reserva funciona como llave de acceso a tu pedido:{' '}
          <b>no lo compartas</b>. Ningún sistema es 100 % infalible, pero cuidamos tu información.
        </p>
      </Section>
      <Section title="6. Tus derechos">
        <p>Puedes pedirnos, en cualquier momento:</p>
        <UL>
          <li>Saber qué datos tuyos tenemos.</li>
          <li>Corregir datos incorrectos (también puedes hacerlo tú mismo desde <Link to="/pedido">Mi reserva</Link> mientras esté pendiente).</li>
          <li>Eliminar tus datos o limitar su uso.</li>
        </UL>
        <p>
          Escríbenos a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> indicando tu código de reserva o tu correo.
        </p>
      </Section>
      <Section title="7. Menores de edad">
        <p>Si eres menor de edad, haz tus reservas con ayuda de una persona adulta responsable.</p>
      </Section>
      <Section title="8. Cambios">
        <p>
          Si esta política cambia, actualizaremos la fecha de arriba. Consulta también <Link to="/politica-de-cookies">Cookies</Link>,{' '}
          <Link to="/almacenamiento">Almacenamiento Local</Link> y los <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
