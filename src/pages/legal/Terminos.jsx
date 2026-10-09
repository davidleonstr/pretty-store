import { Link } from 'react-router-dom';
import LegalLayout, { LEGAL, Section, UL } from './LegalLayout';

export default function Terminos() {
  return (
    <LegalLayout title="Términos y Condiciones" intro={`Al usar este sitio y reservar en ${LEGAL.store} aceptas las siguientes condiciones. Léelas con calma.`}>
      <Section title="1. Qué es este sitio">
        <p>
          {LEGAL.store} es una tienda en línea de productos y cajitas armadas. El sitio funciona como un sistema de <b>reservas con retiro en persona</b>: no
          hacemos envíos a domicilio desde la web.
        </p>
      </Section>
      <Section title="2. Cómo funciona una reserva">
        <UL>
          <li>Eliges productos o una cajita, tu lugar de retiro y una hora disponible, y completas tus datos de contacto.</li>
          <li>Al confirmar recibes un <b>código de reserva</b> con el formato PS-ABC123.</li>
          <li>Reservar no requiere pago en línea: <b>pagas al retirar</b>, en el lugar y hora elegidos.</li>
          <li>Podemos contactarte por el celular o correo que nos diste para coordinar tu retiro.</li>
        </UL>
      </Section>
      <Section title="3. Precios y disponibilidad">
        <UL>
          <li>Los precios se muestran en dólares estadounidenses (USD) y pueden cambiar sin previo aviso; se respeta el precio visto al reservar.</li>
          <li>Los productos tienen existencias limitadas. Al reservar apartamos las unidades; si algo se agota, no podrás reservarlo.</li>
          <li>Los pedidos de productos sueltos tienen un monto mínimo de <b>$3.00</b>.</li>
          <li>Las fotos son referenciales; los colores y detalles pueden variar ligeramente.</li>
        </UL>
      </Section>
      <Section title="4. Modificar o cancelar">
        <p>
          Con tu código puedes ver, modificar o cancelar tu reserva en <Link to="/pedido">Mi reserva</Link>, mientras esté en estado <b>pendiente</b>. Cuando ya
          está en proceso o lista para retirar, escríbenos. Al cancelar, las unidades vuelven al inventario.
        </p>
        <p>
          <b>Guarda tu código:</b> cualquier persona que lo tenga puede ver y gestionar la reserva. No lo compartas.
        </p>
      </Section>
      <Section title="5. Retiro">
        <UL>
          <li>Debes retirar en el lugar, fecha y hora de tu reserva. Si no puedes, modifícala o cancélala con anticipación.</li>
          <li>Si no te presentas ni avisas, podemos cancelar la reserva y liberar los productos.</li>
          <li>Revisa tu pedido al recibirlo; cualquier problema, avísanos en el momento.</li>
        </UL>
      </Section>
      <Section title="6. Tus responsabilidades">
        <UL>
          <li>Dar datos de contacto verdaderos y actuales.</li>
          <li>No usar el sitio para fines ilícitos, ni intentar vulnerarlo o hacer reservas falsas o masivas.</li>
        </UL>
      </Section>
      <Section title="7. Propiedad intelectual">
        <p>
          El nombre, diseño, textos e imágenes de {LEGAL.store} nos pertenecen o se usan con permiso. No puedes copiarlos ni usarlos comercialmente sin
          autorización.
        </p>
      </Section>
      <Section title="8. Limitación de responsabilidad">
        <p>
          Hacemos lo posible por que el sitio esté disponible y la información sea correcta, pero puede haber interrupciones o errores. No respondemos por
          daños derivados de usos no previstos del sitio, salvo lo que la ley no permita excluir.
        </p>
      </Section>
      <Section title="9. Datos personales">
        <p>
          Cómo tratamos tus datos está en <Link to="/politica-de-datos">Uso de Datos</Link>, y lo que guardamos en tu navegador en{' '}
          <Link to="/politica-de-cookies">Cookies</Link> y <Link to="/almacenamiento">Almacenamiento Local</Link>.
        </p>
      </Section>
      <Section title="10. Cambios y contacto">
        <p>
          Podemos actualizar estos términos; la fecha de arriba indica la última versión. Estas condiciones se rigen por las leyes de El Salvador. Para dudas:{' '}
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
