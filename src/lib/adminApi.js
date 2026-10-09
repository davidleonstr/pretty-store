// Sesión y llamadas autenticadas del panel. El token de acceso vive en memoria;
// el de renovación en localStorage (para seguir conectado al recargar).
import { request } from './api';

const RT = 'ps_admin_refresh';
let access = null;
let refreshing = null;
const listeners = new Set();

const store = {
  get() {
    try {
      return localStorage.getItem(RT);
    } catch {
      return null;
    }
  },
  set(v) {
    try {
      if (v) localStorage.setItem(RT, v);
      else localStorage.removeItem(RT);
    } catch {
      /* sin almacenamiento: la sesión dura hasta recargar */
    }
  },
};

export const onSessionEnd = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function logout() {
  access = null;
  store.set(null);
  listeners.forEach((f) => f());
}

export async function login(correo, password) {
  const r = await request('/api/admin/login', { method: 'POST', body: { correo, password } });
  access = r.accessToken;
  store.set(r.refreshToken);
  return r.admin;
}

function refresh() {
  const rt = store.get();
  if (!rt) return Promise.resolve(false);
  refreshing ??= request('/api/admin/refresh', { method: 'POST', headers: { Authorization: `Bearer ${rt}` } })
    .then((r) => {
      access = r.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// Recupera la sesión al abrir el panel. Devuelve el admin o null.
export async function restoreSession() {
  if (!(await refresh())) return null;
  return adm('/api/admin/me');
}

// Llamada autenticada; si el token venció lo renueva una vez y reintenta.
export async function adm(path, opts = {}) {
  const send = () =>
    request(path, { ...opts, headers: { ...opts.headers, ...(access ? { Authorization: `Bearer ${access}` } : {}) } });
  try {
    return await send();
  } catch (e) {
    if (e.status !== 401) throw e;
    if (await refresh()) {
      try {
        return await send();
      } catch (e2) {
        if (e2.status === 401) logout();
        throw e2;
      }
    }
    logout();
    throw e;
  }
}
