import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarHeart, ChevronLeft, Clock, Loader2, MapPin, Pencil, Search, XCircle } from 'lucide-react';
import { ApiError, cancelOrder, getOrder, listPickups, updateOrder } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { usd } from '@/lib/money';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_RE = /^PS-[A-Z0-9]{6}$/;

// "ps-7k2qf9", "7K2QF9" o " PS-7K2QF9 " -> "PS-7K2QF9"
const normalizeCode = (raw) => {
  const t = String(raw).trim().toUpperCase().replace(/\s+/g, '');
  return /^[A-Z0-9]{6}$/.test(t) ? `PS-${t}` : t;
};

const STATUS_TEXT = {
  pendiente: 'Pendiente',
  'en proceso': 'En proceso',
  'por entregar': 'Lista para retirar',
  entregado: 'Entregada',
  cancelado: 'Cancelada',
};

function Card({ children, className = '' }) {
  return <section className={`sketch p-4 sm:p-6 space-y-4 ${className}`}>{children}</section>;
}

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-semibold block">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-petal-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ---- Sin código en la URL: pedirlo
function FindOrder() {
  const nav = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const code = normalizeCode(value);
    if (!CODE_RE.test(code)) return setError('El código tiene el formato PS-ABC123');
    nav(`/pedido/${code}`);
  };
  return (
    <form onSubmit={submit} noValidate className="sketch p-6 sm:p-8 max-w-md mx-auto space-y-4">
      <h1 className="h-title text-3xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Mi reserva</h1>
      <p>Escribe el código que recibiste al reservar para ver, modificar o cancelar tu pedido.</p>
      <Field id="f-codigo" label="Código de reserva" error={error}>
        <input
          id="f-codigo"
          className={`field w-full uppercase ${error ? 'field-error' : ''}`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="PS-ABC123"
          autoComplete="off"
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'f-codigo-error' : undefined}
        />
      </Field>
      <button type="submit" className="btn btn-deep w-full">
        <Search size={20} /> Buscar mi reserva
      </button>
    </form>
  );
}

// ---- Edición (solo pedidos pendientes)
function EditForm({ order, pickups, onCancel, onSaved }) {
  const [form, setForm] = useState({ ...order.customer, nota: order.nota, pickupId: '', horaId: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const pickup = pickups.find((p) => p.id === form.pickupId);
  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value, ...(k === 'pickupId' ? { horaId: '' } : {}) }));
    setErrors((er) => ({ ...er, [k]: undefined, ...(k === 'pickupId' ? { horaId: undefined } : {}) }));
  };
  const input = (k) => ({
    id: `f-${k}`,
    value: form[k],
    onChange: set(k),
    className: `field w-full ${errors[k] ? 'field-error' : ''}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `f-${k}-error` : undefined,
  });

  const validate = () => {
    const v = {};
    if (!form.nombres.trim()) v.nombres = 'Escribe tus nombres';
    if (!form.apellidos.trim()) v.apellidos = 'Escribe tus apellidos';
    const digits = form.celular.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) v.celular = 'Escribe un número de celular válido';
    if (!EMAIL_RE.test(form.correo.trim())) v.correo = 'Escribe un correo válido';
    if (form.pickupId && !form.horaId) v.horaId = 'Elige una hora disponible';
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const v = validate();
    setErrors(v);
    const first = Object.keys(v)[0];
    if (first) return document.getElementById(`f-${first}`)?.focus();

    const patch = {
      customer: {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        celular: form.celular.trim(),
        correo: form.correo.trim(),
      },
      nota: form.nota.trim(),
      // El retiro solo se envía si el cliente eligió uno nuevo
      ...(form.pickupId && form.horaId ? { pickupId: form.pickupId, horaId: form.horaId } : {}),
    };
    setSaving(true);
    try {
      await updateOrder(order.id, patch);
      onSaved('Listo, tu reserva fue actualizada. 💕');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const { items, total, kind, ...fields } = err.fields;
        setErrors({ ...fields, form: items || total || kind });
      } else if (err instanceof ApiError && err.code === 'order_locked') {
        onSaved(err.message, true);
      } else if (err instanceof ApiError && err.status === 429) {
        setErrors({ form: 'Demasiados intentos. Espera un momento e intenta de nuevo.' });
      } else {
        setErrors({ form: 'No pudimos guardar los cambios. Intenta de nuevo.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <h2 className="h-title text-2xl">Tus datos</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="f-nombres" label="Nombres" error={errors.nombres}>
            <input {...input('nombres')} autoComplete="given-name" />
          </Field>
          <Field id="f-apellidos" label="Apellidos" error={errors.apellidos}>
            <input {...input('apellidos')} autoComplete="family-name" />
          </Field>
          <Field id="f-celular" label="Número de celular" error={errors.celular}>
            <input {...input('celular')} type="tel" inputMode="tel" autoComplete="tel" />
          </Field>
          <Field id="f-correo" label="Correo electrónico" error={errors.correo}>
            <input {...input('correo')} type="email" inputMode="email" autoComplete="email" />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="h-title text-2xl">Lugar y hora de retiro</h2>
        <p className="text-sm">
          Ahora: <b>{order.pickup.name}</b> · {order.pickup.label}. Elige otro solo si quieres cambiarlo.
        </p>
        <Field id="f-pickupId" label="Lugar de entrega">
          <select id="f-pickupId" className="field w-full" value={form.pickupId} onChange={set('pickupId')}>
            <option value="">Mantener mi retiro actual</option>
            {pickups.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.address}
              </option>
            ))}
          </select>
        </Field>
        {pickup && (
          <fieldset id="f-horaId" tabIndex={-1} className="space-y-2 outline-none">
            <legend className="font-semibold mb-2">Hora disponible</legend>
            <div className="flex flex-wrap gap-2">
              {pickup.hours.map((h) => (
                <label key={h.id} className="sticker !rotate-0 cursor-pointer flex items-center gap-1.5 has-[:checked]:!bg-petal-400 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-petal-400">
                  <input type="radio" name="hora" value={h.id} checked={form.horaId === h.id} onChange={set('horaId')} className="sr-only" />
                  <Clock size={14} /> {h.label}
                </label>
              ))}
            </div>
            {errors.horaId && (
              <p role="alert" className="text-sm font-semibold text-petal-600">
                {errors.horaId}
              </p>
            )}
          </fieldset>
        )}
      </Card>

      <Card>
        <Field id="f-nota" label="Una notita (opcional)" error={errors.nota}>
          <textarea {...input('nota')} rows={3} maxLength={300} />
          <p className="text-xs text-right opacity-70">{form.nota.length}/300</p>
        </Field>
      </Card>

      {errors.form && (
        <p role="alert" className="text-sm font-semibold text-petal-600">
          {errors.form}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="submit" disabled={saving} className="btn btn-deep">
          {saving ? <Loader2 size={20} className="animate-spin" /> : <CalendarHeart size={20} />} Guardar cambios
        </button>
        <button type="button" onClick={onCancel} className="btn btn-white" disabled={saving}>
          Volver sin guardar
        </button>
      </div>
    </form>
  );
}

// ---- Vista de la reserva
function OrderView({ codigo }) {
  const [reload, setReload] = useState(0);
  const [mode, setMode] = useState('view'); // view | edit
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { text, bad }
  const q = useAsync(() => getOrder(codigo), [codigo, reload]);
  const pk = useAsync(() => (mode === 'edit' ? listPickups() : Promise.resolve([])), [mode]);

  if (q.loading && !q.data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16" role="status">
        <Loader2 className="animate-spin" /> Buscando tu reserva…
      </div>
    );
  }
  if (q.error) {
    return (
      <Card className="max-w-lg mx-auto text-center" >
        <p className="text-5xl" aria-hidden="true">🔌</p>
        <h1 className="h-title text-2xl">No pudimos cargar tu reserva</h1>
        <p>{q.error.status === 429 ? 'Demasiados intentos. Espera un momento.' : 'Revisa tu conexión e intenta de nuevo.'}</p>
        <button type="button" className="btn btn-deep" onClick={() => setReload((n) => n + 1)}>
          Reintentar
        </button>
      </Card>
    );
  }
  const o = q.data;
  if (!o) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <p className="text-6xl" aria-hidden="true">🙈</p>
        <h1 className="h-title text-3xl">No encontramos esa reserva</h1>
        <p>Revisa que el código esté bien escrito (por ejemplo, PS-ABC123).</p>
        <Link to="/pedido" className="btn btn-deep">
          Probar con otro código
        </Link>
      </Card>
    );
  }

  const done = (text, bad = false) => {
    setNotice({ text, bad });
    setMode('view');
    setConfirming(false);
    setReload((n) => n + 1);
    window.scrollTo(0, 0);
  };

  const doCancel = async () => {
    setBusy(true);
    try {
      await cancelOrder(o.id);
      done('Tu reserva fue cancelada.');
    } catch (err) {
      done(err instanceof ApiError && err.code === 'order_locked' ? err.message : 'No pudimos cancelar. Intenta de nuevo.', true);
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'edit') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="h-title text-3xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Modificar {o.code}</h1>
        {pk.loading ? (
          <div className="flex items-center gap-2" role="status">
            <Loader2 className="animate-spin" /> Cargando lugares…
          </div>
        ) : (
          <EditForm order={o} pickups={pk.data ?? []} onCancel={() => setMode('view')} onSaved={done} />
        )}
      </div>
    );
  }

  const cancelled = o.status === 'cancelado';
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4">
        <ChevronLeft size={18} /> Inicio
      </Link>

      {notice && (
        <p role="status" className={`bubble ml-5 !rounded-2xl font-semibold ${notice.bad ? '!bg-petal-200' : ''}`}>
          {notice.text}
        </p>
      )}

      <header className="space-y-2">
        <h1 className="h-title text-4xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Tu reserva</h1>
        <p className="flex flex-wrap items-center gap-3">
          <span className="h-title text-3xl">{o.code}</span>
          <span className={`sticker !rotate-0 ${cancelled ? '!bg-white line-through' : ''}`}>{STATUS_TEXT[o.status] ?? o.status}</span>
        </p>
      </header>

      <Card className={cancelled ? 'opacity-70' : ''}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h2 className="font-bold">Retiro</h2>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="shrink-0 mt-1" /> {o.pickup.name}
            </p>
            <p className="text-sm opacity-80">{o.pickup.address}</p>
            <p className="flex items-center gap-2 font-semibold">
              <Clock size={16} /> {o.pickup.label}
            </p>
          </div>
          <div className="space-y-1">
            <h2 className="font-bold">Tus datos</h2>
            <p>
              {o.customer.nombres} {o.customer.apellidos}
            </p>
            <p className="text-sm break-all">{o.customer.correo}</p>
            <p className="text-sm">{o.customer.celular}</p>
          </div>
        </div>
        {o.nota && (
          <p className="text-sm">
            <b>Nota:</b> {o.nota}
          </p>
        )}
        <ul className="divide-y-2 divide-dashed divide-ink/20">
          {o.items.map((it, i) => (
            <li key={i} className="py-2 flex justify-between gap-3">
              <span>
                {it.qty > 1 && `${it.qty}× `}
                {it.name}
              </span>
              <span className="font-semibold">{usd(it.unitPriceCents * it.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between items-center pt-1">
          <span className="font-semibold text-lg">Total</span>
          <span className="h-title text-3xl">{usd(o.totalCents)}</span>
        </p>
        <p className="text-xs opacity-70">Sin pago por ahora: pagas al retirar.</p>
      </Card>

      {o.canModify ? (
        <div className="space-y-3">
          {confirming ? (
            <div className="sketch !bg-petal-100 p-4 space-y-3" role="alertdialog" aria-label="Confirmar cancelación">
              <p className="font-semibold">¿Seguro que quieres cancelar tu reserva? No se puede deshacer.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" className="btn btn-deep" onClick={doCancel} disabled={busy}>
                  {busy && <Loader2 size={18} className="animate-spin" />} Sí, cancelar
                </button>
                <button type="button" className="btn btn-white" onClick={() => setConfirming(false)} disabled={busy}>
                  No, mantenerla
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" className="btn btn-deep" onClick={() => { setNotice(null); setMode('edit'); }}>
                <Pencil size={20} /> Modificar datos o retiro
              </button>
              <button type="button" className="btn btn-white" onClick={() => setConfirming(true)}>
                <XCircle size={20} /> Cancelar reserva
              </button>
            </div>
          )}
        </div>
      ) : (
        !cancelled && (
          <p className="bubble !rounded-2xl !block">
            Tu reserva ya está <b>{STATUS_TEXT[o.status]?.toLowerCase() ?? o.status}</b>, así que ya no se puede modificar ni cancelar desde aquí. Si necesitas
            algo, escríbenos.
          </p>
        )
      )}
    </div>
  );
}

// Rutas sugeridas:  /pedido  (pide el código)  y  /pedido/:codigo
export default function ManageOrder() {
  const { codigo } = useParams();
  if (!codigo) return <FindOrder />;
  return <OrderView codigo={normalizeCode(codigo)} key={codigo} />;
}
