import { useRef, useState } from 'react';
import { Loader2, Pencil, Trash2, Upload } from 'lucide-react';
import { adm } from '@/lib/adminApi';
import { media } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { Badge, Card, ConfirmModal, EmptyRow, ErrorNote, Field, Modal, PageHeader, Pagination, Spinner, inputCls, useToast } from '../ui';
import { uploadImage } from '@/admin/ImagePicker';
import { errMsg } from '@/admin/utils';

const PAGE_SIZE = 24;

function AltForm({ image, onClose, onSaved }) {
  const toast = useToast();
  const [alt, setAlt] = useState(image.alt);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adm(`/api/admin/images/${image.id}`, { method: 'PATCH', body: { alt: alt.trim() } });
      toast('Texto alternativo guardado');
      onSaved();
      onClose();
    } catch (err) {
      if (err.status === 422) setError(err.fields.alt);
      else toast(errMsg(err), 'bad');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title="Texto alternativo"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="alt-form" className="btn btn-deep" disabled={busy}>
            Guardar
          </button>
        </>
      }
    >
      <img src={media(image.src)} alt="" className="w-40 h-40 object-cover rounded-xl border-[3px] border-ink mx-auto" />
      <form id="alt-form" onSubmit={submit} noValidate>
        <Field label="Descripción de la imagen" error={error} hint="Para lectores de pantalla y cuando la imagen no carga.">
          <input className={inputCls(error)} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} autoFocus />
        </Field>
      </form>
    </Modal>
  );
}

export default function Images() {
  const toast = useToast();
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const fileRef = useRef(null);
  const { loading, data, error } = useAsync(() => adm('/api/admin/images', { params: { page, pageSize: PAGE_SIZE } }), [page, reload]);
  const refresh = () => setReload((n) => n + 1);

  const onFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    let ok = 0;
    for (const f of files) {
      try {
        await uploadImage(f);
        ok += 1;
      } catch (err) {
        toast(`${f.name}: ${errMsg(err)}`, 'bad');
      }
    }
    setUploading(false);
    if (ok) {
      toast(ok === 1 ? 'Imagen subida' : `${ok} imágenes subidas`);
      setPage(1);
      refresh();
    }
  };

  const remove = async () => {
    try {
      await adm(`/api/admin/images/${del.id}`, { method: 'DELETE' });
      toast('Imagen eliminada');
      refresh();
    } catch (e) {
      toast(e.code === 'in_use' ? 'La imagen está en uso. Quítala del producto o la cajita primero.' : errMsg(e), 'bad');
      throw e;
    }
  };

  const items = data?.items ?? [];
  return (
    <>
      <PageHeader title="Imágenes" subtitle="Biblioteca de fotos para productos y cajitas.">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={onFiles} />
        <button type="button" className="btn btn-deep" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Subir imágenes
        </button>
      </PageHeader>
      <p className="text-sm opacity-80 -mt-2 mb-4">JPG, PNG, WebP o GIF · máximo 5 MB cada una. Se optimizan automáticamente.</p>

      <ErrorNote error={error} retry={refresh} />
      {loading && !data ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card>
          <EmptyRow>Aún no has subido imágenes.</EmptyRow>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((img) => {
            const uses = img.usedBy.products + img.usedBy.boxes;
            return (
              <li key={img.id} className="sketch !p-2 space-y-2">
                <img src={media(img.src)} alt={img.alt} loading="lazy" className="w-full aspect-square object-cover rounded-lg bg-petal-100" />
                <p className="text-xs truncate" title={img.alt}>
                  {img.alt || <span className="opacity-60">Sin texto alternativo</span>}
                </p>
                <div className="flex items-center justify-between">
                  {uses > 0 ? <Badge tone="info">En uso ({uses})</Badge> : <Badge>Sin usar</Badge>}
                  <span className="flex">
                    <button type="button" aria-label="Editar texto alternativo" className="p-1" onClick={() => setEdit(img)}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" aria-label="Eliminar imagen" className="p-1 text-red-700 disabled:opacity-30" disabled={uses > 0} title={uses > 0 ? 'Está en uso' : ''} onClick={() => setDel(img)}>
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />}

      {edit && <AltForm image={edit} onClose={() => setEdit(null)} onSaved={refresh} />}
      {del && <ConfirmModal title="Eliminar imagen" danger confirmLabel="Eliminar" text="¿Eliminar esta imagen de la biblioteca? Se borra el archivo." onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
