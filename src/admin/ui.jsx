import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 opacity-80" role="status">
      <Loader2 className="animate-spin" size={22} /> {label}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="h-title text-3xl sm:text-4xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">{title}</h1>
        {subtitle && <p className="mt-1 opacity-80">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Card({ className = '', children }) {
  return <section className={`sketch p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function Field({ label, error, hint, optional, children, className = '' }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="font-semibold block">
        {label} {optional && <span className="font-normal opacity-70 text-sm">(opcional)</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs opacity-70 block">{hint}</span>}
      {error && (
        <span role="alert" className="text-sm font-semibold text-petal-600 block">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputCls = (error) => `field w-full ${error ? 'field-error' : ''}`;

const TONES = {
  ok: 'bg-green-100 text-green-900',
  warn: 'bg-amber-100 text-amber-900',
  bad: 'bg-red-100 text-red-900',
  info: 'bg-sky-100 text-sky-900',
  mute: 'bg-white text-ink/70',
};
export function Badge({ tone = 'mute', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-ink text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function ErrorNote({ error, retry }) {
  if (!error) return null;
  return (
    <div role="alert" className="bubble !rounded-2xl !bg-petal-200 font-semibold flex items-center gap-2 flex-wrap">
      <AlertTriangle size={18} /> {error.message || 'No pudimos cargar los datos.'}
      {retry && (
        <button type="button" className="underline" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyRow({ children }) {
  return <p className="text-center py-8 opacity-80">{children}</p>;
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Paginación">
      <button type="button" className="btn btn-sm btn-white" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={16} /> Anterior
      </button>
      <span className="font-semibold text-sm">
        Página {page} de {pages}
      </span>
      <button type="button" className="btn btn-sm btn-white" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export function Modal({ title, onClose, children, wide = false, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 bg-ink/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sketch !bg-white w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[92vh] flex flex-col outline-none`}
      >
        <div className="flex items-center justify-between gap-3 p-4 border-b-2 border-dashed border-ink/30">
          <h2 className="h-title text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1.5 opacity-70 hover:opacity-100">
            <X size={22} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">{children}</div>
        {footer && <div className="p-4 border-t-2 border-dashed border-ink/30 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, text, confirmLabel = 'Confirmar', danger, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`btn ${danger ? 'btn-white !text-red-700' : 'btn-deep'}`} onClick={run} disabled={busy}>
            {busy && <Loader2 size={18} className="animate-spin" />} {confirmLabel}
          </button>
        </>
      }
    >
      <p>{text}</p>
    </Modal>
  );
}

// Notificaciones breves: const toast = useToast(); toast('Guardado'); toast('Error…', 'bad')
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, message, kind }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === 'bad' ? 7000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] space-y-2 sm:w-96" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} role={t.kind === 'bad' ? 'alert' : 'status'} className={`sketch !p-3 flex items-start gap-2 font-semibold ${t.kind === 'bad' ? '!bg-red-100' : '!bg-green-100'}`}>
            {t.kind === 'bad' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full border-[3px] border-ink transition-colors shrink-0 disabled:opacity-50 ${checked ? 'bg-petal-400' : 'bg-white'}`}
    >
      <span className={`absolute top-[1px] w-4 h-4 rounded-full bg-ink transition-all ${checked ? 'left-[20px]' : 'left-0.5'}`} />
    </button>
  );
}
