import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
const KEY = 'pretty-store-bolsito';

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [items]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 2800);
    return () => clearTimeout(t);
  }, [notice]);

  const total = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const say = useCallback((msg, tone = 'ok') => setNotice({ msg, tone, id: Date.now() }), []);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === product.slug);
      if (found) return prev.map((i) => (i.slug === product.slug ? { ...i, qty: i.qty + qty } : i));
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          photo: product.photos[0],
          qty,
        },
      ];
    });
    say(`${product.name} ya está en tu bolsito`);
    return true;
  };

  const setQty = (slug, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
      return;
    }
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty } : i)));
  };

  const remove = (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({ items, total, count, notice, add, setQty, remove, clear }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, notice],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);