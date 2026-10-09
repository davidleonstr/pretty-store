import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/admin/AuthContext';
import { Field, inputCls } from '@/admin/ui';

export default function Login() {
  const { status, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authed') return <Navigate to={loc.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await signIn(form.correo.trim(), form.password);
      nav(loc.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.status === 429 ? 'Demasiados intentos. Espera un minuto.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-petal-50">
      <form onSubmit={submit} className="sketch !bg-white p-6 sm:p-8 w-full max-w-sm space-y-4" noValidate>
        <div className="text-center space-y-1">
          <h1 className="h-title text-4xl text-petal-600 [text-shadow:2px_2px_0_#FFD5E0]">Pretty Store</h1>
          <p className="font-semibold">Panel de administración</p>
        </div>
        <Field label="Correo">
          <input
            className={inputCls()}
            type="email"
            autoComplete="username"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
            autoFocus
          />
        </Field>
        <Field label="Contraseña">
          <input
            className={inputCls()}
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>
        {error && (
          <p role="alert" className="text-sm font-semibold text-petal-600">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-deep w-full" disabled={busy || !form.correo || !form.password}>
          {busy ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />} Entrar
        </button>
      </form>
    </div>
  );
}
