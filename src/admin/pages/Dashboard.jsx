import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, PackageX } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { usd } from '@/lib/money';
import { Badge, Card, ErrorNote, PageHeader, Spinner } from '../ui';
import { fmtDateTime } from '@/admin/utils';

const STATUSES = [
  ['pendiente', 'Pendientes', 'warn'],
  ['en proceso', 'En proceso', 'info'],
  ['por entregar', 'Por entregar', 'info'],
  ['entregado', 'Entregados', 'ok'],
  ['cancelado', 'Cancelados', 'bad'],
];
const LOW_STOCK = 3;

async function load() {
  const [counts, pending, products, sinHorarios] = await Promise.all([
    Promise.all(STATUSES.map(([s]) => adm('/api/admin/orders', { params: { status: s, pageSize: 1 } }).then((r) => r.total))),
    adm('/api/admin/orders', { params: { status: 'pendiente', pageSize: 5 } }),
    adm('/api/admin/products'),
    adm('/api/admin/pickups/sin-horarios'),
  ]);
  return { counts, pending: pending.items, products, sinHorarios };
}

export default function Dashboard() {
  const { loading, data, error } = useAsync(load, []);
  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} />;

  const low = data.products.filter((p) => p.isActive && p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);

  return (
    <>
      <PageHeader title="Panel" subtitle="Un vistazo a cómo va la tienda." />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STATUSES.map(([s, label, tone], i) => (
          <Link key={s} to={`/admin/pedidos?status=${encodeURIComponent(s)}`} className="sketch p-4 hover:!bg-petal-100 transition-colors">
            <p className="h-title text-4xl">{data.counts[i]}</p>
            <Badge tone={tone}>{label}</Badge>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="h-title text-2xl mb-3 flex items-center gap-2">
            <ClipboardList size={22} /> Últimos pedidos pendientes
          </h2>
          {data.pending.length === 0 ? (
            <p className="opacity-80">No hay pedidos pendientes. 🎉</p>
          ) : (
            <ul className="divide-y-2 divide-dashed divide-ink/20">
              {data.pending.map((o) => (
                <li key={o.id} className="py-2 flex items-center justify-between gap-3">
                  <Link to={`/admin/pedidos?q=${o.code}`} className="min-w-0">
                    <span className="font-bold">{o.code}</span> · {o.customer.nombres} {o.customer.apellidos}
                    <span className="block text-xs opacity-70">
                      {fmtDateTime(o.createdAt)} · retiro {o.pickup.label}
                    </span>
                  </Link>
                  <span className="font-semibold">{usd(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="h-title text-2xl mb-3 flex items-center gap-2">
              <PackageX size={22} /> Stock bajo
            </h2>
            {low.length === 0 ? (
              <p className="opacity-80">Todo con buen stock.</p>
            ) : (
              <ul className="space-y-1.5">
                {low.slice(0, 8).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span>
                      {p.emoji} {p.name}
                    </span>
                    <Badge tone={p.stock === 0 ? 'bad' : 'warn'}>{p.stock === 0 ? 'Agotado' : `Quedan ${p.stock}`}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/productos" className="underline text-sm mt-3 inline-block">
              Ir a productos
            </Link>
          </Card>

          {data.sinHorarios.length > 0 && (
            <Card className="!bg-amber-50">
              <h2 className="h-title text-2xl mb-2 flex items-center gap-2">
                <AlertTriangle size={22} /> Puntos sin horarios
              </h2>
              <p className="text-sm mb-2">Estos puntos están activos pero no se pueden elegir al reservar:</p>
              <ul className="list-disc pl-5">
                {data.sinHorarios.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
              <Link to="/admin/retiros" className="underline text-sm mt-3 inline-block">
                Agregar fechas y horas
              </Link>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
