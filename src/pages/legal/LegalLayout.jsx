import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const LEGAL = {
  store: 'Pretty Store',
  email: 'pretty.store.sv.principal@gmail.com',
  updated: '9 de octubre de 2026',
};

const LINKS = [
  ['/terminos-y-condiciones', 'Términos y Condiciones'],
  ['/politica-de-datos', 'Uso de Datos'],
  ['/politica-de-cookies', 'Cookies'],
  ['/almacenamiento', 'Almacenamiento Local'],
];

export function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="h-title text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export const UL = ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>;

export default function LegalLayout({ title, intro, children }) {
  return (
    <article className="max-w-3xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4">
        <ChevronLeft size={18} /> Inicio
      </Link>
      <header className="space-y-2">
        <h1 className="h-title text-4xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">{title}</h1>
        <p className="text-sm opacity-70">Última actualización: {LEGAL.updated}</p>
        {intro && <p>{intro}</p>}
      </header>
      <div className="sketch p-4 sm:p-6 space-y-6 leading-relaxed [&_a]:underline [&_a]:font-semibold">{children}</div>
      <nav aria-label="Otras políticas" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {LINKS.filter(([to]) => to !== (typeof window !== 'undefined' ? window.location.pathname : '')).map(([to, label]) => (
          <Link key={to} to={to} className="underline font-semibold">
            {label}
          </Link>
        ))}
      </nav>
    </article>
  );
}
