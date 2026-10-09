import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Boxes from './pages/Boxes';
import Products from './pages/Products';
import BoxDetail from './pages/BoxDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Pickups from './pages/Pickups';
import NotFound from './pages/NotFound';
import AdminApp from './admin/AdminApp';
import ManageOrder from './pages/ManageOrder';
import Terminos from './pages/legal/Terminos';
import UsoDeDatos from './pages/legal/UsoDeDatos';
import Cookies from './pages/legal/Cookies';
import Almacenamiento from './pages/legal/Almacenamiento';

/*
  Rutas (queries estilo /v/v/v/):
    /cajas  ·  /cajas/buscar/:texto
    /caja/:nombre-con-guiones
    /productos  ·  /productos/buscar/:texto
    /producto/:nombre-con-guiones
    /bolsito
    /reservar/caja/:nombre
    /reservar/productos
    /retiro
*/
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cajas" element={<Boxes />} />
        <Route path="cajas/buscar/:texto" element={<Boxes />} />
        <Route path="caja/:slug" element={<BoxDetail />} />
        <Route path="productos" element={<Products />} />
        <Route path="productos/buscar/:texto" element={<Products />} />
        <Route path="producto/:slug" element={<ProductDetail />} />
        <Route path="bolsito" element={<Cart />} />
        <Route path="reservar/caja/:slug" element={<Checkout kind="caja" />} />
        <Route path="reservar/productos" element={<Checkout kind="productos" />} />
        <Route path="retiro" element={<Pickups />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/pedido" element={<ManageOrder />} />
        <Route path="/pedido/:codigo" element={<ManageOrder />} />
        <Route path="/terminos-y-condiciones" element={<Terminos />} />
        <Route path="/politica-de-datos" element={<UsoDeDatos />} />
        <Route path="/politica-de-cookies" element={<Cookies />} />
        <Route path="/almacenamiento" element={<Almacenamiento />} />
      </Route>
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}