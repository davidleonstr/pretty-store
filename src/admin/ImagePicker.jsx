import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { media } from '@/lib/api';
import { adm } from '@/lib/adminApi';
import { useAsync } from '@/lib/useAsync';
import { ErrorNote, Modal, Spinner, useToast } from './ui';
import { errMsg } from './utils';

// Sube un archivo a la biblioteca. Devuelve la imagen { id, src, alt, … }.
export async function uploadImage(file, alt = '') {
  const form = new FormData();
  form.append('file', file);
  if (alt) form.append('alt', alt);
  return adm('/api/admin/images', { method: 'POST', form });
}

const Thumb = ({ img, className = '' }) => (
  <img src={media(img.src)} alt={img.alt || ''} className={`object-cover bg-petal-100 ${className}`} loading="lazy" />
);

function Library({ selectedIds, onAdd, onClose }) {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [picked, setPicked] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { loading, data, error } = useAsync(() => adm('/api/admin/images', { params: { pageSize: 100 } }), [reload]);

  const toggle = (img) => setPicked((p) => (p.some((x) => x.id === img.id) ? p.filter((x) => x.id !== img.id) : [...p, img]));

  const onFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    const done = [];
    for (const f of files) {
      try {
        done.push(await uploadImage(f));
      } catch (err) {
        toast(`${f.name}: ${errMsg(err)}`, 'bad');
      }
    }
    setUploading(false);
    if (done.length) {
      setPicked((p) => [...p, ...done]);
      setReload((n) => n + 1);
    }
  };

  const items = data?.items ?? [];
  return (
    <Modal
      title="Biblioteca de imágenes"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-deep" disabled={!picked.length} onClick={() => { onAdd(picked); onClose(); }}>
            Agregar {picked.length ? `(${picked.length})` : ''}
          </button>
        </>
      }
    >
      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={onFiles} />
        <button type="button" className="btn btn-sm btn-white" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Subir nuevas
        </button>
        <span className="text-xs opacity-70 ml-2">JPG, PNG, WebP o GIF · máx. 5 MB</span>
      </div>
      <ErrorNote error={error} retry={() => setReload((n) => n + 1)} />
      {loading && !data ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="text-center py-6 opacity-80">Aún no hay imágenes. ¡Sube la primera!</p>
      ) : (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {items.map((img) => {
            const already = selectedIds.includes(img.id);
            const on = picked.some((x) => x.id === img.id);
            return (
              <li key={img.id}>
                <button
                  type="button"
                  disabled={already}
                  onClick={() => toggle(img)}
                  aria-pressed={on}
                  title={already ? 'Ya está agregada' : img.alt || 'Imagen'}
                  className={`block w-full aspect-square rounded-xl overflow-hidden border-[3px] ${on ? 'border-petal-600 ring-4 ring-petal-400' : 'border-ink'} ${already ? 'opacity-40' : ''}`}
                >
                  <Thumb img={img} className="w-full h-full" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

// value: [{ id, src, alt }] en orden (la primera es la foto principal). onChange(nuevaLista)
export function ImagePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {value.length === 0 ? (
        <p className="text-sm opacity-70">Sin imágenes: se mostrará el emoji.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {value.map((img, i) => (
            <li key={img.id} className="relative w-24">
              <Thumb img={img} className="w-24 h-24 rounded-xl border-[3px] border-ink" />
              {i === 0 && <span className="absolute left-1 top-1 text-[10px] font-bold bg-petal-300 border-2 border-ink rounded px-1">Principal</span>}
              <div className="flex justify-between mt-1">
                <button type="button" aria-label="Mover antes" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 disabled:opacity-30">
                  <ArrowUp size={16} className="-rotate-90" />
                </button>
                <button type="button" aria-label="Quitar" onClick={() => onChange(value.filter((x) => x.id !== img.id))} className="p-1 text-red-700">
                  <X size={16} />
                </button>
                <button type="button" aria-label="Mover después" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="p-1 disabled:opacity-30">
                  <ArrowDown size={16} className="-rotate-90" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-sm btn-white" onClick={() => setOpen(true)}>
        <ImagePlus size={16} /> Agregar imágenes
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-petal-600">{error}</p>}
      {open && <Library selectedIds={value.map((v) => v.id)} onAdd={(list) => onChange([...value, ...list])} onClose={() => setOpen(false)} />}
    </div>
  );
}
