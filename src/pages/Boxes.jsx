import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { listBoxes, listBoxTags } from '@/lib/api';
import { BoxCard } from '@/components/Cards';
import { GridSkeleton } from '@/components/Skeleton';
import { SearchBar } from '@/components/SearchBar';

export function Empty({ text, title = 'Ay, nada por aquí…' }) {
  return (
    <div className="sketch p-8 text-center space-y-2">
      <SearchX size={40} className="mx-auto" />
      <p className="h-title text-2xl">{title}</p>
      <p>{text}</p>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="sketch p-8 text-center space-y-2" role="alert">
      <p className="text-5xl" aria-hidden="true">🔌</p>
      <p className="h-title text-2xl">No pudimos cargar esto</p>
      <p>Revisa tu conexión e intenta de nuevo en un momento.</p>
    </div>
  );
}

export default function Boxes() {
  const { texto = '' } = useParams();
  const [tag, setTag] = useState('');
  const { loading, data, error } = useAsync(() => listBoxes({ q: texto, tag }), [texto, tag]);
  const tags = useAsync(() => listBoxTags(), []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Cajitas</h1>
        <p>Combos y paquetes listos para regalar (o regalarte).</p>
      </header>

      <SearchBar base="/cajas" placeholder="Buscar una caja…" />

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="group" aria-label="Filtrar por tipo">
        {['', ...(tags.data ?? [])].map((t) => (
          <button
            key={t || 'todas'}
            type="button"
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
            className={`sticker !rotate-0 shrink-0 text-lg ${tag === t ? '!bg-petal-400' : ''}`}
          >
            {t || 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : error ? (
        <ErrorState />
      ) : data.length === 0 && (texto || tag) ? (
        <Empty text="Prueba con otro nombre o quita el filtro." />
      ) : data.length === 0 ? (
        <Empty title="No hay cajitas en este momento" text="Estamos preparando cositas nuevas. ¡Vuelve pronto! 💕" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {data.map((b) => (
            <BoxCard key={b.slug} box={b} />
          ))}
        </div>
      )}
    </div>
  );
}

      
