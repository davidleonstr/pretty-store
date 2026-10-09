export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skel ${className}`} />;
}

export function BoxCardSkeleton() {
  return (
    <div className="sketch p-3 space-y-3" role="status" aria-label="Cargando">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="sketch p-3 space-y-3" role="status" aria-label="Cargando">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, product = false }) {
  const Card = product ? ProductCardSkeleton : BoxCardSkeleton;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-10" role="status" aria-label="Cargando">
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
    </div>
  );
}
