import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, Phone, Search } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { usd } from '@/lib/money';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Modal, PageHeader, Pagination, Spinner, useToast } from '../ui';
import { errMsg, fmtDateTime, useDebounced } from '@/admin/utils';

export const STATUSES = ['pendiente', 'en proceso', 'por entregar', 'entregado', 'cancelado'];
const TONE = { pendiente: 'warn', 'en proceso': 'info', 'por entregar': 'info', entregado: 'ok', cancelado: 'bad' };
const KIND = { caja: 'Cajita', productos: 'Productos' };
const PAGE_SIZE = 20;

export const StatusBadge = ({ status }) => <Badge tone={TONE[status]}>{status}</Badge>;

function OrderModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const { loading, data: o, error } = useAsync(() => adm(`/api/admin/orders/${id}`), [id, reload]);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const status = next || o?.status;
  const apply = async () => {
    setBusy(true);
    try {
      await adm(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });
      toast(`Pedido ${o.code}: ${status}`);
      setNext('');
      setReload((n) => n + 1);
      onChanged();
    } catch (e) {
      toast(errMsg(e), 'bad');
      throw e;
    } finally {
      setBusy(false);
    }
  };
  const save = () => (status === 'cancelado' ? setConfirm(true) : apply().catch(() => {}));

  return (
    <Modal title={o ? `Pedido ${o.code}` : 'Pedido'} wide onClose={onClose}>
      {loading && !o ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} retry={() => setReload((n) => n + 1)} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={o.status} />
            <Badge>{KIND[o.kind]}</Badge>
            <span className="text-sm opacity-70">Creado {fmtDateTime(o.createdAt)}</span>
            {o.deliveredAt && <span className="text-sm opacity-70">· Entregado {fmtDateTime(o.deliveredAt)}</span>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="!p-3 space-y-1">
              <h3 className="font-bold">Cliente</h3>
              <p>
                {o.customer.nombres} {o.customer.apellidos}
              </p>
              <p className="text-sm break-all">{o.customer.correo}</p>
              <a href={`tel:${o.customer.celular}`} className="text-sm underline inline-flex items-center gap-1">
                <Phone size={14} /> {o.customer.celular}
              </a>
            </Card>
            <Card className="!p-3 space-y-1">
              <h3 className="font-bold">Retiro</h3>
              <p className="flex items-start gap-1.5">
                <MapPin size={16} className="shrink-0 mt-1" /> {o.pickup.name}
              </p>
              <p className="text-sm opacity-80">{o.pickup.address}</p>
              <p className="font-semibold">{o.pickup.label}</p>
            </Card>
          </div>

          {o.nota && (
            <p className="bubble !rounded-2xl !block">
              <b>Nota:</b> {o.nota}
            </p>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-ink">
                <th className="py-1">Artículo</th>
                <th className="py-1 text-right">Cant.</th>
                <th className="py-1 text-right">Precio</th>
                <th className="py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((it, i) => (
                <tr key={i} className="border-b border-dashed border-ink/30">
                  <td className="py-1.5">{it.name}</td>
                  <td className="py-1.5 text-right">{it.qty}</td>
                  <td className="py-1.5 text-right">{usd(it.unitPriceCents)}</td>
                  <td className="py-1.5 text-right">{usd(it.unitPriceCents * it.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-2 text-right font-bold">
                  Total
                </td>
                <td className="pt-2 text-right h-title text-xl">{usd(o.totalCents)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex flex-wrap items-end gap-3 pt-2 border-t-2 border-dashed border-ink/30">
            <label className="space-y-1.5">
              <span className="font-semibold block">Cambiar estado</span>
              <select className="field" value={status} onChange={(e) => setNext(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-deep" disabled={busy || status === o.status} onClick={save}>
              {busy && <Loader2 size={18} className="animate-spin" />} Guardar estado
            </button>
          </div>
          {status === 'cancelado' && o.status !== 'cancelado' && <p className="text-sm">Al cancelar, el stock se repone automáticamente.</p>}
          {o.status === 'cancelado' && status !== 'cancelado' && <p className="text-sm">Al reactivar, se vuelve a descontar el stock (si alcanza).</p>}

          {confirm && (
            <ConfirmModal
              title="Cancelar pedido"
              danger
              confirmLabel="Sí, cancelar"
              text={`¿Cancelar el pedido ${o.code}? Se repondrá el stock de sus productos.`}
              onConfirm={apply}
              onClose={() => setConfirm(false)}
            />
          )}
        </>
      )}
    </Modal>
  );
}

export default function Orders() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [f, setF] = useState({ status: sp.get('status') || '', kind: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [openId, setOpenId] = useState(null);
  const dq = useDebounced(q.trim());

  useEffect(() => setPage(1), [dq, f.status, f.kind, f.from, f.to]);
  useEffect(() => {
    // mantiene la URL sincronizada con los filtros principales
    const next = new URLSearchParams();
    if (dq) next.set('q', dq);
    if (f.status) next.set('status', f.status);
    setSp(next, { replace: true });
  }, [dq, f.status, setSp]);

  const params = { q: dq, status: f.status, kind: f.kind, from: f.from, to: f.to, page, pageSize: PAGE_SIZE };
  const { loading, data, error } = useAsync(() => adm('/api/admin/orders', { params }), [dq, f.status, f.kind, f.from, f.to, page, reload]);
  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Pedidos" subtitle="Reservas de los clientes. Toca un pedido para ver el detalle y cambiar su estado." />

      <Card className="mb-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="lg:col-span-2 space-y-1.5">
            <span className="font-semibold block">Buscar</span>
            <span className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input className="field w-full !pl-9" placeholder="Código, nombre, correo o celular" value={q} onChange={(e) => setQ(e.target.value)} />
            </span>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold block">Estado</span>
            <select className="field w-full" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold block">Tipo</span>
            <select className="field w-full" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              <option value="">Todos</option>
              <option value="caja">Cajita</option>
              <option value="productos">Productos</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1.5">
              <span className="font-semibold block">Desde</span>
              <input type="date" className="field w-full" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            </label>
            <label className="space-y-1.5">
              <span className="font-semibold block">Hasta</span>
              <input type="date" className="field w-full" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
            </label>
          </div>
        </div>
      </Card>

      <ErrorNote error={error} retry={() => setReload((n) => n + 1)} />

      <Card className="!p-0 overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyRow>{dq || f.status || f.kind || f.from || f.to ? 'Ningún pedido coincide con esos filtros.' : 'Aún no hay pedidos.'}</EmptyRow>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b-2 border-ink bg-petal-100">
                <th className="p-3">Código</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Retiro</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-dashed border-ink/30 hover:bg-petal-50 cursor-pointer" onClick={() => setOpenId(o.id)}>
                  <td className="p-3 font-bold">
                    <button type="button" className="underline" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>
                      {o.code}
                    </button>
                    <span className="block text-xs font-normal opacity-70">{fmtDateTime(o.createdAt)}</span>
                  </td>
                  <td className="p-3">
                    {o.customer.nombres} {o.customer.apellidos}
                    <span className="block text-xs opacity-70">{o.customer.celular}</span>
                  </td>
                  <td className="p-3">
                    {o.pickup.name}
                    <span className="block text-xs opacity-70">{o.pickup.label}</span>
                  </td>
                  <td className="p-3">{KIND[o.kind]}</td>
                  <td className="p-3 text-right font-semibold">{usd(o.totalCents)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />}
      {openId && <OrderModal id={openId} onClose={() => setOpenId(null)} onChanged={() => setReload((n) => n + 1)} />}
    </>
  );
}
