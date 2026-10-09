import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login, logout, onSessionEnd, restoreSession } from '@/lib/adminApi';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', admin: null });

  useEffect(() => {
    let alive = true;
    restoreSession()
      .then((a) => alive && setState(a ? { status: 'authed', admin: a } : { status: 'anon', admin: null }))
      .catch(() => alive && setState({ status: 'anon', admin: null }));
    const off = onSessionEnd(() => setState({ status: 'anon', admin: null }));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn: async (correo, password) => {
        const admin = await login(correo, password);
        setState({ status: 'authed', admin });
      },
      signOut: logout,
    }),
    [state],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
