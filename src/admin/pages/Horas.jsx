import { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { Card, ConfirmModal, EmptyRow, ErrorNote, PageHeader, Spinner, useToast } from '../ui';
import { errMsg } from '@/admin/utils';

const label = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

export default function Horas() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);
  const { loading, data, error: loadError } = useAsync(() => adm('/api/admin/horas'), [reload]);
  const refresh = () => setReload((n) => n + 1);

  const add = async (e) => {
    e.preventDefault();
    if (!/^\d{2}:\d{2}$/.test(value)) return setError('Elige una hora');
    setBusy(true);
    setError('');
    try {
      await adm('/api/admin/horas', { method: 'POST', body: { hora: value } });
      toast('Hora agregada');
      setValue('');
      refresh();
    } catch (err) {
      if (err.status === 422 || err.code === 'hora_exists') setError(err.fields?.hora || err.message);
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await adm(`/api/admin/horas/${del.id}`, { method: 'DELETE' });
      toast('Hora eliminada');
      refresh();
    } catch (e) {
      toast(e.code === 'in_use' ? 'Esa hora se usa en algún punto de retiro. Quítala de allí primero.' : errMsg(e), 'bad');
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Horas de retiro" subtitle="Catálogo de horas que luego asignas a cada fecha de un punto de retiro (hora de El Salvador)." />
      <Card className="mb-5">
        <form onSubmit={add} className="flex flex-wrap items-end gap-3" noValidate>
          <label className="space-y-1.5">
            <span className="font-semibold block">Nueva hora</span>
            <input type="time" className={`field ${error ? 'field-error' : ''}`} value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-deep" disabled={busy}>
            <Plus size={18} /> Agregar
          </button>
          {error && <p role="alert" className="text-sm font-semibold text-petal-600 w-full">{error}</p>}
        </form>
      </Card>

      <ErrorNote error={loadError} retry={refresh} />
      <Card>
        {loading && !data ? (
          <Spinner />
        ) : !data?.length ? (
          <EmptyRow>Aún no hay horas.</EmptyRow>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {data.map((h) => (
              <li key={h.id} className="sticker !rotate-0 flex items-center gap-2 text-base">
                <Clock size={16} /> {label(h.hora)}
                <button type="button" aria-label={`Eliminar ${label(h.hora)}`} className="text-red-700" onClick={() => setDel(h)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {del && <ConfirmModal title="Eliminar hora" danger confirmLabel="Eliminar" text={`¿Eliminar ${label(del.hora)} del catálogo?`} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
