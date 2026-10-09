import { useState } from 'react';

// Una foto. Si trae `src` usa la imagen real; si no, dibuja una ilustración de prueba.
export function Photo({ photo, alt = '', size = 'md', className = '' }) {
  const [broken, setBroken] = useState(false);

  if (photo?.src && !broken) {
    return (
      <img
        src={photo.src}
        alt={alt}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  const emojiSize = { sm: 'text-3xl', md: 'text-6xl sm:text-7xl', lg: 'text-8xl sm:text-9xl' }[size];

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative w-full h-full grid place-items-center overflow-hidden ${className}`}
      style={{
        background: photo?.bg || '#FFD5E0',
        backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 2px, transparent 2.4px)',
        backgroundSize: '16px 16px',
      }}
    >
      <span className={`${emojiSize} select-none drop-shadow-[3px_3px_0_rgba(74,21,48,.25)]`}>
        {photo?.emoji}
      </span>
      {size !== 'sm' && (
        <>
          <span className="absolute top-[10%] left-[12%] text-xl opacity-80 select-none">{photo?.deco}</span>
          <span className="absolute bottom-[12%] right-[10%] text-2xl opacity-80 select-none">{photo?.deco}</span>
        </>
      )}
    </div>
  );
}

export function Gallery({ photos, alt }) {
  const [i, setI] = useState(0);
  const list = photos?.length ? photos : [{}];
  return (
    <div className="space-y-3">
      <div className="sketch p-2">
        <div className="aspect-square rounded-[14px] overflow-hidden">
          <Photo photo={list[i]} alt={alt} size="lg" />
        </div>
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {list.map((p, k) => (
            <button
              key={k}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Ver foto ${k + 1}`}
              aria-pressed={i === k}
              className={`sketch sketch-flat p-1 transition-transform ${
                i === k ? '-rotate-2 scale-105 !shadow-[3px_3px_0_#B8396A]' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-square rounded-[10px] overflow-hidden">
                <Photo photo={p} alt="" size="sm" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
