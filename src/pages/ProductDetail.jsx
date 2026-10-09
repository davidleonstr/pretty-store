import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { getProduct } from '@/lib/api';
import { PRODUCT_ORDER_MIN_CENTS, usd } from '@/lib/money';
import { useCart } from '@/lib/CartContext';
import { Gallery } from '@/components/Photo';
import { DetailSkeleton } from '@/components/Skeleton';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const { loading, data: p } = useAsync(() => getProduct(slug), [slug]);
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (loading) return <DetailSkeleton />;
  if (!p) return <NotFound what="ese producto" back="/productos" />;

  return (
    <article className="space-y-6">
      <Link to="/productos" className="inline-flex items-center gap-1 font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4">
        <ChevronLeft size={18} /> Todos los productos
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <Gallery photos={p.photos} alt={p.name} />

        <div className="space-y-5">
          <span className="sticker">{p.tag}</span>
          <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">{p.name}</h1>
          <p className="h-title text-4xl inline-block bg-petal-300 border-[3px] border-ink rounded-2xl px-4 py-1 -rotate-2">
            {usd(p.priceCents)}
          </p>
          <p className="text-lg">{p.description}</p>

          <div className="flex items-center gap-4">
            <span className="font-semibold">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-sm btn-white !p-0 !w-10 !rounded-full"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Menos"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <span className="h-title text-2xl w-6 text-center" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-white !p-0 !w-10 !rounded-full"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Más"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button type="button" className="btn btn-deep" disabled={p.soldOut} onClick={() => add(p, qty)}>
              <Plus size={20} /> {p.soldOut ? 'Agotado' : 'Agregar al bolsito'}
            </button>
            <Link to="/bolsito" className="btn btn-white">
              <ShoppingBag size={20} /> Ir al bolsito
            </Link>
          </div>
          <p className="text-sm opacity-80">
            Los pedidos de productos sueltos deben sumar al menos {usd(PRODUCT_ORDER_MIN_CENTS)}.
          </p>

          {p.inBoxes.length > 0 && (
            <section className="sketch !bg-petal-100 p-4" aria-labelledby="enCajas">
              <h2 id="enCajas" className="h-title text-2xl mb-2">También viene en…</h2>
              <ul className="flex flex-wrap gap-2">
                {p.inBoxes.map((b) => (
                  <li key={b.slug}>
                    <Link to={`/caja/${b.slug}`} className="sticker !rotate-0 hover:!bg-petal-300 transition-colors">
                      {b.emoji} {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
      
