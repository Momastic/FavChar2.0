import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Star, ArrowUpDown, X, Pencil, Trash2, ImagePlus, ChevronLeft, GripVertical } from 'lucide-react';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
let idCounter = 1000;
const genId = (prefix) => `${prefix}_${idCounter++}_${Math.random().toString(36).slice(2, 7)}`;
const STORAGE_KEY = 'favchar-state';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ? w[0].toUpperCase() : '').join('');

// Redimensiona y comprime la imagen antes de guardarla
const fileToDataUrl = (file, maxDim = 700, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AVATAR_PALETTE = ['#3C6E5D', '#B98B3E', '#5B6E8C', '#9C4A3A', '#6E5B3C', '#3C5E6E'];
const avatarColor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------
const seedLists = [{ id: 'list_bluelock', name: 'Blue Lock' }];
const seedGroups = [
  { id: 'grp_japon', listId: 'list_bluelock', name: 'Equipo Japonés' },
  { id: 'grp_munchen', listId: 'list_bluelock', name: 'Bastard München' },
];
const seedCharacters = [
  {
    id: 'c1', listId: 'list_bluelock', groupId: 'grp_japon',
    name: 'Yoichi Isagi',
    description: 'Delantero que piensa el campo como un tablero: siempre busca el espacio que nadie más ve.',
    height: '177 cm', weight: '64 kg',
    nicknames: ['El Devorador de Campo'],
    styles: ['Uniforme de entrenamiento del equipo Japón U-20', 'Chaqueta azul de la selección'],
    profileImage: null, styleImages: [], favorite: false,
    entryOrder: 1, manualOrder: 1, createdAt: Date.now() - 5000,
  },
  {
    id: 'c2', listId: 'list_bluelock', groupId: 'grp_japon',
    name: 'Shoei Barou',
    description: 'Delantero de fuerza física dominante; juega para imponerse como único protagonista del ataque.',
    height: '190 cm', weight: '85 kg',
    nicknames: ['El Rey'],
    styles: ['Uniforme suelto de entrenamiento', 'Chamarra de cuero personal'],
    profileImage: null, styleImages: [], favorite: false,
    entryOrder: 2, manualOrder: 2, createdAt: Date.now() - 4000,
  },
  {
    id: 'c3', listId: 'list_bluelock', groupId: 'grp_japon',
    name: 'Ryusei Shidou',
    description: 'Extremo de gran velocidad, conocido por su estilo de juego instintivo y errático.',
    height: '181 cm', weight: '70 kg',
    nicknames: ['El Genio Loco'],
    styles: ['Uniforme de la selección U-20', 'Ropa urbana extravagante'],
    profileImage: null, styleImages: [], favorite: false,
    entryOrder: 3, manualOrder: 3, createdAt: Date.now() - 3000,
  },
  {
    id: 'c4', listId: 'list_bluelock', groupId: 'grp_japon',
    name: 'Rensuke Karasu',
    description: 'Delantero técnico especializado en jugadas de un toque y pases milimétricos.',
    height: '178 cm', weight: '64 kg',
    nicknames: [],
    styles: ['Uniforme de entrenamiento'],
    profileImage: null, styleImages: [], favorite: false,
    entryOrder: 4, manualOrder: 4, createdAt: Date.now() - 2000,
  },
  {
    id: 'c5', listId: 'list_bluelock', groupId: 'grp_munchen',
    name: 'Michael Kaiser',
    description: 'Delantero estrella de fama mundial, conocido por su carisma y su disparo característico.',
    height: '188 cm', weight: '81 kg',
    nicknames: ['El Emperador'],
    styles: ['Uniforme titular del Bastard München', 'Vestimenta de gala para entrevistas'],
    profileImage: null, styleImages: [], favorite: false,
    entryOrder: 5, manualOrder: 1, createdAt: Date.now() - 1000,
  },
];

// ---------------------------------------------------------------------------
// Estilos globales
// ---------------------------------------------------------------------------
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; }

.fc-root { background:#E8E1D0; min-height:100vh; color:#20283A; font-family:'IBM Plex Sans', sans-serif; }
.fc-serif { font-family:'Fraunces', serif; }
.fc-tiny { font-family:'IBM Plex Mono', monospace; font-size:0.65rem; letter-spacing:0.04em; }
.fc-label { font-family:'IBM Plex Mono', monospace; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.06em; color:rgba(32,40,58,0.5); display:block; margin-bottom:0.3rem; }

.text-ink-70 { color:rgba(32,40,58,0.7); }
.text-ink-45 { color:rgba(32,40,58,0.45); }
.text-accent-green { color:#3C6E5D; }

.fc-input { font-family:'IBM Plex Sans', sans-serif; font-size:0.875rem; background:#FAF6EC; border:1px solid rgba(32,40,58,0.2); border-radius:2px; padding:0.55rem 0.75rem; color:#20283A; width:100%; }
.fc-input:focus { outline:none; border-color:#3C6E5D; box-shadow:0 0 0 2px rgba(60,110,93,0.2); }

.fc-topbar { display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1.5rem; border-bottom:1px solid rgba(32,40,58,0.12); background:#E8E1D0; position:sticky; top:0; z-index:30; }

.fc-overlay { position:fixed; inset:0; background:rgba(32,40,58,0.55); display:flex; align-items:center; justify-content:center; padding:1rem; z-index:50; }
.fc-modal-card { background:#F5F0E3; border:1px solid rgba(32,40,58,0.15); border-radius:2px; box-shadow:0 20px 50px rgba(0,0,0,0.3); width:100%; max-height:90vh; overflow-y:auto; }

.fc-card { background:#FAF6EC; border:1px solid rgba(32,40,58,0.15); border-radius:2px; transition: transform .15s, box-shadow .15s; }
.fc-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(32,40,58,0.12); }

.fc-folder { background:#FAF6EC; border:1px solid rgba(32,40,58,0.15); border-top:6px solid #3C6E5D; border-radius:2px; transition: transform .15s, box-shadow .15s; position:relative; }
.fc-folder:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(32,40,58,0.15); }
.fc-folder.is-fav { border-top-color:#B98B3E; }

.fc-folder-new { background:transparent; border:1.5px dashed rgba(32,40,58,0.25); border-radius:2px; color:rgba(32,40,58,0.5); cursor:pointer; transition: border-color .15s, color .15s, background-color .15s; min-height:96px; }
.fc-folder-new:hover { border-color:#3C6E5D; color:#3C6E5D; background: rgba(60,110,93,0.05); }

.fc-group-header { display:flex; align-items:center; gap:0.6rem; margin: 1.75rem 0 0.9rem; }
.fc-group-header .line { flex:1; height:1px; background:rgba(32,40,58,0.15); }
.fc-group-label { font-family:'IBM Plex Mono', monospace; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:#3C6E5D; background:#E8E1D0; padding:0.2rem 0.6rem; border:1px solid rgba(60,110,93,0.3); border-radius:2px; white-space:nowrap; }

.fc-star { width:1.7rem; height:1.7rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; background: rgba(32,40,58,0.3); border:2px solid #FAF6EC; box-shadow:0 1px 3px rgba(0,0,0,0.15); transition: background-color .15s, transform .15s; cursor:pointer; }
.fc-star:hover { transform: scale(1.1); }
.fc-star.is-fav { background:#B98B3E; }

.btn { font-family:'IBM Plex Mono', monospace; font-size:0.72rem; font-weight:500; letter-spacing:0.02em; border-radius:2px; padding:0.5rem 0.85rem; display:inline-flex; align-items:center; gap:0.4rem; transition: background-color .15s, color .15s, border-color .15s, opacity .15s; cursor:pointer; white-space:nowrap; }
.btn:disabled { opacity:0.4; cursor:not-allowed; }
.btn-primary { background:#3C6E5D; color:#FAF6EC; border:1px solid #3C6E5D; }
.btn-primary:hover:not(:disabled) { background:#2F5A4C; }
.btn-ghost { background:transparent; color:#20283A; border:1px solid rgba(32,40,58,0.2); }
.btn-ghost:hover:not(:disabled) { background:rgba(32,40,58,0.06); }
.btn-danger-solid { background:#9C4A3A; color:#FAF6EC; border:1px solid #9C4A3A; }
.btn-danger-solid:hover:not(:disabled) { background:#823D30; }

.btn-icon { display:inline-flex; align-items:center; justify-content:center; width:1.8rem; height:1.8rem; border-radius:2px; color:rgba(32,40,58,0.45); background:transparent; border:none; cursor:pointer; transition: background-color .15s, color .15s; flex-shrink:0; }
.btn-icon:hover { background: rgba(32,40,58,0.08); color:#20283A; }
.btn-icon.danger:hover { background: rgba(156,74,58,0.1); color:#9C4A3A; }

.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.w-full { width: 100%; }
.min-w-0 { min-width: 0; }
.shrink-0 { flex-shrink: 0; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.col-span-2 { grid-column: span 2; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.max-w-5xl { max-width: 64rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }

@media (min-width: 640px) {
  .sm\\:flex-row { flex-direction: row; }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sm\\:w-36 { width: 9rem; }
}
@media (min-width: 768px) {
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .fc-root *, .fc-root *::before, .fc-root *::after { transition:none !important; animation:none !important; }
}
`;

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function Avatar({ name, image, size = 'md' }) {
  const dims = { sm: '2.5rem', md: '4rem', lg: '8rem', xl: '11rem' };
  const fontSizes = { sm: '0.7rem', md: '1rem', lg: '1.75rem', xl: '2.25rem' };
  const dim = dims[size] || dims.md;
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: dim, height: dim, objectFit: 'cover', borderRadius: '2px', border: '2px solid rgba(32,40,58,0.1)', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: dim, height: dim, borderRadius: '2px', backgroundColor: avatarColor(name),
        color: '#FAF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: fontSizes[size] || fontSizes.md, fontFamily: "'IBM Plex Sans', sans-serif",
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal genérico
// ---------------------------------------------------------------------------
function ModalShell({ title, onClose, children, wide }) {
  return (
    <div className="fc-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="fc-modal-card" style={{ maxWidth: wide ? '42rem' : '28rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(32,40,58,0.1)' }}>
          <h3 className="fc-serif font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="btn-icon" title="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.25rem' }}>{children}</div>
      </div>
    </div>
  );
}

function InfoField({ label, value, block }) {
  return (
    <div style={block ? { gridColumn: 'span 2' } : {}}>
      <p className="fc-label" style={{ marginBottom: '0.15rem' }}>{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function SimplePromptModal({ title, label, placeholder, initialValue = '', confirmLabel = 'Crear', onSubmit, onClose }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) { setError('Este campo es obligatorio.'); return; }
    onSubmit(value.trim());
    onClose();
  }
  return (
    <ModalShell title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="fc-label">{label}</label>
        <input
          autoFocus
          className="fc-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
        />
        {error && <p className="fc-tiny" style={{ color: '#9C4A3A', marginTop: '0.4rem' }}>{error}</p>}
        <div className="flex justify-end gap-2" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{confirmLabel}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmModal({ title, message, confirmLabel = 'Eliminar', onConfirm, onClose }) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="text-sm text-ink-70" style={{ marginBottom: '1.25rem', lineHeight: 1.5 }}>{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-danger-solid" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Formulario de personaje
// ---------------------------------------------------------------------------
function CharacterFormModal({ title, initial, groups, fixedGroupId, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [groupId, setGroupId] = useState(initial?.groupId || fixedGroupId || (groups[0] ? groups[0].id : ''));
  const [description, setDescription] = useState(initial?.description || '');
  const [height, setHeight] = useState(initial?.height || '');
  const [weight, setWeight] = useState(initial?.weight || '');
  const [nicknames, setNicknames] = useState((initial?.nicknames || []).join(', '));
  const [styles, setStyles] = useState((initial?.styles || []).join('\n'));
  const [profileImage, setProfileImage] = useState(initial?.profileImage || null);
  const [styleImages, setStyleImages] = useState(initial?.styleImages || []);
  const [error, setError] = useState('');

  const fixedGroup = fixedGroupId ? groups.find((g) => g.id === fixedGroupId) : null;

  async function handleProfileFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setProfileImage(dataUrl);
  }
  async function handleStyleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const urls = await Promise.all(files.map(fileToDataUrl));
    setStyleImages((prev) => [...prev, ...urls]);
    e.target.value = '';
  }
  function removeStyleImage(idx) {
    setStyleImages((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!fixedGroupId && !groupId) { setError('Debes elegir un grupo.'); return; }
    onSave({
      name: name.trim(),
      groupId: fixedGroupId || groupId,
      description: description.trim(),
      height: height.trim(),
      weight: weight.trim(),
      nicknames: nicknames.split(',').map((s) => s.trim()).filter(Boolean),
      styles: styles.split('\n').map((s) => s.trim()).filter(Boolean),
      profileImage,
      styleImages,
    });
  }

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-5">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '176px', flexShrink: 0 }}>
            <Avatar name={name || '?'} image={profileImage} size="lg" />
            <label className="btn btn-ghost" style={{ fontSize: '0.68rem', cursor: 'pointer' }}>
              <ImagePlus size={13} /> Foto de perfil
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileFile} style={{ display: 'none' }} />
            </label>
            {profileImage && (
              <button type="button" className="fc-tiny" style={{ color: '#9C4A3A', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setProfileImage(null)}>
                Quitar foto
              </button>
            )}
          </div>

          <div className="flex-1" style={{ minWidth: '0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="fc-label">Nombre *</label>
              <input className="fc-input" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Ej: Yoichi Isagi" />
            </div>

            {fixedGroup ? (
              <p className="fc-tiny text-ink-45">Se agregará al grupo: <strong className="text-accent-green">{fixedGroup.name}</strong></p>
            ) : (
              <div>
                <label className="fc-label">Grupo *</label>
                <select className="fc-input" value={groupId} onChange={(e) => { setGroupId(e.target.value); setError(''); }}>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="fc-label">Descripción</label>
              <textarea className="fc-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del personaje" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="fc-label">Estatura</label>
                <input className="fc-input" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ej: 177 cm" />
              </div>
              <div>
                <label className="fc-label">Peso</label>
                <input className="fc-input" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ej: 64 kg" />
              </div>
            </div>

            <div>
              <label className="fc-label">Apodos (separados por coma)</label>
              <input className="fc-input" value={nicknames} onChange={(e) => setNicknames(e.target.value)} placeholder="Ej: El Rey, El Emperador" />
            </div>

            <div>
              <label className="fc-label">Estilos / prendas (una por línea)</label>
              <textarea className="fc-input" rows={2} value={styles} onChange={(e) => setStyles(e.target.value)} placeholder={'Ej: Uniforme titular\nChaqueta de entrenamiento'} />
            </div>

            <div>
              <label className="fc-label">Galería de estilos</label>
              <label className="btn btn-ghost" style={{ fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex' }}>
                <ImagePlus size={13} /> Agregar imágenes
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleStyleFiles} style={{ display: 'none' }} />
              </label>
              {styleImages.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginTop: '0.5rem' }}>
                  {styleImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(32,40,58,0.15)' }} />
                      <button
                        type="button"
                        onClick={() => removeStyleImage(i)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '1.1rem', height: '1.1rem', borderRadius: '9999px', background: '#9C4A3A', color: '#FAF6EC', border: 'none', cursor: 'pointer', fontSize: '0.6rem', lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="fc-tiny" style={{ color: '#9C4A3A', marginTop: '0.75rem' }}>{error}</p>}

        <div className="flex justify-end gap-2" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(32,40,58,0.1)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Ficha de personaje
// ---------------------------------------------------------------------------
function CharacterDetailModal({ character, listName, groupName, onClose, onEdit, onDelete, onToggleFavorite }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <ModalShell title="Ficha del personaje" onClose={onClose} wide>
      <div className="flex flex-wrap gap-5">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '176px', flexShrink: 0 }}>
          <Avatar name={character.name} image={character.profileImage} size="xl" />
          <button
            onClick={onToggleFavorite}
            className="btn"
            style={character.favorite
              ? { background: '#B98B3E', color: '#FAF6EC', border: '1px solid #B98B3E' }
              : { background: 'transparent', color: 'rgba(32,40,58,0.7)', border: '1px solid rgba(32,40,58,0.2)' }}
          >
            <Star size={13} fill={character.favorite ? '#FAF6EC' : 'none'} />
            {character.favorite ? 'En favoritos' : 'Marcar favorito'}
          </button>
          <p className="fc-tiny text-ink-45" style={{ textAlign: 'center' }}>
            N.º {String(character.entryOrder).padStart(3, '0')}{listName ? ` · ${listName}` : ''}{groupName ? ` · ${groupName}` : ''}
          </p>
        </div>

        <div className="flex-1" style={{ minWidth: '0' }}>
          <h2 className="fc-serif font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{character.name}</h2>
          {character.description && <p className="text-sm text-ink-70" style={{ marginBottom: '0.9rem', lineHeight: 1.5 }}>{character.description}</p>}

          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '0.75rem' }}>
            <InfoField label="Estatura" value={character.height || '—'} />
            <InfoField label="Peso" value={character.weight || '—'} />
          </div>

          {character.nicknames && character.nicknames.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <InfoField label="Apodos" value={character.nicknames.join(' · ')} block />
            </div>
          )}

          {character.styles && character.styles.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p className="fc-label" style={{ marginBottom: '0.3rem' }}>Estilos / prendas</p>
              <ul className="text-sm text-ink-70" style={{ paddingLeft: '1.1rem', lineHeight: 1.5 }}>
                {character.styles.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {character.styleImages && character.styleImages.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <p className="fc-label" style={{ marginBottom: '0.4rem' }}>Galería de estilos</p>
              <div className="flex flex-wrap gap-2">
                {character.styleImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setLightbox(img)}
                    style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(32,40,58,0.15)', cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(32,40,58,0.1)' }}>
            <button onClick={onEdit} className="btn btn-primary"><Pencil size={13} /> Editar</button>
            <button onClick={onDelete} className="btn" style={{ background: 'transparent', color: '#9C4A3A', border: '1px solid rgba(156,74,58,0.4)' }}>
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 60 }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" style={{ maxHeight: '85vh', maxWidth: '100%', borderRadius: '2px' }} />
        </div>
      )}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de personaje
// ---------------------------------------------------------------------------
function CharacterCard({ character, draggable, dragging, onDragStart, onDragOver, onDrop, onClick, onToggleFavorite }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className="fc-card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', cursor: 'pointer', opacity: dragging ? 0.4 : 1, position: 'relative' }}
    >
      {draggable && <GripVertical size={13} style={{ position: 'absolute', top: '0.4rem', left: '0.4rem', color: 'rgba(32,40,58,0.35)' }} />}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        title={character.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        className={`fc-star ${character.favorite ? 'is-fav' : ''}`}
        style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem' }}
      >
        <Star size={13} color="#FAF6EC" fill={character.favorite ? '#FAF6EC' : 'none'} />
      </button>
      <Avatar name={character.name} image={character.profileImage} size="md" />
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p className="fc-serif font-semibold text-sm truncate" style={{ lineHeight: 1.2 }} title={character.name}>{character.name}</p>
        <p className="fc-tiny text-ink-45" style={{ marginTop: '0.15rem' }}>N.º {String(character.entryOrder).padStart(3, '0')}</p>
        {character.listName && <p className="fc-tiny text-accent-green truncate" style={{ marginTop: '0.1rem' }}>{character.listName}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sección de grupo
// ---------------------------------------------------------------------------
function GroupSection({ group, charsAll, search, mode, draggedId, setDraggedId, reorderManual, onOpenCharacter, onToggleFavorite, onRenameGroup, onDeleteGroup, onAddCharacterToGroup }) {
  const searchActive = search.trim().length > 0;
  let chars = charsAll;
  if (searchActive) {
    const q = search.trim().toLowerCase();
    chars = chars.filter((c) => c.name.toLowerCase().includes(q));
  }
  if (searchActive && chars.length === 0) return null;

  const sorted = [...chars];
  if (mode === 'alpha') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else if (mode === 'manual') sorted.sort((a, b) => a.manualOrder - b.manualOrder);
  else sorted.sort((a, b) => a.entryOrder - b.entryOrder);

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div className="fc-group-header">
        <span className="fc-group-label">{group.name}</span>
        <div className="line" />
        <span className="fc-tiny text-ink-45">{charsAll.length} {charsAll.length === 1 ? 'personaje' : 'personajes'}</span>
        <button className="btn-icon" title="Agregar personaje a este grupo" onClick={onAddCharacterToGroup}><Plus size={13} /></button>
        <button className="btn-icon" title="Renombrar grupo" onClick={() => onRenameGroup(group)}><Pencil size={13} /></button>
        <button className="btn-icon danger" title="Eliminar grupo" onClick={() => onDeleteGroup(group)}><Trash2 size={13} /></button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-45" style={{ fontStyle: 'italic', padding: '0.5rem 0.2rem' }}>Aún no hay personajes en este grupo.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          {sorted.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              draggable={mode === 'manual'}
              dragging={draggedId === c.id}
              onDragStart={() => setDraggedId(c.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (draggedId && draggedId !== c.id) reorderManual(group.id, draggedId, c.id); setDraggedId(null); }}
              onClick={() => onOpenCharacter(c)}
              onToggleFavorite={() => onToggleFavorite(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de archivo (Home)
// ---------------------------------------------------------------------------
function FolderCard({ title, isFav, groupCount, charCount, onClick, onDelete, deletable }) {
  return (
    <div onClick={onClick} className={`fc-folder p-4 cursor-pointer ${isFav ? 'is-fav' : ''}`} style={{ position: 'relative' }}>
      {deletable && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar archivo"
          className="btn-icon danger"
          style={{ position: 'absolute', top: '0.4rem', right: '0.4rem' }}
        >
          <Trash2 size={14} />
        </button>
      )}
      <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
        {isFav && <Star size={15} color="#B98B3E" fill="#B98B3E" />}
        <h3 className="fc-serif font-semibold text-base truncate">{title}</h3>
      </div>
      <p className="fc-tiny text-ink-45">
        {isFav
          ? `${charCount} ${charCount === 1 ? 'personaje favorito' : 'personajes favoritos'}`
          : `${groupCount} ${groupCount === 1 ? 'grupo' : 'grupos'} · ${charCount} ${charCount === 1 ? 'personaje' : 'personajes'}`}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista de inicio
// ---------------------------------------------------------------------------
function HomeView({ lists, characters, groups, favoritesExist, onOpenList, onAddList, onDeleteList }) {
  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <p className="text-ink-70" style={{ marginBottom: '1.5rem' }}>Organiza tus personajes favoritos por archivo, grupo y estilo.</p>

      {lists.length === 0 && !favoritesExist ? (
        <div className="fc-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-ink-70" style={{ marginBottom: '1rem' }}>Aún no tienes archivos. Crea el primero para empezar tu colección.</p>
          <button className="btn btn-primary" onClick={onAddList}><Plus size={14} /> Crear archivo</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {favoritesExist && (
            <FolderCard title="Favoritos" isFav charCount={characters.filter((c) => c.favorite).length} onClick={() => onOpenList('fav')} />
          )}
          {lists.map((l) => (
            <FolderCard
              key={l.id}
              title={l.name}
              groupCount={groups.filter((g) => g.listId === l.id).length}
              charCount={characters.filter((c) => c.listId === l.id).length}
              onClick={() => onOpenList(l.id)}
              deletable
              onDelete={() => onDeleteList(l)}
            />
          ))}
          <button onClick={onAddList} className="fc-folder-new flex items-center justify-center gap-1.5 p-4" style={{ display: 'flex', flexDirection: 'column' }}>
            <Plus size={18} />
            <span className="fc-tiny">Nuevo archivo</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista de detalle de un archivo (lista)
// ---------------------------------------------------------------------------
function ListDetailView({
  listId, isFavorites, listName, groups, characters, lists,
  search, setSearch, sortMode, setSortModeFor,
  onBack, onAddGroup, onAddCharacter, onOpenCharacter, onToggleFavorite,
  onRenameGroup, onDeleteGroup, onRenameList, onDeleteList,
  draggedId, setDraggedId, reorderManual,
}) {
  const mode = sortMode[listId] || 'entry';
  const listGroups = isFavorites ? [] : groups.filter((g) => g.listId === listId);
  const hasGroups = listGroups.length > 0;

  let favChars = [];
  if (isFavorites) {
    const q = search.trim().toLowerCase();
    favChars = characters.filter((c) => c.favorite && (!q || c.name.toLowerCase().includes(q)));
    if (mode === 'alpha') favChars.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else favChars.sort((a, b) => a.createdAt - b.createdAt);
    const listNameById = Object.fromEntries(lists.map((l) => [l.id, l.name]));
    favChars = favChars.map((c) => ({ ...c, listName: listNameById[c.listId] }));
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      <div className="flex items-center gap-1" style={{ marginBottom: '0.2rem' }}>
        <button onClick={onBack} className="btn-icon" title="Volver"><ChevronLeft size={18} /></button>
        <h2 className="fc-serif font-bold" style={{ fontSize: '1.5rem' }}>{listName}</h2>
        {!isFavorites && (
          <>
            <button className="btn-icon" title="Renombrar archivo" onClick={onRenameList}><Pencil size={14} /></button>
            <button className="btn-icon danger" title="Eliminar archivo" onClick={onDeleteList}><Trash2 size={14} /></button>
          </>
        )}
      </div>
      <p className="fc-tiny text-ink-45" style={{ marginBottom: '1.25rem', marginLeft: '2.4rem' }}>
        {isFavorites
          ? `${favChars.length} ${favChars.length === 1 ? 'personaje favorito' : 'personajes favoritos'}`
          : `${listGroups.length} ${listGroups.length === 1 ? 'grupo' : 'grupos'} · ${characters.filter((c) => c.listId === listId).length} personajes`}
      </p>

      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '1.5rem' }}>
        <div className="relative" style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(32,40,58,0.4)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar personaje..."
            className="fc-input"
            style={{ paddingLeft: '2rem' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(32,40,58,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-ink-45" />
          <select className="fc-input" style={{ width: 'auto' }} value={mode} onChange={(e) => setSortModeFor(listId, e.target.value)}>
            <option value="entry">Orden de ingreso</option>
            <option value="alpha">Alfabético</option>
            {!isFavorites && <option value="manual">Manual</option>}
          </select>
        </div>

        {!isFavorites && (
          <>
            <button className="btn btn-ghost" onClick={onAddGroup}><Plus size={14} /> Grupo</button>
            <button
              className="btn btn-primary"
              disabled={!hasGroups}
              title={hasGroups ? '' : 'Crea un grupo primero'}
              onClick={() => onAddCharacter(null)}
            >
              <Plus size={14} /> Personaje
            </button>
          </>
        )}
      </div>

      {mode === 'manual' && !isFavorites && (
        <p className="fc-tiny text-ink-45" style={{ marginBottom: '0.75rem', fontStyle: 'italic' }}>Arrastra las tarjetas para reordenarlas dentro de cada grupo.</p>
      )}

      {isFavorites ? (
        favChars.length === 0 ? (
          <div className="fc-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="text-ink-70">
              {characters.some((c) => c.favorite) ? 'Ningún personaje coincide con tu búsqueda.' : 'Aún no tienes personajes favoritos. Marca alguno con la estrella desde sus archivos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {favChars.map((c) => (
              <CharacterCard key={c.id} character={c} onClick={() => onOpenCharacter(c)} onToggleFavorite={() => onToggleFavorite(c.id)} />
            ))}
          </div>
        )
      ) : !hasGroups ? (
        <div className="fc-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-ink-70" style={{ marginBottom: '1rem' }}>Este archivo aún no tiene grupos. Crea uno para empezar a agregar personajes.</p>
          <button className="btn btn-primary" onClick={onAddGroup}><Plus size={14} /> Crear grupo</button>
        </div>
      ) : (
        listGroups.map((g) => (
          <GroupSection
            key={g.id}
            group={g}
            charsAll={characters.filter((c) => c.groupId === g.id)}
            search={search}
            mode={mode}
            draggedId={draggedId}
            setDraggedId={setDraggedId}
            reorderManual={reorderManual}
            onOpenCharacter={onOpenCharacter}
            onToggleFavorite={onToggleFavorite}
            onRenameGroup={onRenameGroup}
            onDeleteGroup={onDeleteGroup}
            onAddCharacterToGroup={() => onAddCharacter(g.id)}
          />
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App principal
// ---------------------------------------------------------------------------
export default function FavCharApp() {
  const [lists, setLists] = useState(seedLists);
  const [groups, setGroups] = useState(seedGroups);
  const [characters, setCharacters] = useState(seedCharacters);
  const [view, setView] = useState('home');
  const [activeListId, setActiveListId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState({});
  const [modal, setModal] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  // Cargar datos guardados al abrir la app
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.lists)) setLists(data.lists);
        if (Array.isArray(data.groups)) setGroups(data.groups);
        if (Array.isArray(data.characters)) setCharacters(data.characters);
        if (data.sortMode && typeof data.sortMode === 'object') setSortMode(data.sortMode);
      }
    } catch (e) {
      // No hay datos guardados todavía
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, []);

  // Guardar cada vez que cambian los datos
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, groups, characters, sortMode }));
  }, [lists, groups, characters, sortMode]);

  function clearAllData() {
    setLists([]);
    setGroups([]);
    setCharacters([]);
    setSortMode({});
    setView('home');
    setActiveListId(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const favoritesExist = characters.some((c) => c.favorite);
  const closeModal = () => setModal(null);

  function openList(id) {
    setActiveListId(id);
    setView('list');
    setSearch('');
    setModal(null);
  }
  function goHome() {
    setView('home');
    setActiveListId(null);
    setSearch('');
    setModal(null);
  }
  function setSortModeFor(id, mode) {
    setSortMode((prev) => ({ ...prev, [id]: mode }));
  }

  function addList(name) {
    const id = genId('list');
    setLists((ls) => [...ls, { id, name }]);
    return id;
  }
  function renameList(id, name) {
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, name } : l)));
  }
  function deleteList(id) {
    setGroups((gs) => gs.filter((g) => g.listId !== id));
    setCharacters((cs) => cs.filter((c) => c.listId !== id));
    setLists((ls) => ls.filter((l) => l.id !== id));
    if (activeListId === id) goHome();
  }

  function addGroup(listId, name) {
    const id = genId('grp');
    setGroups((gs) => [...gs, { id, listId, name }]);
  }
  function renameGroup(id, name) {
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, name } : g)));
  }
  function deleteGroup(id) {
    setCharacters((cs) => cs.filter((c) => c.groupId !== id));
    setGroups((gs) => gs.filter((g) => g.id !== id));
  }

  function addCharacter(listId, data) {
    setCharacters((cs) => {
      const countInList = cs.filter((c) => c.listId === listId).length;
      const id = genId('char');
      const newChar = {
        id, listId, favorite: false,
        entryOrder: countInList + 1, manualOrder: countInList + 1,
        createdAt: Date.now(), profileImage: null, styleImages: [], nicknames: [], styles: [],
        ...data,
      };
      return [...cs, newChar];
    });
  }
  function updateCharacter(id, data) {
    setCharacters((cs) => cs.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }
  function deleteCharacter(id) {
    setCharacters((cs) => cs.filter((c) => c.id !== id));
  }
  function toggleFavorite(id) {
    setCharacters((cs) => cs.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
  }
  function reorderManual(groupId, draggedCharId, targetCharId) {
    setCharacters((cs) => {
      const groupChars = cs.filter((c) => c.groupId === groupId).sort((a, b) => a.manualOrder - b.manualOrder);
      const others = cs.filter((c) => c.groupId !== groupId);
      const fromIdx = groupChars.findIndex((c) => c.id === draggedCharId);
      const toIdx = groupChars.findIndex((c) => c.id === targetCharId);
      if (fromIdx === -1 || toIdx === -1) return cs;
      const reordered = [...groupChars];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const renumbered = reordered.map((c, i) => ({ ...c, manualOrder: i + 1 }));
      return [...others, ...renumbered];
    });
  }

  const currentList = activeListId && activeListId !== 'fav' ? lists.find((l) => l.id === activeListId) : null;
  const isFavoritesView = view === 'list' && activeListId === 'fav';

  return (
    <div className="fc-root">
      <style>{GLOBAL_CSS}</style>

      <div className="fc-topbar">
        <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="fc-serif font-bold text-lg">FavChar</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="fc-tiny text-ink-45">
            {lists.length} {lists.length === 1 ? 'archivo' : 'archivos'} · {characters.length} {characters.length === 1 ? 'personaje' : 'personajes'}
          </span>
          <button
            className="fc-tiny"
            style={{ background: 'none', border: 'none', color: 'rgba(32,40,58,0.4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            title="Borrar todos los datos guardados"
            onClick={() => setModal({ type: 'confirmClearData' })}
          >
            <Trash2 size={12} /> Borrar datos
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-ink-45" style={{ textAlign: 'center', padding: '4rem 1rem' }}>Cargando tu archivo…</p>
      ) : (
        <>
          {view === 'home' && (
            <HomeView
              lists={lists}
              characters={characters}
              groups={groups}
              favoritesExist={favoritesExist}
              onOpenList={openList}
              onAddList={() => setModal({ type: 'addList' })}
              onDeleteList={(l) => setModal({ type: 'confirmDeleteList', list: l })}
            />
          )}

          {view === 'list' && (
            <ListDetailView
              listId={activeListId}
              isFavorites={isFavoritesView}
              listName={isFavoritesView ? 'Favoritos' : (currentList ? currentList.name : '')}
              groups={groups}
              characters={characters}
              lists={lists}
              search={search}
              setSearch={setSearch}
              sortMode={sortMode}
              setSortModeFor={setSortModeFor}
              onBack={goHome}
              onAddGroup={() => setModal({ type: 'addGroup', listId: activeListId })}
              onAddCharacter={(fixedGroupId) => setModal({ type: 'addCharacter', listId: activeListId, fixedGroupId })}
              onOpenCharacter={(c) => setModal({ type: 'detail', character: c })}
              onToggleFavorite={toggleFavorite}
              onRenameGroup={(g) => setModal({ type: 'renameGroup', group: g })}
              onDeleteGroup={(g) => setModal({ type: 'confirmDeleteGroup', group: g })}
              onRenameList={() => currentList && setModal({ type: 'renameList', list: currentList })}
              onDeleteList={() => currentList && setModal({ type: 'confirmDeleteList', list: currentList })}
              draggedId={draggedId}
              setDraggedId={setDraggedId}
              reorderManual={reorderManual}
            />
          )}
        </>
      )}

      {modal?.type === 'confirmClearData' && (
        <ConfirmModal
          title="Borrar todos los datos"
          message="Esto eliminará permanentemente todos tus archivos, grupos, personajes e imágenes guardados. No se puede deshacer."
          confirmLabel="Borrar todo"
          onConfirm={clearAllData}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'addList' && (
        <SimplePromptModal
          title="Nuevo archivo" label="Nombre del archivo" placeholder="Ej: Blue Lock" confirmLabel="Crear archivo"
          onSubmit={(val) => { const id = addList(val); openList(id); }}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'renameList' && (
        <SimplePromptModal
          title="Renombrar archivo" label="Nombre del archivo" initialValue={modal.list.name} confirmLabel="Guardar"
          onSubmit={(val) => renameList(modal.list.id, val)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'confirmDeleteList' && (
        <ConfirmModal
          title="Eliminar archivo"
          message={`Se eliminará "${modal.list.name}" junto con todos sus grupos y personajes. Esta acción no se puede deshacer.`}
          onConfirm={() => deleteList(modal.list.id)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'addGroup' && (
        <SimplePromptModal
          title="Nuevo grupo" label="Nombre del grupo" placeholder="Ej: Equipo Japonés" confirmLabel="Crear grupo"
          onSubmit={(val) => addGroup(modal.listId, val)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'renameGroup' && (
        <SimplePromptModal
          title="Renombrar grupo" label="Nombre del grupo" initialValue={modal.group.name} confirmLabel="Guardar"
          onSubmit={(val) => renameGroup(modal.group.id, val)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'confirmDeleteGroup' && (
        <ConfirmModal
          title="Eliminar grupo"
          message={`Se eliminará el grupo "${modal.group.name}" junto con los ${characters.filter((c) => c.groupId === modal.group.id).length} personajes que contiene.`}
          onConfirm={() => deleteGroup(modal.group.id)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'addCharacter' && (
        <CharacterFormModal
          title="Agregar personaje"
          groups={groups.filter((g) => g.listId === modal.listId)}
          fixedGroupId={modal.fixedGroupId}
          onSave={(data) => { addCharacter(modal.listId, data); closeModal(); }}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'editCharacter' && (
        <CharacterFormModal
          title="Editar personaje"
          initial={modal.character}
          groups={groups.filter((g) => g.listId === modal.character.listId)}
          onSave={(data) => { updateCharacter(modal.character.id, data); closeModal(); }}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'confirmDeleteCharacter' && (
        <ConfirmModal
          title="Eliminar personaje"
          message={`Se eliminará a "${modal.character.name}" de forma permanente.`}
          onConfirm={() => deleteCharacter(modal.character.id)}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'detail' && (
        <CharacterDetailModal
          character={characters.find((c) => c.id === modal.character.id) || modal.character}
          listName={(lists.find((l) => l.id === modal.character.listId) || {}).name}
          groupName={(groups.find((g) => g.id === modal.character.groupId) || {}).name}
          onClose={closeModal}
          onEdit={() => setModal({ type: 'editCharacter', character: modal.character })}
          onDelete={() => setModal({ type: 'confirmDeleteCharacter', character: modal.character })}
          onToggleFavorite={() => toggleFavorite(modal.character.id)}
        />
      )}
    </div>
  );
}
