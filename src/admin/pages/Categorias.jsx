import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Spinner, inputCls, useToast } from '../ui';
import { errMsg } from '@/admin/utils';

function CategoriaForm({ item, onClose, onSaved }) {
  const toast = useToast();
  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const so = Number(sortOrder);
    if (!nombre.trim()) return setErrors({ nombre: 'Escribe un nombre' });
    if (!Number.isInteger(so)) return setErrors({ sortOrder: 'Debe ser un número entero' });
    setBusy(true);
    try {
      const body = { nombre: nombre.trim(), sortOrder: so };
      await (item ? adm(`/api/admin/categorias/${item.id}`, { method: 'PATCH', body }) : adm('/api/admin/categorias', { method: 'POST', body }));
      toast(item ? 'Categoría actualizada' : 'Categoría creada');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422) setErrors(err.fields);
      else if (err.code === 'name_taken') setErrors({ nombre: err.message });
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={item ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="cat-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="cat-form" onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nombre" error={errors.nombre}>
          <input className={inputCls(errors.nombre)} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} autoFocus />
        </Field>
        <Field label="Orden" error={errors.sortOrder} hint="Las más pequeñas aparecen primero.">
          <input className={inputCls(errors.sortOrder)} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

export default function Categorias() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(null); // null | {} (nueva) | item
  const [del, setDel] = useState(null);
  const { loading, data, error } = useAsync(() => adm('/api/admin/categorias'), [reload]);
  const refresh = () => setReload((n) => n + 1);

  const remove = async () => {
    try {
      await adm(`/api/admin/categorias/${del.id}`, { method: 'DELETE' });
      toast('Categoría eliminada');
      refresh();
    } catch (e) {
      toast(e.code === 'in_use' ? 'Tiene productos: cámbialos de categoría primero.' : errMsg(e), 'bad');
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Categorías" subtitle="Agrupan los productos (Cuidado, Dormir, Aroma…).">
        <button type="button" className="btn btn-deep" onClick={() => setForm({})}>
          <Plus size={18} /> Nueva categoría
        </button>
      </PageHeader>
      <ErrorNote error={error} retry={refresh} />
      <Card className="!p-0 overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <EmptyRow>Aún no hay categorías. Crea la primera para poder agregar productos.</EmptyRow>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-ink bg-petal-100">
                <th className="p-3">Nombre</th>
                <th className="p-3 text-right">Productos</th>
                <th className="p-3 text-right">Orden</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-dashed border-ink/30">
                  <td className="p-3 font-semibold">{c.nombre}</td>
                  <td className="p-3 text-right">{c.productCount}</td>
                  <td className="p-3 text-right">{c.sortOrder}</td>
                  <td className="p-3 flex justify-end gap-1">
                    <button type="button" aria-label={`Editar ${c.nombre}`} className="p-1.5" onClick={() => setForm(c)}>
                      <Pencil size={18} />
                    </button>
                    <button type="button" aria-label={`Eliminar ${c.nombre}`} className="p-1.5 text-red-700" onClick={() => setDel(c)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {form && <CategoriaForm item={form.id ? form : null} onClose={() => setForm(null)} onSaved={refresh} />}
      {del && <ConfirmModal title="Eliminar categoría" danger confirmLabel="Eliminar" text={`¿Eliminar la categoría “${del.nombre}”?`} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
