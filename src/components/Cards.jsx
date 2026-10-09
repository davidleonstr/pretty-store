import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { Photo } from './Photo';
import { usd } from '@/lib/money';
import { useCart } from '@/lib/CartContext';

export function BoxCard({ box }) {
  return (
    <Link
      to={`/caja/${box.slug}`}
      className="sketch p-2.5 sm:p-3 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:-rotate-1"
    >
      <div className="relative aspect-square rounded-[12px] overflow-hidden">
        <Photo photo={box.photos[0]} alt={box.name} />
        <span className="sticker absolute top-2 left-2 text-xs sm:text-sm bg-white">{box.tag}</span>
      </div>
      <div className="px-1 flex-1">
        <h3 className="h-title text-xl sm:text-2xl text-petal-600">{box.name}</h3>
        <p className="text-sm mt-1 opacity-85">{box.short}</p>
        <p className="text-xs mt-1 opacity-70">{box.items.length} cositas lindas dentro</p>
      </div>
      <div className="px-1 pb-1 flex items-center justify-between">
        <span className="h-title text-2xl bg-petal-200 border-[2.5px] border-ink rounded-xl px-2.5 py-0.5 -rotate-2">
          {usd(box.priceCents)}
        </span>
        <span
          className="grid place-items-center w-10 h-10 rounded-full bg-petal-400 border-[2.5px] border-ink"
          aria-hidden="true"
        >
          <ArrowRight size={20} strokeWidth={3} />
        </span>
      </div>
    </Link>
  );
}

export function ProductCard({ product }) {
  const { add } = useCart();
  return (
    <div className="sketch p-2.5 sm:p-3 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:rotate-1">
      <Link to={`/producto/${product.slug}`} className="block space-y-3">
        <div className="relative aspect-square rounded-[12px] overflow-hidden">
          <Photo photo={product.photos[0]} alt={product.name} />
          <span className="sticker absolute top-2 left-2 text-xs bg-white">{product.tag}</span>
        </div>
        <h3 className="px-1 font-semibold leading-tight">{product.name}</h3>
      </Link>
      <div className="px-1 pb-1 flex items-center justify-between mt-auto">
        <span className="h-title text-xl">{usd(product.priceCents)}</span>
        <button
          type="button"
          onClick={() => add(product)}
          aria-label={`Agregar ${product.name} al bolsito`}
          className="btn btn-sm !p-0 !w-10 !min-h-10 !h-10 !rounded-full"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
