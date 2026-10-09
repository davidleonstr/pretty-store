import { useParams } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { listProducts } from '@/lib/api';
import { ProductCard } from '@/components/Cards';
import { GridSkeleton } from '@/components/Skeleton';
import { SearchBar } from '@/components/SearchBar';
import { Empty, ErrorState } from './Boxes';
import { PRODUCT_ORDER_MIN_CENTS, usd } from '@/lib/money';

export default function Products() {
  const { texto = '' } = useParams();
  const { loading, data, error } = useAsync(() => listProducts({ q: texto }), [texto]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Productos</h1>
        <p>Cositas sueltas para completar tu día.</p>
      </header>

      <div className="bubble flex items-start gap-2 !rounded-2xl w-full sm:w-auto sm:!inline-flex">
        <PackageCheck size={20} className="shrink-0 mt-0.5" />
        <span className="text-sm font-medium">
          Los pedidos de productos sueltos deben sumar al menos <b>{usd(PRODUCT_ORDER_MIN_CENTS)}</b>.
        </span>
      </div>

      <SearchBar base="/productos" placeholder="Buscar un producto…" />

      {loading ? (
        <GridSkeleton count={8} product />
      ) : error ? (
        <ErrorState />
      ) : data.length === 0 && texto ? (
        <Empty text="Prueba con otro nombre." />
      ) : data.length === 0 ? (
        <Empty title="No hay productos en este momento" text="Estamos surtiendo la tienda. ¡Vuelve pronto! 💕" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {data.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
      
