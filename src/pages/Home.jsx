import { Link } from 'react-router-dom';
import { CalendarHeart, Gift, MapPin, Sparkles } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { listBoxes, listProducts } from '@/lib/api';
import { BoxCard, ProductCard } from '@/components/Cards';
import { GridSkeleton } from '@/components/Skeleton';
import { Empty, ErrorState } from './Boxes';

function SectionTitle({ children, to, cta }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5">
      <h2 className="h-title text-3xl sm:text-4xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">{children}</h2>
      {to && (
        <Link to={to} className="font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4 shrink-0">
          {cta}
        </Link>
      )}
    </div>
  );
}

const STEPS = [
  { icon: Gift, title: '1. Elige', text: 'Una caja lista o productos sueltos.', bg: 'bg-petal-200' },
  { icon: MapPin, title: '2. Escoge el lugar', text: 'Retiras en un punto y hora de la lista.', bg: 'bg-petal-100' },
  { icon: CalendarHeart, title: '3. Reserva', text: 'Aparta tu pedido sin pagar ahora.', bg: 'bg-petal-300' },
];

export default function Home() {
  const boxes = useAsync(() => listBoxes(), []);
  const products = useAsync(() => listProducts(), []);

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* Portada */}
      <section className="sketch !bg-petal-200 p-6 sm:p-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
        <div className="space-y-5 text-center md:text-left">
          <span className="bubble text-sm font-semibold">¡Hola, bonita! 💕</span>
          <h1 className="h-title text-5xl sm:text-7xl text-petal-600 [text-shadow:3px_3px_0_#4A1530]">
            Pretty
            <br />
            Store
          </h1>
          <p className="text-lg max-w-md mx-auto md:mx-0">
            Cajitas, regalos y detalles lindos pensados para ellas. Reserva y retira cuando quieras.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link to="/cajas" className="btn btn-deep">
              <Gift size={20} /> Ver cajitas
            </Link>
            <Link to="/productos" className="btn btn-white">
              <Sparkles size={20} /> Productos sueltos
            </Link>
          </div>
        </div>
        <div className="relative grid place-items-center">
          <div className="absolute inset-4 rounded-full bg-white/70 border-[3px] border-dashed border-petal-400" />
          <img
            src="/logo.svg"
            alt="Flor rosa de Pretty Store"
            className="relative w-56 sm:w-72 animate-floaty drop-shadow-[4px_4px_0_rgba(74,21,48,.35)]"
          />
          <span className="sticker absolute top-2 right-2 sm:right-6 bg-white animate-wiggle">¡Nueva Tienda! ✨</span>
        </div>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="como">
        <SectionTitle>
          <span id="como">¿Cómo funciona?</span>
        </SectionTitle>
        <div className="grid sm:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, text, bg }, i) => (
            <div key={title} className={`sketch p-5 ${bg} ${i % 2 ? 'sm:rotate-1' : 'sm:-rotate-1'}`}>
              <div className="grid place-items-center w-12 h-12 rounded-full bg-white border-[3px] border-ink mb-3">
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="h-title text-2xl">{title}</h3>
              <p className="mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cajas destacadas */}
      <section aria-labelledby="cajas">
        <SectionTitle to="/cajas" cta="Ver todas">
          <span id="cajas">Cajitas favoritas</span>
        </SectionTitle>
        {boxes.loading ? (
          <GridSkeleton count={4} />
        ) : boxes.error ? (
          <ErrorState />
        ) : !boxes.data?.length ? (
          <Empty title="No hay cajitas en este momento" text="Estamos preparando cositas nuevas. ¡Vuelve pronto! 💕" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(boxes.data ?? []).slice(0, 4).map((b) => (
              <BoxCard key={b.slug} box={b} />
            ))}
          </div>
        )}
      </section>

      {/* Productos */}
      <section aria-labelledby="prods">
        <SectionTitle to="/productos" cta="Ver todos">
          <span id="prods">Cositas sueltas</span>
        </SectionTitle>
        {products.loading ? (
          <GridSkeleton count={4} product />
        ) : products.error ? (
          <ErrorState />
        ) : !products.data?.length ? (
          <Empty title="No hay productos en este momento" text="Estamos surtiendo la tienda. ¡Vuelve pronto! 💕" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(products.data ?? []).slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Reserva */}
      <section className="sketch !bg-petal-300 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <CalendarHeart size={56} strokeWidth={2} className="shrink-0" />
        <div className="flex-1">
          <h2 className="h-title text-3xl">Reserva y retira cuando quieras</h2>
          <p className="mt-1">
            Aparta tu caja o tus productos sin pagar ahora y retíralos después en el punto y la hora que elijas.
          </p>
        </div>
        <Link to="/retiro" className="btn btn-white shrink-0">
          <MapPin size={18} /> Ver puntos de retiro
        </Link>
      </section>
    </div>
  );
}
      
