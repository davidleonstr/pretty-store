import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/admin/AuthContext';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Spinner, Toggle, inputCls, useToast } from '../ui';
import { errMsg, fmtDateTime } from '@/admin/utils';

const MIN_PASSWORD = 10;

function AdminForm({ item, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({ nombre: item?.nombre ?? '', correo: item?.correo ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.nombre.trim()) v.nombre = 'Escribe un nombre';
    if (!item && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo.trim())) v.correo = 'Escribe un correo válido';
    if ((!item || f.password) && f.password.length < MIN_PASSWORD) v.password = `Mínimo ${MIN_PASSWORD} caracteres`;
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      if (item) {
        const body = { nombre: f.nombre.trim(), ...(f.password ? { password: f.password } : {}) };
        await adm(`/api/admin/administradores/${item.id}`, { method: 'PATCH', body });
      } else {
        await adm('/api/admin/administradores', { method: 'POST', body: { nombre: f.nombre.trim(), correo: f.correo.trim(), password: f.password } });
      }
      toast(item ? 'Administrador actualizado' : 'Administrador creado');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422) setErrors(err.fields);
      else if (err.code === 'email_taken') setErrors({ correo: err.message });
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={item ? 'Editar administrador' : 'Nuevo administrador'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="admin-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="admin-form" onSubmit={submit} noValidate className="space-y-4" autoComplete="off">
        <Field label="Nombre" error={errors.nombre}>
          <input className={inputCls(errors.nombre)} value={f.nombre} onChange={set('nombre')} autoFocus />
        </Field>
        <Field label="Correo" error={errors.correo}>
          <input className={inputCls(errors.correo)} type="email" value={f.correo} onChange={set('correo')} disabled={!!item} />
        </Field>
        <Field label={item ? 'Nueva contraseña' : 'Contraseña'} optional={!!item} error={errors.password} hint={`Mínimo ${MIN_PASSWORD} caracteres.`}>
          <input className={inputCls(errors.password)} type="password" autoComplete="new-password" value={f.password} onChange={set('password')} />
        </Field>
      </form>
    </Modal>
  );
}

export default function Admins() {
  const { admin: me } = useAuth();
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const { loading, data, error } = useAsync(() => adm('/api/admin/administradores'), [reload]);
  const refresh = () => setReload((n) => n + 1);

  const toggle = async (a, activo) => {
    try {
      await adm(`/api/admin/administradores/${a.id}`, { method: 'PATCH', body: { activo } });
      toast(activo ? 'Administrador activado' : 'Administrador desactivado');
      refresh();
    } catch (e) {
      toast(errMsg(e), 'bad');
    }
  };
  const remove = async () => {
    try {
      await adm(`/api/admin/administradores/${del.id}`, { method: 'DELETE' });
      toast('Administrador eliminado');
      refresh();
    } catch (e) {
      toast(errMsg(e), 'bad');
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Administradores" subtitle="Personas con acceso a este panel.">
        <button type="button" className="btn btn-deep" onClick={() => setForm({})}>
          <Plus size={18} /> Nuevo administrador
        </button>
      </PageHeader>
      <ErrorNote error={error} retry={refresh} />
      <Card className="!p-0 overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <EmptyRow>No hay administradores.</EmptyRow>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left border-b-2 border-ink bg-petal-100">
                <th className="p-3">Nombre</th>
                <th className="p-3">Último acceso</th>
                <th className="p-3 text-center">Activo</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {data.map((a) => {
                const self = a.id === me?.id;
                return (
                  <tr key={a.id} className={`border-b border-dashed border-ink/30 ${a.activo ? '' : 'opacity-60'}`}>
                    <td className="p-3">
                      <span className="font-semibold">{a.nombre}</span> {self && <Badge tone="info">Tú</Badge>}
                      <span className="block text-xs opacity-70">{a.correo}</span>
                    </td>
                    <td className="p-3">{fmtDateTime(a.ultimoLoginAt)}</td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <Toggle checked={a.activo} disabled={self} label={`Activo: ${a.nombre}`} onChange={(v) => toggle(a, v)} />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label={`Editar ${a.nombre}`} className="p-1.5" onClick={() => setForm(a)}>
                          <Pencil size={18} />
                        </button>
                        <button type="button" aria-label={`Eliminar ${a.nombre}`} className="p-1.5 text-red-700 disabled:opacity-30" disabled={self} onClick={() => setDel(a)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      {form && <AdminForm item={form.id ? form : null} onClose={() => setForm(null)} onSaved={refresh} />}
      {del && <ConfirmModal title="Eliminar administrador" danger confirmLabel="Eliminar" text={`¿Eliminar a ${del.nombre}? Perderá el acceso al panel.`} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
