import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarPlus, Clock, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Spinner, Toggle, inputCls, useToast } from '../ui';
import { errMsg, fmtFecha, todayYmd } from '@/admin/utils';

function PickupForm({ pickup, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: pickup?.name ?? '',
    address: pickup?.address ?? '',
    lat: pickup ? String(pickup.lat) : '',
    lon: pickup ? String(pickup.lon) : '',
    isActive: pickup?.isActive ?? true,
    sortOrder: String(pickup?.sortOrder ?? 0),
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const lat = Number(f.lat.replace(',', '.'));
    const lon = Number(f.lon.replace(',', '.'));
    const sortOrder = Number(f.sortOrder);
    const v = {};
    if (!f.name.trim()) v.name = 'Escribe un nombre';
    if (!f.address.trim()) v.address = 'Escribe la dirección';
    if (f.lat.trim() === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) v.lat = 'Latitud entre -90 y 90';
    if (f.lon.trim() === '' || !Number.isFinite(lon) || lon < -180 || lon > 180) v.lon = 'Longitud entre -180 y 180';
    if (!Number.isInteger(sortOrder)) v.sortOrder = 'Debe ser un número entero';
    setErrors(v);
    if (Object.keys(v).length) return;
    const body = { name: f.name.trim(), address: f.address.trim(), lat, lon, isActive: f.isActive, sortOrder };
    setBusy(true);
    try {
      await (pickup ? adm(`/api/admin/pickups/${pickup.id}`, { method: 'PATCH', body }) : adm('/api/admin/pickups', { method: 'POST', body }));
      toast(pickup ? 'Punto actualizado' : 'Punto creado');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422) setErrors(err.fields);
      else if (err.code === 'pickup_exists') setErrors({ name: err.message });
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={pickup ? 'Editar punto de retiro' : 'Nuevo punto de retiro'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="pickup-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="pickup-form" onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre" error={errors.name} className="sm:col-span-2">
          <input className={inputCls(errors.name)} value={f.name} onChange={set('name')} autoFocus />
        </Field>
        <Field label="Dirección" error={errors.address} className="sm:col-span-2">
          <input className={inputCls(errors.address)} value={f.address} onChange={set('address')} />
        </Field>
        <Field label="Latitud" error={errors.lat} hint="En Google Maps: clic derecho en el punto → copiar coordenadas.">
          <input className={inputCls(errors.lat)} inputMode="decimal" value={f.lat} onChange={set('lat')} placeholder="13.9768" />
        </Field>
        <Field label="Longitud" error={errors.lon}>
          <input className={inputCls(errors.lon)} inputMode="decimal" value={f.lon} onChange={set('lon')} placeholder="-89.6667" />
        </Field>
        <Field label="Orden" error={errors.sortOrder}>
          <input className={inputCls(errors.sortOrder)} type="number" value={f.sortOrder} onChange={set('sortOrder')} />
        </Field>
        <div className="flex items-center gap-3 pt-6">
          <Toggle checked={f.isActive} onChange={(isActive) => setF({ ...f, isActive })} label="Activo" />
          <span className="font-semibold">Activo</span>
        </div>
      </form>
    </Modal>
  );
}

function FechaForm({ pickup, fecha, horas, onClose, onSaved }) {
  const toast = useToast();
  const [date, setDate] = useState(fecha?.fecha ?? '');
  const [active, setActive] = useState(fecha?.isActive ?? true);
  const [horaIds, setHoraIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setErrors({ fecha: 'Elige una fecha' });
    setBusy(true);
    try {
      if (fecha) await adm(`/api/admin/pickups/${pickup.id}/fechas/${fecha.id}`, { method: 'PATCH', body: { fecha: date, isActive: active } });
      else await adm(`/api/admin/pickups/${pickup.id}/fechas`, { method: 'POST', body: { fecha: date, isActive: active, horaIds } });
      toast(fecha ? 'Fecha actualizada' : 'Fecha agregada');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422 || err.code === 'fecha_exists') setErrors({ fecha: err.fields?.fecha || err.fields?.horaIds || err.message });
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`${fecha ? 'Editar fecha' : 'Nueva fecha'} · ${pickup.name}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="fecha-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <form id="fecha-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Fecha" error={errors.fecha} hint={date ? fmtFecha(date) : undefined}>
          <input type="date" className={inputCls(errors.fecha)} value={date} min={fecha ? undefined : todayYmd()} onChange={(e) => setDate(e.target.value)} autoFocus />
        </Field>
        {!fecha && (
          <fieldset className="space-y-2">
            <legend className="font-semibold">Horas disponibles</legend>
            {horas.length === 0 ? (
              <p className="text-sm">
                Aún no hay horas. <Link to="/admin/horas" className="underline">Crea algunas primero</Link>.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {horas.map((h) => (
                  <label key={h.id} className="sticker !rotate-0 cursor-pointer flex items-center gap-1.5 has-[:checked]:!bg-petal-400">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={horaIds.includes(h.id)}
                      onChange={() => setHoraIds((l) => (l.includes(h.id) ? l.filter((x) => x !== h.id) : [...l, h.id]))}
                    />
                    <Clock size={14} /> {h.hora}
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs opacity-70">Puedes agregar o quitar horas después.</p>
          </fieldset>
        )}
        <div className="flex items-center gap-3">
          <Toggle checked={active} onChange={setActive} label="Activa" />
          <span className="font-semibold">Activa</span>
        </div>
      </form>
    </Modal>
  );
}

function FechaRow({ pickup, fecha, horas, onChange, setModal }) {
  const toast = useToast();
  const past = fecha.fecha < todayYmd();
  const call = async (path, opts, ok) => {
    try {
      await adm(`/api/admin/pickups/${pickup.id}/fechas/${fecha.id}${path}`, opts);
      if (ok) toast(ok);
      onChange();
    } catch (e) {
      toast(e.code === 'has_orders' ? `${e.message}.` : errMsg(e), 'bad');
    }
  };
  const taken = new Set(fecha.horas.map((h) => h.horaId));
  const addable = horas.filter((h) => !taken.has(h.id));

  return (
    <li className={`py-3 space-y-2 ${past || !fecha.isActive ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold capitalize">{fmtFecha(fecha.fecha)}</span>
        {past && <Badge>pasada</Badge>}
        {!fecha.horas.some((h) => h.isActive) && fecha.isActive && <Badge tone="warn">sin horas</Badge>}
        <span className="ml-auto flex items-center gap-1">
          <Toggle checked={fecha.isActive} label={`Fecha activa ${fecha.fecha}`} onChange={(isActive) => call('', { method: 'PATCH', body: { isActive } }, isActive ? 'Fecha activada' : 'Fecha desactivada')} />
          <button type="button" aria-label="Editar fecha" className="p-1.5" onClick={() => setModal({ type: 'fecha', pickup, fecha })}>
            <Pencil size={16} />
          </button>
          <button type="button" aria-label="Eliminar fecha" className="p-1.5 text-red-700" onClick={() => setModal({ type: 'delFecha', pickup, fecha })}>
            <Trash2 size={16} />
          </button>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {fecha.horas.map((h) => (
          <span key={h.id} className={`sticker !rotate-0 !py-0.5 flex items-center gap-1 text-sm ${h.isActive ? '' : '!bg-white opacity-60 line-through'}`}>
            <button
              type="button"
              title={h.isActive ? 'Clic para desactivar' : 'Clic para activar'}
              onClick={() => call(`/horas/${h.id}`, { method: 'PATCH', body: { isActive: !h.isActive } }, h.isActive ? 'Hora desactivada' : 'Hora activada')}
              className="flex items-center gap-1"
            >
              <Clock size={13} /> {h.hora}
            </button>
            <button type="button" aria-label={`Quitar ${h.hora}`} onClick={() => call(`/horas/${h.id}`, { method: 'DELETE' }, 'Hora eliminada')}>
              <X size={13} />
            </button>
          </span>
        ))}
        {addable.length > 0 && (
          <select
            aria-label="Agregar hora"
            className="field !py-0.5 !text-sm !w-auto"
            value=""
            onChange={(e) => e.target.value && call('/horas', { method: 'POST', body: { horaId: Number(e.target.value) } }, 'Hora agregada')}
          >
            <option value="">+ hora</option>
            {addable.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hora}
              </option>
            ))}
          </select>
        )}
      </div>
    </li>
  );
}

export default function Pickups() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [modal, setModal] = useState(null);
  const refresh = () => setReload((n) => n + 1);

  const pickups = useAsync(() => adm('/api/admin/pickups'), [reload]);
  const horas = useAsync(() => adm('/api/admin/horas'), []);
  const sin = useAsync(() => adm('/api/admin/pickups/sin-horarios'), [reload]);
  const hs = horas.data ?? [];

  const del = async (path, ok) => {
    try {
      await adm(path, { method: 'DELETE' });
      toast(ok);
      refresh();
    } catch (e) {
      toast(e.code === 'has_orders' ? `${e.message}.` : errMsg(e), 'bad');
      throw e;
    }
  };

  return (
    <>
      <PageHeader title="Puntos de retiro" subtitle="Lugares, fechas concretas y horas en que los clientes pueden retirar.">
        <button type="button" className="btn btn-deep" onClick={() => setModal({ type: 'pickup' })}>
          <Plus size={18} /> Nuevo punto
        </button>
      </PageHeader>

      {sin.data?.length > 0 && (
        <p className="bubble !rounded-2xl !bg-amber-100 font-semibold mb-4 flex items-start gap-2">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          Sin fechas/horas disponibles (los clientes no pueden elegirlos): {sin.data.map((p) => p.name).join(', ')}.
        </p>
      )}
      <ErrorNote error={pickups.error || horas.error} retry={refresh} />

      {pickups.loading && !pickups.data ? (
        <Spinner />
      ) : !pickups.data?.length ? (
        <Card>
          <EmptyRow>Aún no hay puntos de retiro.</EmptyRow>
        </Card>
      ) : (
        <div className="space-y-5">
          {pickups.data.map((p) => (
            <Card key={p.id} className={p.isActive ? '' : 'opacity-70'}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="h-title text-2xl text-petal-600 flex items-center gap-2 flex-wrap">
                    {p.name} {!p.isActive && <Badge tone="mute">inactivo</Badge>}
                  </h2>
                  <p className="flex items-center gap-1.5 text-sm mt-1">
                    <MapPin size={16} /> {p.address}
                  </p>
                  <p className="text-xs opacity-70">
                    {p.lat}, {p.lon}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className="btn btn-sm btn-white" onClick={() => setModal({ type: 'fecha', pickup: p })}>
                    <CalendarPlus size={16} /> Agregar fecha
                  </button>
                  <button type="button" aria-label={`Editar ${p.name}`} className="p-1.5" onClick={() => setModal({ type: 'pickup', pickup: p })}>
                    <Pencil size={18} />
                  </button>
                  <button type="button" aria-label={`Eliminar ${p.name}`} className="p-1.5 text-red-700" onClick={() => setModal({ type: 'delPickup', pickup: p })}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {p.fechas.length === 0 ? (
                <p className="mt-3 text-sm opacity-80">Sin fechas todavía.</p>
              ) : (
                <ul className="mt-3 divide-y-2 divide-dashed divide-ink/20">
                  {p.fechas.map((fe) => (
                    <FechaRow key={fe.id} pickup={p} fecha={fe} horas={hs} onChange={refresh} setModal={setModal} />
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      {modal?.type === 'pickup' && <PickupForm pickup={modal.pickup} onClose={() => setModal(null)} onSaved={refresh} />}
      {modal?.type === 'fecha' && <FechaForm pickup={modal.pickup} fecha={modal.fecha} horas={hs} onClose={() => setModal(null)} onSaved={refresh} />}
      {modal?.type === 'delPickup' && (
        <ConfirmModal title="Eliminar punto" danger confirmLabel="Eliminar" text={`¿Eliminar “${modal.pickup.name}” con todas sus fechas y horas? Si tiene pedidos, desactívalo en su lugar.`} onConfirm={() => del(`/api/admin/pickups/${modal.pickup.id}`, 'Punto eliminado')} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delFecha' && (
        <ConfirmModal title="Eliminar fecha" danger confirmLabel="Eliminar" text={`¿Eliminar ${fmtFecha(modal.fecha.fecha)} y sus horas?`} onConfirm={() => del(`/api/admin/pickups/${modal.pickup.id}/fechas/${modal.fecha.id}`, 'Fecha eliminada')} onClose={() => setModal(null)} />
      )}
    </>
  );
}
