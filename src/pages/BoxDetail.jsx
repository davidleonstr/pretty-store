import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, CalendarHeart, Gift } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { getBox } from '@/lib/api';
import { usd } from '@/lib/money';
import { Gallery, Photo } from '@/components/Photo';
import { DetailSkeleton } from '@/components/Skeleton';
import NotFound from './NotFound';

export default function BoxDetail() {
  const { slug } = useParams();
  const { loading, data: box } = useAsync(() => getBox(slug), [slug]);

  if (loading) return <DetailSkeleton />;
  if (!box) return <NotFound what="esa cajita" back="/cajas" />;

  return (
    <article className="space-y-6">
      <Link to="/cajas" className="inline-flex items-center gap-1 font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4">
        <ChevronLeft size={18} /> Todas las cajas
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
        <Gallery photos={box.photos} alt={box.name} />

        <div className="space-y-5">
          <span className="sticker">{box.tag}</span>
          <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">{box.name}</h1>
          <p className="h-title text-4xl inline-block bg-petal-300 border-[3px] border-ink rounded-2xl px-4 py-1 -rotate-2">
            {usd(box.priceCents)}
          </p>
          <p className="text-lg">{box.description}</p>

          <section className="sketch !bg-petal-100 p-4 sm:p-5" aria-labelledby="trae">
            <h2 id="trae" className="h-title text-2xl mb-3 flex items-center gap-2">
              <Gift size={22} /> Esta caja trae
            </h2>
            <ul className="space-y-2">
              {box.contents.map(({ product, qty }) => (
                <li key={product.slug}>
                  <Link
                    to={`/producto/${product.slug}`}
                    className="flex items-center gap-3 bg-white border-2 border-ink rounded-xl p-1.5 pr-3 hover:bg-petal-200 transition-colors"
                  >
                    <span className="w-12 h-12 rounded-lg overflow-hidden border-2 border-ink shrink-0">
                      <Photo photo={product.photos[0]} alt="" size="sm" />
                    </span>
                    <span className="flex-1 font-medium leading-tight">
                      {qty > 1 && `${qty}× `}
                      {product.name}
                    </span>
                    <span className="text-sm opacity-70">ver</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {box.soldOut ? (
            <p role="status" className="bubble !rounded-2xl font-semibold">
              Esta cajita está agotada por ahora 🥲
            </p>
          ) : (
            <Link to={`/reservar/caja/${box.slug}`} className="btn btn-deep w-full sm:w-auto">
              <CalendarHeart size={20} /> Reservar para retiro
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
      
