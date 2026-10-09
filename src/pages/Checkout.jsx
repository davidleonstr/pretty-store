import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarHeart,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  PartyPopper,
} from 'lucide-react';
import { useAsync } from '@/lib/useAsync';
import { ApiError, getBox, listPickups, submitOrder } from '@/lib/api';
import { PRODUCT_ORDER_MIN_CENTS, usd } from '@/lib/money';
import { useCart } from '@/lib/CartContext';
import { Photo } from '@/components/Photo';
import { PickupMap } from '@/components/PickupMap';
import { DetailSkeleton, Skeleton } from '@/components/Skeleton';
import NotFound from './NotFound';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, error, optional, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-semibold block">
        {label} {optional && <span className="font-normal opacity-70 text-sm">(opcional)</span>}
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

function Step({ n, title, children }) {
  return (
    <section className="sketch p-4 sm:p-6 space-y-4">
      <h2 className="h-title text-2xl flex items-center gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-petal-400 border-[3px] border-ink text-lg">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Traduce un error de la API a los errores del formulario (por campo o general).
function orderErrors(err) {
  if (!(err instanceof ApiError)) return { form: 'No pudimos enviar tu reserva. Intenta de nuevo.' };
  if (err.status === 422) {
    const { items, total, kind, ...fields } = err.fields;
    return { ...fields, form: items || total || kind };
  }
  if (err.status === 409 && err.code === 'out_of_stock') {
    return { form: 'Alguno de los productos ya no tiene stock suficiente. Revisa tu pedido.' };
  }
  if (err.status === 429) return { form: 'Demasiados intentos. Espera un momento e intenta de nuevo.' };
  if (err.status === 0) return { form: 'No hay conexión con el servidor. Intenta de nuevo.' };
  return { form: 'No pudimos enviar tu reserva. Intenta de nuevo.' };
}

export default function Checkout({ kind }) {
  const { slug } = useParams();
  const cart = useCart();

  const boxQ = useAsync(() => (kind === 'caja' ? getBox(slug) : Promise.resolve(null)), [kind, slug]);
  const pickupsQ = useAsync(() => listPickups(), []);

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    celular: '',
    correo: '',
    pickupId: '',
    horaId: '',
    nota: '',
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value, ...(k === 'pickupId' ? { horaId: '' } : {}) }));
    setErrors((er) => ({ ...er, [k]: undefined, ...(k === 'pickupId' ? { horaId: undefined } : {}) }));
  };

  // ---- Éxito
  if (done) {
    return (
      <div className="sketch !bg-petal-200 p-6 sm:p-10 text-center space-y-4 max-w-xl mx-auto animate-pop">
        <PartyPopper size={56} className="mx-auto" />
        <h1 className="h-title text-4xl text-petal-600 [text-shadow:2px_2px_0_#fff]">¡Reserva lista!</h1>
        <p className="text-lg">
          Gracias, <b>{done.name}</b>. Tu pedido quedó reservado.
        </p>
        <p className="bubble !block mx-auto max-w-xs">
          Tu código
          <span className="h-title text-3xl block text-petal-600">{done.code}</span>
        </p>
        <div className="text-left sketch p-4 space-y-1 text-sm">
          <p className="flex items-center gap-2">
            <MapPin size={16} /> <b>{done.pickup}</b>
          </p>
          <p className="flex items-center gap-2">
            <Clock size={16} /> {done.hour}
          </p>
          <p className="pt-1">
            Total: <b>{usd(done.total)}</b> (sin pago por ahora)
          </p>
        </div>
        <p className="text-sm">
          Guarda tu código: con él puedes ver, modificar o cancelar tu reserva mientras siga pendiente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/pedido/${done.code}`} className="btn btn-white">
            Ver o modificar mi reserva
          </Link>
          <Link to="/" className="btn btn-deep">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ---- Qué se está reservando
  const box = boxQ.data;
  if (kind === 'caja' && boxQ.loading) return <DetailSkeleton />;
  if (kind === 'caja' && !box) return <NotFound what="esa cajita" back="/cajas" />;

  const lines =
    kind === 'caja'
      ? [{ key: box.slug, name: box.name, qty: 1, priceCents: box.priceCents, photo: box.photos[0] }]
      : cart.items.map((i) => ({ key: i.slug, name: i.name, qty: i.qty, priceCents: i.priceCents, photo: i.photo }));
  const total = lines.reduce((s, l) => s + l.priceCents * l.qty, 0);

  if (kind === 'productos' && lines.length === 0) {
    return (
      <div className="sketch p-8 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-5xl" aria-hidden="true">🛍️</p>
        <h1 className="h-title text-3xl">Aún no elegiste productos</h1>
        <Link to="/productos" className="btn btn-deep">
          Ver productos
        </Link>
      </div>
    );
  }

  // Los productos sueltos requieren un mínimo por pedido (las cajas no)
  const belowMin = kind === 'productos' && total < PRODUCT_ORDER_MIN_CENTS;
  const pickups = pickupsQ.data || [];
  const pickup = pickups.find((p) => p.id === form.pickupId);
  const hour = pickup?.hours.find((h) => h.id === form.horaId);

  const backTo = kind === 'caja' ? `/caja/${slug}` : '/bolsito';

  const validate = () => {
    const v = {};
    if (!form.nombres.trim()) v.nombres = 'Escribe tus nombres';
    if (!form.apellidos.trim()) v.apellidos = 'Escribe tus apellidos';
    const digits = form.celular.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) v.celular = 'Escribe un número de celular válido';
    if (!EMAIL_RE.test(form.correo.trim())) v.correo = 'Escribe un correo válido';
    if (!form.pickupId) v.pickupId = 'Elige un lugar de entrega';
    else if (!form.horaId) v.horaId = 'Elige una hora disponible';
    return v;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending || belowMin) return;
    const v = validate();
    setErrors(v);
    const first = Object.keys(v)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      document.getElementById(`f-${first}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setSending(true);
    try {
      const res = await submitOrder({
        mode: 'reservar',
        kind,
        items: lines.map((l) => ({ slug: l.key, qty: l.qty })),
        customer: {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          celular: form.celular.trim(),
          correo: form.correo.trim(),
        },
        pickupId: form.pickupId,
        horaId: form.horaId,
        nota: form.nota.trim(),
        totalCents: total,
      });
      if (kind === 'productos') cart.clear();
      setDone({
        code: res.code,
        name: form.nombres.trim().split(' ')[0],
        pickup: pickup.name,
        hour: hour.label,
        total: res.totalCents ?? total,
      });
      window.scrollTo(0, 0);
    } catch (err) {
      setErrors(orderErrors(err));
    } finally {
      setSending(false);
    }
  };

  const inputProps = (k) => ({
    id: `f-${k}`,
    value: form[k],
    onChange: set(k),
    className: `field ${errors[k] ? 'field-error' : ''}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `f-${k}-error` : undefined,
  });

  return (
    <div className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1 font-semibold underline decoration-wavy decoration-petal-400 underline-offset-4">
        <ChevronLeft size={18} /> Volver
      </Link>

      <header className="space-y-2">
        <h1 className="h-title text-4xl sm:text-5xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">
          Reservar para retiro
        </h1>
        <p>Completa tus datos y elige dónde y cuándo retirar. No se hace ningún pago ahora.</p>
      </header>

      {belowMin && (
        <p role="alert" className="bubble !rounded-2xl font-semibold !bg-petal-200">
          Los pedidos de productos sueltos deben sumar al menos {usd(PRODUCT_ORDER_MIN_CENTS)}.{' '}
          <Link to="/productos" className="underline">Agregar más</Link>
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <Step n="1" title="Tus datos">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="f-nombres" label="Nombres" error={errors.nombres}>
                <input {...inputProps('nombres')} autoComplete="given-name" placeholder="María Fernanda" />
              </Field>
              <Field id="f-apellidos" label="Apellidos" error={errors.apellidos}>
                <input {...inputProps('apellidos')} autoComplete="family-name" placeholder="López Martínez" />
              </Field>
              <Field id="f-celular" label="Número de celular" error={errors.celular}>
                <input {...inputProps('celular')} type="tel" inputMode="tel" autoComplete="tel" placeholder="7000 0000" />
              </Field>
              <Field id="f-correo" label="Correo electrónico" error={errors.correo}>
                <input {...inputProps('correo')} type="email" inputMode="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" />
              </Field>
            </div>
          </Step>

          <Step n="2" title="Lugar y hora de retiro">
            <fieldset id="f-pickupId" tabIndex={-1} className="space-y-3 outline-none">
              <legend className="font-semibold mb-2">Lugar de entrega</legend>
              {pickupsQ.loading ? (
                <div className="space-y-3" role="status" aria-label="Cargando lugares">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                pickups.map((p) => (
                  <label
                    key={p.id}
                    className="sketch sketch-flat flex items-start gap-3 p-3 cursor-pointer transition-colors has-[:checked]:!bg-petal-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-petal-400"
                  >
                    <input
                      type="radio"
                      name="pickup"
                      value={p.id}
                      checked={form.pickupId === p.id}
                      onChange={set('pickupId')}
                      className="mt-1.5 w-5 h-5 accent-[#B8396A]"
                    />
                    <span>
                      <span className="font-semibold block leading-tight">{p.name}</span>
                      <span className="text-sm opacity-80">{p.address}</span>
                    </span>
                  </label>
                ))
              )}
              {!pickupsQ.loading && pickups.length === 0 && (
                <p role="status" className="bubble !rounded-2xl font-semibold !bg-petal-200">
                  No hay puntos de retiro disponibles en este momento. Vuelve a intentarlo más tarde.
                </p>
              )}
              {errors.pickupId && <p role="alert" className="text-sm font-semibold text-petal-600">{errors.pickupId}</p>}
            </fieldset>

            {pickup && (
              <>
                <PickupMap pickup={pickup} />
                <fieldset id="f-horaId" tabIndex={-1} className="space-y-2 outline-none">
                  <legend className="font-semibold mb-2">Hora disponible</legend>
                  <div className="flex flex-wrap gap-2">
                    {pickup.hours.map((h) => (
                      <label
                        key={h.id}
                        className="sticker !rotate-0 cursor-pointer flex items-center gap-1.5 has-[:checked]:!bg-petal-400 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-petal-400"
                      >
                        <input
                          type="radio"
                          name="hora"
                          value={h.id}
                          checked={form.horaId === h.id}
                          onChange={set('horaId')}
                          className="sr-only"
                        />
                        <Clock size={14} /> {h.label}
                      </label>
                    ))}
                  </div>
                  {errors.horaId && <p role="alert" className="text-sm font-semibold text-petal-600">{errors.horaId}</p>}
                </fieldset>
              </>
            )}
          </Step>

          <Step n="3" title="Una notita (opcional)">
            <Field id="f-nota" label="¿Quieres decirnos algo?" optional>
              <textarea
                {...inputProps('nota')}
                rows={3}
                maxLength={300}
                placeholder="Ej.: es para un cumpleaños, ¿pueden agregar una tarjetita?"
              />
              <p className="text-xs text-right opacity-70">{form.nota.length}/300</p>
            </Field>
          </Step>
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="sketch !bg-petal-100 p-4 sm:p-5 space-y-4">
            <h2 className="h-title text-2xl">Tu pedido</h2>
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-lg overflow-hidden border-2 border-ink shrink-0">
                    <Photo photo={l.photo} alt="" size="sm" />
                  </span>
                  <span className="flex-1 leading-tight font-medium">
                    {l.qty > 1 && `${l.qty}× `}
                    {l.name}
                  </span>
                  <span className="font-semibold">{usd(l.priceCents * l.qty)}</span>
                </li>
              ))}
            </ul>
            {(pickup || hour) && (
              <div className="text-sm border-t-2 border-dashed border-ink/40 pt-3 space-y-1">
                {pickup && (
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="shrink-0 mt-0.5" /> {pickup.name}
                  </p>
                )}
                {hour && (
                  <p className="flex items-start gap-2">
                    <Clock size={16} className="shrink-0 mt-0.5" /> {hour.label}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between border-t-2 border-dashed border-ink/40 pt-3">
              <span className="font-semibold text-lg">Total</span>
              <span className="h-title text-3xl">{usd(total)}</span>
            </div>
            {errors.form && <p role="alert" className="text-sm font-semibold text-petal-600">{errors.form}</p>}
            <button type="submit" disabled={sending || belowMin || (!pickupsQ.loading && pickups.length === 0)} className="btn btn-deep w-full">
              {sending ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Enviando…
                </>
              ) : (
                <>
                  <CalendarHeart size={20} /> Confirmar reserva
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
      
