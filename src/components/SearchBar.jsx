import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { slugify } from '@/lib/slug';

// Busca por nombre. La URL queda como /cajas/buscar/nombre-con-guiones
export function SearchBar({ base, placeholder }) {
  const { texto = '' } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(texto.replace(/-/g, ' '));

  useEffect(() => setValue(texto.replace(/-/g, ' ')), [texto]);

  const submit = (e) => {
    e.preventDefault();
    const s = slugify(value);
    navigate(s ? `${base}/buscar/${s}` : base);
  };

  return (
    <form onSubmit={submit} role="search" className="relative">
      <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field !pl-11 !pr-12"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            navigate(base);
          }}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
}
