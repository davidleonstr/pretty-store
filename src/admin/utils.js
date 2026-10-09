import { useEffect, useState } from 'react';

// Dinero: el panel escribe dólares ("3.50"), la API usa centavos (350).
export const centsToInput = (c) => (c == null ? '' : (c / 100).toFixed(2));
export function inputToCents(s) {
  const t = String(s ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}

const TZ = 'America/El_Salvador';
export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('es-SV', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }) : '—';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
// 'YYYY-MM-DD' -> "lunes 12 oct 2026" (sin desfases de zona horaria)
export function fmtFecha(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS[dt.getDay()]} ${d} ${MESES[m - 1]} ${y}`;
}
export const todayYmd = () => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
  return p; // en-CA => YYYY-MM-DD
};

export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const errMsg = (e) => e?.message || 'Algo salió mal. Intenta de nuevo.';
