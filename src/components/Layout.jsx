import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Gift, Heart, Home, MapPin, ShoppingBag, Sparkles, Instagram } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

const NAV = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/cajas', label: 'Cajas', icon: Gift },
  { to: '/productos', label: 'Productos', icon: Sparkles },
  { to: '/retiro', label: 'Retiro', icon: MapPin },
];

// Filtro SVG que hace que los bordes parezcan trazados a mano
function WobbleFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
      </filter>
    </svg>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BagLink({ className = '' }) {
  const { count } = useCart();
  return (
    <Link to="/bolsito" aria-label={`Bolsito, ${count} productos`} className={`relative ${className}`}>
      <ShoppingBag size={24} strokeWidth={2.5} />
      {count > 0 && (
        <span className="absolute -top-2 -right-3 min-w-[22px] h-[22px] px-1 grid place-items-center text-xs font-bold bg-petal-600 text-white border-2 border-ink rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

function Toast() {
  const { notice } = useCart();
  if (!notice) return null;
  return (
    <div
      key={notice.id}
      role="status"
      className="fixed z-50 left-4 bottom-24 md:bottom-8 max-w-[calc(100%-2rem)] sm:max-w-sm animate-pop"
    >
      <div className={`bubble text-left font-medium ${notice.tone === 'warn' ? '!bg-petal-200' : ''}`}>
        {notice.tone === 'warn' ? '🙈 ' : '💖 '}
        {notice.msg}
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <WobbleFilter />
      <ScrollToTop />

      <header className="sticky top-0 z-40 bg-petal-200/95 backdrop-blur border-b-[3px] border-ink">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Pretty Store, inicio">
            <span className="h-title text-2xl sm:text-3xl text-petal-600 [text-shadow:2px_2px_0_#4A1530]">
              Pretty Store
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2" aria-label="Principal">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 font-medium transition-colors ${
                    isActive
                      ? 'text-petal-600 underline decoration-wavy decoration-petal-400 decoration-2 underline-offset-8'
                      : 'hover:text-petal-600'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2.5} />
                {label}
              </NavLink>
            ))}
          </nav>

          <BagLink className="p-2" />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 pb-28 md:pb-12">
        <Outlet />
      </main>

    <footer className="hidden md:block border-t-[3px] border-ink bg-petal-200 py-6">
      <div className="mx-auto max-w-6xl px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
        
        {/* Marca y Redes Sociales */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 h-title text-xl text-petal-600 font-bold">
            Pretty Store
          </span>
          <a
            href="https://instagram.com/prettystore.site"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-ink hover:text-petal-600 transition-colors"
          >
            <Instagram size={18} />
          </a>
        </div>

        {/* Enlaces Legales y Políticas */}
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/80">
          <a href="/terminos-y-condiciones" className="hover:underline hover:text-petal-600">
            Términos y Condiciones
          </a>
          <span>•</span>
          <a href="/politica-de-datos" className="hover:underline hover:text-petal-600">
            Uso de Datos
          </a>
          <span>•</span>
          <a href="/politica-de-cookies" className="hover:underline hover:text-petal-600">
            Cookies
          </a>
          <span>•</span>
          <a href="/almacenamiento" className="hover:underline hover:text-petal-600">
            Almacenamiento Local
          </a>
        </nav>

        {/* Crédito */}
        <span className="flex items-center gap-1.5 text-xs">
          Hecho con <Heart size={16} className="fill-petal-600 text-petal-600 inline" /> para ellas y l@s detallistas
        </span>

      </div>
    </footer>

      {/* Barra inferior para móvil */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-petal-200 border-t-[3px] border-ink safe-bottom"
        aria-label="Principal"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    isActive ? 'text-petal-600' : 'text-ink/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 3 : 2.5}
                      className={`transition-transform ${isActive ? '-translate-y-0.5 -rotate-6 scale-110' : ''}`}
                    />
                    <span
                      className={
                        isActive
                          ? ''
                          : ''
                      }
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toast />
    </div>
  );
}
