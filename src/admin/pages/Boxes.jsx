import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { usd } from '@/lib/money';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Spinner, Toggle, inputCls, useToast } from '../ui';
import { ImagePicker } from '@/admin/ImagePicker';
import { Thumb } from './Products';
import { centsToInput, errMsg, inputToCents } from '@/admin/utils';

function BoxForm({ box, tipos, products, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: box?.name ?? '',
    emoji: box?.emoji ?? '🎁',
    price: centsToInput(box?.priceCents),
    tipoId: box?.tipoId ?? tipos[0]?.id ?? '',
    short: box?.short ?? '',
    description: box?.description ?? '',
    isActive: box?.isActive ?? true,
    sortOrder: String(box?.sortOrder ?? 0),
    images: box?.photos ?? [],
    items: (box?.items ?? []).map((i) => ({ productId: i.productId, qty: i.qty })),
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const setItem = (i, patch) => setF({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const used = new Set(f.items.map((i) => i.productId));
  const free = products.filter((p) => !used.has(p.id));
  const looseValue = f.items.reduce((s, it) => s + (byId[it.productId]?.priceCents ?? 0) * it.qty, 0);

  const submit = async (e) => {
    e.preventDefault();
    const priceCents = inputToCents(f.price);
    const sortOrder = Number(f.sortOrder);
    const v = {};
    if (!f.name.trim()) v.name = 'Escribe un nombre';
    if (!priceCents) v.priceCents = 'Escribe un precio mayor que 0 (ej. 12.00)';
    if (!f.tipoId) v.tipoId = 'Elige un tipo';
    if (f.items.length === 0) v.items = 'Agrega al menos un producto';
    if (f.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) v.items = 'Cada cantidad debe ser 1 o más';
    if (!Number.isInteger(sortOrder)) v.sortOrder = 'Debe ser un número entero';
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = {
      name: f.name.trim(),
      emoji: f.emoji.trim() || '🎁',
      priceCents,
      tipoId: Number(f.tipoId),
      short: f.short.trim(),
      description: f.description.trim(),
      isActive: f.isActive,
      sortOrder,
      items: f.items,
      imageIds: f.images.map((i) => i.id),
    };
    setBusy(true);
    try {
      await (box ? adm(`/api/admin/boxes/${box.id}`, { method: 'PATCH', body }) : adm('/api/admin/boxes', { method: 'POST', body }));
      toast(box ? 'Cajita actualizada' : 'Cajita creada');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422) setErrors(err.fields);
      else if (err.code === 'slug_taken') setErrors({ name: err.message });
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={box ? 'Editar cajita' : 'Nueva cajita'}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="box-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="box-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.name} className="sm:col-span-2">
          <input className={inputCls(errors.name)} value={f.name} onChange={set('name')} maxLength={120} autoFocus />
        </Field>
        <Field label="Precio (USD)" error={errors.priceCents} hint={looseValue ? `Suelto sumaría ${usd(looseValue)}` : undefined}>
          <input className={inputCls(errors.priceCents)} inputMode="decimal" value={f.price} onChange={set('price')} placeholder="12.00" />
        </Field>
        <Field label="Tipo" error={errors.tipoId}>
          <select className={inputCls(errors.tipoId)} value={f.tipoId} onChange={set('tipoId')}>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Frase corta" error={errors.short} optional hint="Aparece en la tarjeta." className="sm:col-span-2">
          <input className={inputCls(errors.short)} value={f.short} onChange={set('short')} />
        </Field>
        <Field label="Descripción" error={errors.description} optional className="sm:col-span-2">
          <textarea className={inputCls(errors.description)} rows={3} value={f.description} onChange={set('description')} />
        </Field>

        <div className="sm:col-span-2 space-y-2">
          <span className="font-semibold block">Contenido de la cajita</span>
          {f.items.map((it, i) => (
            <div key={it.productId} className="flex items-center gap-2">
              <span className="flex-1 min-w-0 truncate">
                {byId[it.productId]?.emoji} {byId[it.productId]?.name ?? 'Producto'}
              </span>
              <input
                type="number"
                min="1"
                aria-label="Cantidad"
                className="field !w-20"
                value={it.qty}
                onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
              />
              <button type="button" aria-label="Quitar producto" className="p-1.5 text-red-700" onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {free.length > 0 && (
            <select
              aria-label="Agregar producto"
              className="field w-full"
              value=""
              onChange={(e) => e.target.value && setF({ ...f, items: [...f.items, { productId: e.target.value, qty: 1 }] })}
            >
              <option value="">+ Agregar producto…</option>
              {free.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name} ({usd(p.priceCents)})
                </option>
              ))}
            </select>
          )}
          {errors.items && <p role="alert" className="text-sm font-semibold text-petal-600">{errors.items}</p>}
        </div>

        <Field label="Emoji" error={errors.emoji} hint="Se muestra si no hay imágenes.">
          <input className={inputCls(errors.emoji)} value={f.emoji} onChange={set('emoji')} maxLength={16} />
        </Field>
        <Field label="Orden" error={errors.sortOrder} hint="Las más pequeñas aparecen primero.">
          <input className={inputCls(errors.sortOrder)} type="number" value={f.sortOrder} onChange={set('sortOrder')} />
        </Field>
        <div className="sm:col-span-2 space-y-1.5">
          <span className="font-semibold block">Imágenes</span>
          <ImagePicker value={f.images} onChange={(images) => setF({ ...f, images })} error={errors.imageIds} />
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={f.isActive} onChange={(isActive) => setF({ ...f, isActive })} label="Visible en la tienda" />
          <span className="font-semibold">Visible en la tienda</span>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminBoxes() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const refresh = () => setReload((n) => n + 1);

  const boxes = useAsync(() => adm('/api/admin/boxes'), [reload]);
  const tipos = useAsync(() => adm('/api/admin/caja-tipos'), []);
  const prods = useAsync(() => adm('/api/admin/products'), [reload]);
  const data = boxes.data;

  const toggle = async (b, isActive) => {
    try {
      await adm(`/api/admin/boxes/${b.id}`, { method: 'PATCH', body: { isActive } });
      toast(isActive ? 'Cajita visible' : 'Cajita oculta');
      refresh();
    } catch (e) {
      toast(errMsg(e), 'bad');
    }
  };
  const remove = async () => {
    try {
      await adm(`/api/admin/boxes/${del.id}`, { method: 'DELETE' });
      toast('Cajita eliminada');
      refresh();
    } catch (e) {
      toast(errMsg(e), 'bad');
      throw e;
    }
  };

  const ready = tipos.data && prods.data;
  return (
    <>
      <PageHeader title="Cajitas" subtitle="Combos de productos listos para regalar.">
        <button type="button" className="btn btn-deep" onClick={() => setForm({})} disabled={!ready}>
          <Plus size={18} /> Nueva cajita
        </button>
      </PageHeader>
      <ErrorNote error={boxes.error || tipos.error || prods.error} retry={refresh} />

      <Card className="!p-0 overflow-x-auto">
        {boxes.loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <EmptyRow>Aún no hay cajitas.</EmptyRow>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b-2 border-ink bg-petal-100">
                <th className="p-3 w-16" />
                <th className="p-3">Cajita</th>
                <th className="p-3">Contenido</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-center">Visible</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id} className={`border-b border-dashed border-ink/30 ${b.isActive ? '' : 'opacity-60'}`}>
                  <td className="p-3">
                    <Thumb photo={b.photos[0]} emoji={b.emoji} />
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">{b.name}</span>
                    <span className="block text-xs opacity-70">{b.tag}</span>
                    {b.soldOut && <Badge tone="bad">Agotada</Badge>}
                  </td>
                  <td className="p-3 text-xs">{b.items.length} producto(s)</td>
                  <td className="p-3 text-right font-semibold">{usd(b.priceCents)}</td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <Toggle checked={b.isActive} label={`Visible: ${b.name}`} onChange={(v) => toggle(b, v)} />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" aria-label={`Editar ${b.name}`} className="p-1.5" onClick={() => setForm(b)}>
                        <Pencil size={18} />
                      </button>
                      <button type="button" aria-label={`Eliminar ${b.name}`} className="p-1.5 text-red-700" onClick={() => setDel(b)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {form && ready && <BoxForm box={form.id ? form : null} tipos={tipos.data} products={prods.data} onClose={() => setForm(null)} onSaved={refresh} />}
      {del && <ConfirmModal title="Eliminar cajita" danger confirmLabel="Eliminar" text={`¿Eliminar “${del.name}”? Los pedidos ya hechos conservan su detalle.`} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
