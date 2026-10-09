import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { media } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { usd } from '@/lib/money';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Spinner, Toggle, inputCls, useToast } from '../ui';
import { ImagePicker } from '@/admin/ImagePicker';
import { centsToInput, errMsg, inputToCents, useDebounced } from '@/admin/utils';

export function Thumb({ photo, emoji }) {
  return photo?.src ? (
    <img src={media(photo.src)} alt="" className="w-12 h-12 rounded-lg object-cover border-2 border-ink" loading="lazy" />
  ) : (
    <span className="grid place-items-center w-12 h-12 rounded-lg border-2 border-ink bg-petal-100 text-2xl" aria-hidden="true">
      {emoji}
    </span>
  );
}

function ProductForm({ product, categorias, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: product?.name ?? '',
    emoji: product?.emoji ?? '🎁',
    price: centsToInput(product?.priceCents),
    categoriaId: product?.categoriaId ?? categorias[0]?.id ?? '',
    description: product?.description ?? '',
    stock: String(product?.stock ?? 0),
    isActive: product?.isActive ?? true,
    sortOrder: String(product?.sortOrder ?? 0),
    images: product?.photos ?? [],
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const priceCents = inputToCents(f.price);
    const stock = Number(f.stock);
    const sortOrder = Number(f.sortOrder);
    const v = {};
    if (!f.name.trim()) v.name = 'Escribe un nombre';
    if (!priceCents) v.priceCents = 'Escribe un precio mayor que 0 (ej. 3.50)';
    if (!f.categoriaId) v.categoriaId = 'Elige una categoría';
    if (!Number.isInteger(stock) || stock < 0) v.stock = 'Debe ser un entero mayor o igual a 0';
    if (!Number.isInteger(sortOrder)) v.sortOrder = 'Debe ser un número entero';
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = {
      name: f.name.trim(),
      emoji: f.emoji.trim() || '🎁',
      priceCents,
      categoriaId: f.categoriaId,
      description: f.description.trim(),
      stock,
      isActive: f.isActive,
      sortOrder,
      imageIds: f.images.map((i) => i.id),
    };
    setBusy(true);
    try {
      await (product ? adm(`/api/admin/products/${product.id}`, { method: 'PATCH', body }) : adm('/api/admin/products', { method: 'POST', body }));
      toast(product ? 'Producto actualizado' : 'Producto creado');
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
      title={product ? 'Editar producto' : 'Nuevo producto'}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="prod-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="prod-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.name} className="sm:col-span-2">
          <input className={inputCls(errors.name)} value={f.name} onChange={set('name')} maxLength={120} autoFocus />
        </Field>
        <Field label="Precio (USD)" error={errors.priceCents}>
          <input className={inputCls(errors.priceCents)} inputMode="decimal" value={f.price} onChange={set('price')} placeholder="3.50" />
        </Field>
        <Field label="Categoría" error={errors.categoriaId}>
          <select className={inputCls(errors.categoriaId)} value={f.categoriaId} onChange={set('categoriaId')}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stock" error={errors.stock} hint="Con 0 aparece como agotado.">
          <input className={inputCls(errors.stock)} type="number" min="0" value={f.stock} onChange={set('stock')} />
        </Field>
        <Field label="Emoji" error={errors.emoji} hint="Se muestra si no hay imágenes.">
          <input className={inputCls(errors.emoji)} value={f.emoji} onChange={set('emoji')} maxLength={16} />
        </Field>
        <Field label="Descripción" error={errors.description} optional className="sm:col-span-2">
          <textarea className={inputCls(errors.description)} rows={3} value={f.description} onChange={set('description')} />
        </Field>
        <div className="sm:col-span-2 space-y-1.5">
          <span className="font-semibold block">Imágenes</span>
          <ImagePicker value={f.images} onChange={(images) => setF({ ...f, images })} error={errors.imageIds} />
        </div>
        <Field label="Orden" error={errors.sortOrder} hint="Las más pequeñas aparecen primero.">
          <input className={inputCls(errors.sortOrder)} type="number" value={f.sortOrder} onChange={set('sortOrder')} />
        </Field>
        <div className="flex items-center gap-3 pt-6">
          <Toggle checked={f.isActive} onChange={(isActive) => setF({ ...f, isActive })} label="Visible en la tienda" />
          <span className="font-semibold">Visible en la tienda</span>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [stockF, setStockF] = useState('');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const dq = useDebounced(q.trim());
  const refresh = () => setReload((n) => n + 1);

  const cats = useAsync(() => adm('/api/admin/categorias'), [reload]);
  const { loading, data, error } = useAsync(
    () => adm('/api/admin/products', { params: { q: dq, tag, soldOut: stockF } }),
    [dq, tag, stockF, reload],
  );
  const categorias = cats.data ?? [];

  const patch = async (p, path, body, ok) => {
    try {
      await adm(`/api/admin/products/${p.id}${path}`, { method: 'PATCH', body });
      if (ok) toast(ok);
      refresh();
    } catch (e) {
      toast(errMsg(e), 'bad');
    }
  };

  const remove = async () => {
    try {
      await adm(`/api/admin/products/${del.id}`, { method: 'DELETE' });
      toast('Producto eliminado');
      refresh();
    } catch (e) {
      const boxes = e.details?.boxes?.map((b) => b.name).join(', ');
      toast(e.code === 'in_use' ? `Está en las cajitas: ${boxes}. Desactívalo en vez de eliminarlo.` : errMsg(e), 'bad');
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Productos" subtitle="Cositas sueltas. Controla precio, stock y visibilidad.">
        <button type="button" className="btn btn-deep" onClick={() => setForm({})} disabled={cats.loading || categorias.length === 0}>
          <Plus size={18} /> Nuevo producto
        </button>
      </PageHeader>

      {!cats.loading && categorias.length === 0 && (
        <p className="bubble !rounded-2xl font-semibold mb-4">
          Primero crea una categoría. <Link to="/admin/categorias" className="underline">Ir a categorías</Link>
        </p>
      )}

      <Card className="mb-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1.5">
            <span className="font-semibold block">Buscar</span>
            <span className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input className="field w-full !pl-9" placeholder="Nombre del producto" value={q} onChange={(e) => setQ(e.target.value)} />
            </span>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold block">Categoría</span>
            <select className="field w-full" value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold block">Disponibilidad</span>
            <select className="field w-full" value={stockF} onChange={(e) => setStockF(e.target.value)}>
              <option value="">Todos</option>
              <option value="false">Con stock</option>
              <option value="true">Agotados</option>
            </select>
          </label>
        </div>
      </Card>

      <ErrorNote error={error} retry={refresh} />

      <Card className="!p-0 overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <EmptyRow>{dq || tag || stockF ? 'Ningún producto coincide con esos filtros.' : 'Aún no hay productos.'}</EmptyRow>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left border-b-2 border-ink bg-petal-100">
                <th className="p-3 w-16" />
                <th className="p-3">Producto</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Visible</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className={`border-b border-dashed border-ink/30 ${p.isActive ? '' : 'opacity-60'}`}>
                  <td className="p-3">
                    <Thumb photo={p.photos[0]} emoji={p.emoji} />
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">{p.name}</span>
                    <span className="block text-xs opacity-70">{p.tag}</span>
                  </td>
                  <td className="p-3 text-right font-semibold">{usd(p.priceCents)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button type="button" aria-label={`Quitar 1 de ${p.name}`} className="btn btn-sm btn-white !p-0 !w-7 !min-h-7 !h-7 !rounded-full" disabled={p.stock === 0} onClick={() => patch(p, '/stock', { delta: -1 })}>
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="w-8 text-center font-bold">{p.stock}</span>
                      <button type="button" aria-label={`Agregar 1 a ${p.name}`} className="btn btn-sm btn-white !p-0 !w-7 !min-h-7 !h-7 !rounded-full" onClick={() => patch(p, '/stock', { delta: 1 })}>
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                    {p.soldOut && <div className="text-center mt-1"><Badge tone="bad">Agotado</Badge></div>}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <Toggle checked={p.isActive} label={`Visible: ${p.name}`} onChange={(isActive) => patch(p, '', { isActive }, isActive ? 'Producto visible' : 'Producto oculto')} />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" aria-label={`Editar ${p.name}`} className="p-1.5" onClick={() => setForm(p)}>
                        <Pencil size={18} />
                      </button>
                      <button type="button" aria-label={`Eliminar ${p.name}`} className="p-1.5 text-red-700" onClick={() => setDel(p)}>
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

      {form && <ProductForm product={form.id ? form : null} categorias={categorias} onClose={() => setForm(null)} onSaved={refresh} />}
      {del && <ConfirmModal title="Eliminar producto" danger confirmLabel="Eliminar" text={`¿Eliminar “${del.name}”? Esta acción no se puede deshacer.`} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
