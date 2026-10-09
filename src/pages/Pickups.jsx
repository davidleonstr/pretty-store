import { Clock, MapPin } from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { listPickups } from '@/lib/api';
import { PickupMap } from '@/components/PickupMap';
import { Skeleton } from '@/components/Skeleton';
import { Empty, ErrorState } from './Boxes';

export default function Pickups() {
  const { loading, data, error } = useAsync(() => listPickups(), []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Puntos de retiro</h1>
        <p>Elige uno de estos lugares y horarios al hacer tu reserva.</p>
      </header>

      {!loading &&
        !data?.length &&
        (error ? (
          <ErrorState />
        ) : (
          <Empty title="No hay puntos de retiro por ahora" text="Pronto publicaremos nuevos lugares y horarios. ¡Vuelve pronto! 💕" />
        ))}

      <div className="grid md:grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="sketch p-4 space-y-3" role="status" aria-label="Cargando">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))
          : (data ?? []).map((p) => (
              <section key={p.id} className="sketch p-4 space-y-3" aria-labelledby={p.id}>
                <div>
                  <h2 id={p.id} className="h-title text-2xl text-petal-600">{p.name}</h2>
                  <p className="flex items-center gap-1.5 text-sm mt-1">
                    <MapPin size={16} /> {p.address}
                  </p>
                </div>
                <PickupMap pickup={p} />
                <ul className="flex flex-wrap gap-2">
                  {p.hours.map((h) => (
                    <li key={h.id} className="sticker !rotate-0 text-sm flex items-center gap-1.5 !bg-petal-100">
                      <Clock size={14} /> {h.label}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
      </div>
    </div>
  );
}
      
