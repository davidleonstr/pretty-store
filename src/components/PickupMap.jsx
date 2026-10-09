import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from './Skeleton';

// Mapa de OpenStreetMap incrustado con marcador en el punto exacto.
export function PickupMap({ pickup, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const { lat, lon } = pickup;
  const d = 0.0035;
  const bbox = [lon - d, lat - d * 0.65, lon + d, lat + d * 0.65].join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="sketch p-1.5">
        <div className="relative h-56 sm:h-64 rounded-[12px] overflow-hidden bg-petal-200">
          {!loaded && <Skeleton className="absolute inset-0 !rounded-none" />}
          <iframe
            key={pickup.id}
            title={`Mapa de ${pickup.name}`}
            src={src}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4"
      >
        Ver lugar exacto en OpenStreetMap <ExternalLink size={14} />
      </a>
    </div>
  );
}
