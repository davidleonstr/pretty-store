import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAuth } from '@/admin/AuthContext';
import { Card, Field, PageHeader, inputCls, useToast } from '../ui';
import { errMsg } from '@/admin/utils';

const MIN_PASSWORD = 10;

export default function Account() {
  const { admin } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ actual: '', nueva: '', repetir: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.actual) v.actual = 'Escribe tu contraseña actual';
    if (f.nueva.length < MIN_PASSWORD) v.nueva = `Mínimo ${MIN_PASSWORD} caracteres`;
    if (f.repetir !== f.nueva) v.repetir = 'Las contraseñas no coinciden';
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await adm('/api/admin/me/password', { method: 'POST', body: { actual: f.actual, nueva: f.nueva } });
      toast('Contraseña actualizada');
      setF({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      if (err.status === 422) setErrors(err.fields);
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Mi cuenta" subtitle={`${admin?.nombre} · ${admin?.correo}`} />
      <Card className="max-w-md">
        <h2 className="h-title text-2xl mb-4 flex items-center gap-2">
          <KeyRound size={22} /> Cambiar contraseña
        </h2>
        <form onSubmit={submit} noValidate className="space-y-4" autoComplete="off">
          <Field label="Contraseña actual" error={errors.actual}>
            <input className={inputCls(errors.actual)} type="password" autoComplete="current-password" value={f.actual} onChange={set('actual')} />
          </Field>
          <Field label="Nueva contraseña" error={errors.nueva} hint={`Mínimo ${MIN_PASSWORD} caracteres.`}>
            <input className={inputCls(errors.nueva)} type="password" autoComplete="new-password" value={f.nueva} onChange={set('nueva')} />
          </Field>
          <Field label="Repite la nueva contraseña" error={errors.repetir}>
            <input className={inputCls(errors.repetir)} type="password" autoComplete="new-password" value={f.repetir} onChange={set('repetir')} />
          </Field>
          <button type="submit" className="btn btn-deep" disabled={busy}>
            {busy && <Loader2 size={18} className="animate-spin" />} Guardar contraseña
          </button>
        </form>
      </Card>
    </>
  );
}
