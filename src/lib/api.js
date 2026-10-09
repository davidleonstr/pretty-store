// Capa de datos: consume el backend de Pretty Store (Flask + PostgreSQL).
// Las funciones mantienen la misma forma de respuesta que antes, así que las páginas no cambian.
//
// Configuración:
//  - Con proxy de Vite (recomendado en desarrollo), deja VITE_API_URL vacío y proxea /api y /media.
//  - Sin proxy, define VITE_API_URL=http://localhost:5000 (el backend permite CORS desde CORS_ORIGINS).
const API = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

// Error de la API: { status, code, message, fields } (ver formato de errores del backend).
export class ApiError extends Error {
  constructor(status, body) {
    const e = body?.error ?? {};
    super(e.message || 'No pudimos conectar con el servidor');
    this.status = status; // 0 = sin conexión
    this.code = e.code || 'network_error';
    this.fields = e.fields || {};
    this.details = e;
  }
}

export async function request(path, { method = 'GET', body, params, headers, form } = {}) {
  const qs = params
    ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
    : '';
  const h = { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers };
  let res;
  try {
    res = await fetch(`${API}${path}${qs ? `?${qs}` : ''}`, {
      method,
      headers: Object.keys(h).length ? h : undefined,
      body: form ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, null);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const orNull = (promise) =>
  promise.catch((e) => {
    if (e.status === 404) return null;
    throw e;
  });

// Las imágenes subidas llegan como "/media/…": si la API está en otro origen, se completa la URL.
export const media = (src) => (src && src.startsWith('/') ? API + src : src);
const withPhotos = (x) => ({
  ...x,
  photos: (x.photos || []).map((ph) => (ph.src ? { ...ph, src: media(ph.src) } : ph)),
});
const fixBox = (b) => ({
  ...withPhotos(b),
  ...(b.contents ? { contents: b.contents.map((c) => ({ ...c, product: withPhotos(c.product) })) } : {}),
});
const fixProduct = (p) => ({ ...withPhotos(p), ...(p.inBoxes ? { inBoxes: p.inBoxes.map(withPhotos) } : {}) });

const seg = (slug) => encodeURIComponent(slug);

export async function listBoxes({ q = '', tag = '' } = {}) {
  return (await request('/api/boxes', { params: { q, tag } })).map(withPhotos);
}

// Tipos de caja para los filtros (antes BOX_TAGS).
export function listBoxTags() {
  return request('/api/boxes/tags');
}

export async function getBox(slug) {
  const box = await orNull(request(`/api/boxes/${seg(slug)}`));
  return box && fixBox(box);
}

export async function listProducts({ q = '' } = {}) {
  return (await request('/api/products', { params: { q } })).map(withPhotos);
}

export async function getProduct(slug) {
  const product = await orNull(request(`/api/products/${seg(slug)}`));
  return product && fixProduct(product);
}

export function listPickups() {
  return request('/api/pickups');
}

// Envío de la reserva. payload = { kind: 'caja' | 'productos', items, customer, pickupId, horaId, nota }.
// El servidor calcula precios y total (ignora totalCents). Devuelve { id, code, status, totalCents }.
// Errores: ApiError 422 (fields por campo), 409 out_of_stock, 429 demasiados intentos.
export function submitOrder(payload) {
  return request('/api/orders', { method: 'POST', body: payload });
}

// Gestión de una reserva: `key` puede ser el código PS-XXXXXX (lo que recibe el cliente) o el id.
export const getOrder = (id) => orNull(request(`/api/orders/${seg(id)}`));
export const updateOrder = (id, patch) => request(`/api/orders/${seg(id)}`, { method: 'PATCH', body: patch });
export const cancelOrder = (id) => request(`/api/orders/${seg(id)}/cancel`, { method: 'POST' });
