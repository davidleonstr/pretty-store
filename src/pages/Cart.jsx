import { Link } from 'react-router-dom';
import { CalendarHeart, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { PRODUCT_ORDER_MIN_CENTS, usd } from '@/lib/money';
import { Photo } from '@/components/Photo';

export function MinMeter({ total }) {
  const pct = Math.min(100, (total / PRODUCT_ORDER_MIN_CENTS) * 100);
  const reached = total >= PRODUCT_ORDER_MIN_CENTS;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm font-semibold">
        <span>Mínimo por pedido ({usd(PRODUCT_ORDER_MIN_CENTS)})</span>
        <span>{reached ? '¡Mínimo alcanzado! 🎉' : `Te faltan ${usd(PRODUCT_ORDER_MIN_CENTS - total)}`}</span>
      </div>
      <div
        className="h-5 rounded-full border-[3px] border-ink bg-white overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PRODUCT_ORDER_MIN_CENTS}
        aria-valuenow={Math.min(total, PRODUCT_ORDER_MIN_CENTS)}
      >
        <div className="h-full bg-petal-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, total, setQty, remove, clear } = useCart();
  const ok = total >= PRODUCT_ORDER_MIN_CENTS;

  if (items.length === 0) {
    return (
      <div className="sketch p-8 text-center space-y-4 max-w-lg mx-auto">
        <ShoppingBag size={48} className="mx-auto" />
        <h1 className="h-title text-3xl">Tu bolsito está vacío</h1>
        <p>Agrega productos lindos (mínimo {usd(PRODUCT_ORDER_MIN_CENTS)} por pedido).</p>
        <Link to="/productos" className="btn btn-deep">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Tu bolsito</h1>

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.slug} className="sketch p-3 flex items-center gap-3">
            <Link to={`/producto/${it.slug}`} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-ink shrink-0">
              <Photo photo={it.photo} alt={it.name} size="sm" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">{it.name}</p>
              <p className="text-sm opacity-80">{usd(it.priceCents)} c/u</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button type="button" className="btn btn-sm btn-white !p-0 !w-8 !min-h-8 !h-8 !rounded-full" onClick={() => setQty(it.slug, it.qty - 1)} aria-label="Menos">
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="font-bold w-5 text-center">{it.qty}</span>
                <button type="button" className="btn btn-sm btn-white !p-0 !w-8 !min-h-8 !h-8 !rounded-full" onClick={() => setQty(it.slug, it.qty + 1)} aria-label="Más">
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="h-title text-xl">{usd(it.priceCents * it.qty)}</span>
              <button type="button" onClick={() => remove(it.slug)} aria-label={`Quitar ${it.name}`} className="p-1.5 opacity-70 hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="sketch !bg-petal-100 p-4 sm:p-5 space-y-4">
        <MinMeter total={total} />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">Total</span>
          <span className="h-title text-3xl">{usd(total)}</span>
        </div>
        <Link
          to="/reservar/productos"
          className="btn btn-deep w-full"
          aria-disabled={!ok}
          onClick={(e) => !ok && e.preventDefault()}
        >
          <CalendarHeart size={20} /> Reservar para retiro
        </Link>
        {!ok && (
          <p className="text-sm text-center font-semibold">
            Agrega {usd(PRODUCT_ORDER_MIN_CENTS - total)} más para poder reservar.{' '}
            <Link to="/productos" className="underline">Ver productos</Link>
          </p>
        )}
        <button type="button" onClick={clear} className="text-sm underline underline-offset-4 opacity-80 mx-auto block">
          Vaciar bolsito
        </button>
      </div>
    </div>
  );
}
      
