import { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  Boxes as BoxesIcon,
  Clock,
  ClipboardList,
  Gift,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Shapes,
  ShieldCheck,
  UserCog,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { Spinner, ToastProvider } from './ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import AdminBoxes from './pages/Boxes';
import Categorias from './pages/Categorias';
import Pickups from './pages/Pickups';
import Horas from './pages/Horas';
import ImagesPage from './pages/Images';
import Admins from './pages/Admins';
import Account from './pages/Account';

const NAV = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/productos', label: 'Productos', icon: Gift },
  { to: '/admin/cajitas', label: 'Cajitas', icon: BoxesIcon },
  { to: '/admin/categorias', label: 'Categorías', icon: Shapes },
  { to: '/admin/retiros', label: 'Puntos de retiro', icon: MapPin },
  { to: '/admin/horas', label: 'Horas', icon: Clock },
  { to: '/admin/imagenes', label: 'Imágenes', icon: Images },
  { to: '/admin/administradores', label: 'Administradores', icon: ShieldCheck },
  { to: '/admin/cuenta', label: 'Mi cuenta', icon: UserCog },
];

function Shell({ children }) {
  const { admin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const links = (
    <nav aria-label="Panel de administración" className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold border-2 ${isActive ? 'bg-petal-300 border-ink' : 'border-transparent hover:bg-petal-200'}`
          }
        >
          <Icon size={18} /> {label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <div className="min-h-screen bg-petal-50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:flex flex-col gap-4 p-4 border-r-[3px] border-ink bg-white sticky top-0 h-screen overflow-y-auto">
        <Link to="/admin" className="h-title text-2xl text-petal-600">
          Pretty Store <span className="block text-sm text-ink">Administración</span>
        </Link>
        {links}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-ink/30 text-sm space-y-2">
          <p className="truncate font-semibold">{admin?.nombre}</p>
          <p className="truncate opacity-70">{admin?.correo}</p>
          <button type="button" onClick={signOut} className="btn btn-sm btn-white w-full">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <div className="lg:hidden flex items-center justify-between p-3 border-b-[3px] border-ink bg-white sticky top-0 z-40">
        <Link to="/admin" className="h-title text-xl text-petal-600">
          Pretty Store · Admin
        </Link>
        <button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="p-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden p-3 bg-white border-b-[3px] border-ink space-y-3">
          {links}
          <button type="button" onClick={signOut} className="btn btn-sm btn-white w-full">
            <LogOut size={16} /> Salir ({admin?.nombre})
          </button>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
    </div>
  );
}

function Protected({ children }) {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <Spinner />;
  if (status === 'anon') return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return <Shell>{children}</Shell>;
}

// Monta TODO el panel con una sola ruta:  <Route path="/admin/*" element={<AdminApp />} />
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="" element={<Protected><Dashboard /></Protected>} />
          <Route path="pedidos" element={<Protected><Orders /></Protected>} />
          <Route path="productos" element={<Protected><Products /></Protected>} />
          <Route path="cajitas" element={<Protected><AdminBoxes /></Protected>} />
          <Route path="categorias" element={<Protected><Categorias /></Protected>} />
          <Route path="retiros" element={<Protected><Pickups /></Protected>} />
          <Route path="horas" element={<Protected><Horas /></Protected>} />
          <Route path="imagenes" element={<Protected><ImagesPage /></Protected>} />
          <Route path="administradores" element={<Protected><Admins /></Protected>} />
          <Route path="cuenta" element={<Protected><Account /></Protected>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
