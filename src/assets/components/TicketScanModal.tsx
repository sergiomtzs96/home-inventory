import { useState, useRef } from 'react';
import { X, Upload, ChevronRight, Check, AlertTriangle, Camera, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api.js';

const TOKEN = () => localStorage.getItem('token');

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputSt = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8375rem',
  color: '#f9fafb', backgroundColor: '#13151a', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.18s ease',
};
const focusIn  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.28)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)'; };
const focusOut = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; };

const labelSt = { display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' };

function Btn({ children, onClick, variant = 'primary', disabled = false, style: extra = {} }) {
  const base = {
    padding: '9px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: 'background 0.18s ease, transform 0.12s ease',
    opacity: disabled ? 0.45 : 1, ...extra,
  };
  const styles = variant === 'primary'
    ? { ...base, backgroundColor: '#021241', color: '#fff', boxShadow: '0 2px 8px rgba(2,18,65,0.4)' }
    : { ...base, backgroundColor: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' };
  return <button style={styles} onClick={onClick} disabled={disabled}>{children}</button>;
}

// ── STEP 1: Upload ────────────────────────────────────────────────────────────
function StepUpload({ onDetected, onClose }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const scan = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE_URL}/api/ticket/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al escanear');
      if (data.error) throw new Error(data.error);
      if (!data.products?.length) throw new Error('No se detectaron productos en el ticket.');
      onDetected(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        onClick={() => !loading && inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: `2px dashed ${preview ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '12px', minHeight: '200px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
          cursor: loading ? 'default' : 'pointer', transition: 'border-color 0.2s',
          overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        {preview ? (
          <img src={preview} alt="ticket" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }} />
        ) : (
          <>
            <Camera size={32} style={{ color: '#4b5563' }} strokeWidth={1.5} />
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
              Arrastra tu foto de ticket o <span style={{ color: '#a5b4fc' }}>haz clic para elegir</span>
            </p>
            <p style={{ color: '#4b5563', fontSize: '0.72rem', margin: 0 }}>JPG, PNG o WebP · máx 10 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={scan} disabled={!file || loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analizando...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={14} /> Escanear ticket
            </span>
          )}
        </Btn>
      </div>
    </div>
  );
}

// ── STEP 2: Review products ───────────────────────────────────────────────────
function StepReview({ products, onConfirm, onBack }) {
  const [list, setList] = useState(products.map((p, i) => ({ ...p, id: i, skip: false })));

  const update = (id, field, value) => setList(l => l.map(p => p.id === id ? { ...p, [field]: value } : p));

  const confirmed = list.filter(p => !p.skip);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
        Revisa los productos detectados. Puedes editar el nombre, precio o ignorar los que no quieras guardar.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
        {list.map(p => (
          <div key={p.id} style={{
            padding: '14px', borderRadius: '10px',
            backgroundColor: p.skip ? 'rgba(255,255,255,0.02)' : '#13151a',
            border: `1px solid ${p.skip ? 'rgba(255,255,255,0.04)' : p.confidence === 'low' ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.08)'}`,
            opacity: p.skip ? 0.4 : 1, transition: 'all 0.18s ease',
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Name */}
                <div>
                  <label style={labelSt}>
                    Nombre {p.confidence === 'low' && <span style={{ color: '#fb923c' }}>· baja confianza</span>}
                    {p.confidence === 'medium' && <span style={{ color: '#fbbf24' }}>· revisar</span>}
                  </label>
                  {p.confidence !== 'high' && p.alternatives?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {p.alternatives.map(a => (
                        <button key={a} onClick={() => update(p.id, 'name', a)}
                          style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '999px', border: '1px solid rgba(251,146,60,0.3)', background: 'transparent', color: '#fb923c', cursor: 'pointer' }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    style={inputSt} value={p.name}
                    onChange={(e) => update(p.id, 'name', e.target.value)}
                    onFocus={focusIn} onBlur={focusOut}
                    disabled={p.skip}
                  />
                </div>

                {/* Qty + Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelSt}>Cantidad</label>
                    <input type="number" min="1" style={inputSt} value={p.quantity}
                      onChange={(e) => update(p.id, 'quantity', parseInt(e.target.value) || 1)}
                      onFocus={focusIn} onBlur={focusOut} disabled={p.skip} />
                  </div>
                  <div>
                    <label style={labelSt}>Precio unitario (€) {p.price === 0 && <span style={{ color: '#fb923c' }}>· no detectado</span>}</label>
                    <input type="number" min="0" step="0.01" style={inputSt} value={p.price}
                      placeholder="0.00"
                      onChange={(e) => update(p.id, 'price', parseFloat(e.target.value) || 0)}
                      onFocus={focusIn} onBlur={focusOut} disabled={p.skip} />
                  </div>
                </div>
              </div>

              {/* Skip toggle */}
              <button onClick={() => update(p.id, 'skip', !p.skip)}
                title={p.skip ? 'Incluir' : 'Ignorar'}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                  border: `1px solid ${p.skip ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.3)'}`,
                  background: 'transparent', cursor: 'pointer',
                  color: p.skip ? '#4b5563' : '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{confirmed.length} producto(s) a guardar</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn variant="ghost" onClick={onBack}>Atrás</Btn>
          <Btn onClick={() => onConfirm(confirmed)} disabled={confirmed.length === 0}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Continuar <ChevronRight size={14} />
            </span>
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3: Locate each product ───────────────────────────────────────────────
function StepLocate({ products, existingItems, locations, onSave, onBack }) {
  const [idx, setIdx] = useState(0);
  const current = products[idx];

  // Smart suggestion: same name already exists somewhere?
  const suggestion = existingItems.find(i =>
    i.name.toLowerCase().includes(current?.name.toLowerCase()) ||
    current?.name.toLowerCase().includes(i.name.toLowerCase())
  );

  const [location, setLocation] = useState(suggestion?.location || '');
  const [customLoc, setCustomLoc] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState([]);

  const finalLocation = customLoc.trim() || location;

  const saveOne = async () => {
    if (!finalLocation) return;
    setSaving(true);
    try {
      const payload = {
        name: current.name,
        quantity: current.quantity || 1,
        price: current.price || 0,
        category: current.category || 'Sin categoría',
        location: finalLocation,
        expiryDate: expiryDate || null,
      };
      const res = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSaved(s => [...s, current.name]);

      if (idx + 1 < products.length) {
        const next = products[idx + 1];
        const nextSuggestion = existingItems.find(i =>
          i.name.toLowerCase().includes(next?.name.toLowerCase()) ||
          next?.name.toLowerCase().includes(i.name.toLowerCase())
        );
        setLocation(nextSuggestion?.location || '');
        setCustomLoc('');
        setExpiryDate('');
        setIdx(i => i + 1);
      } else {
        onSave(saved.length + 1);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!current) return null;

  const progress = ((idx) / products.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Producto {idx + 1} de {products.length}</span>
          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#6366f1', borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Current product card */}
      <div style={{ backgroundColor: '#13151a', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ color: '#f9fafb', fontWeight: '700', fontSize: '1rem', margin: 0 }}>
          {current.name.charAt(0).toUpperCase() + current.name.slice(1)}
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: '4px 0 0' }}>
          {current.quantity} ud. · {current.price > 0 ? `${current.price.toFixed(2)} €/ud` : 'precio pendiente'}
        </p>
      </div>

      {/* Location suggestion */}
      {suggestion && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <MapPin size={13} style={{ color: '#a5b4fc', flexShrink: 0 }} />
          <span style={{ fontSize: '0.78rem', color: '#c7d2fe' }}>
            Ya tienes <strong>{suggestion.name}</strong> en <strong>{suggestion.location}</strong>. Se sugiere la misma ubicación.
          </span>
        </div>
      )}

      {/* Location select */}
      <div>
        <label style={labelSt}>¿Dónde guardas este producto? *</label>
        <select
          value={location}
          onChange={(e) => { setLocation(e.target.value); setCustomLoc(''); }}
          style={{ ...inputSt, cursor: 'pointer', appearance: 'none' }}
          onFocus={focusIn} onBlur={focusOut}
        >
          <option value="">Selecciona una ubicación</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label style={labelSt}>O escribe una ubicación nueva</label>
        <input
          style={inputSt} placeholder="Ej: Nevera, Armario cocina..."
          value={customLoc}
          onChange={(e) => { setCustomLoc(e.target.value); if (e.target.value) setLocation(''); }}
          onFocus={focusIn} onBlur={focusOut}
        />
      </div>

      <div>
        <label style={labelSt}>Fecha de caducidad (opcional)</label>
        <input
          type="date"
          style={inputSt}
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          onFocus={focusIn} onBlur={focusOut}
        />
      </div>

      {/* Saved list */}
      {saved.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {saved.map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Check size={12} style={{ color: '#10b981' }} strokeWidth={2.5} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{n}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Btn variant="ghost" onClick={onBack} disabled={saving}>Atrás</Btn>
        <Btn onClick={saveOne} disabled={!finalLocation || saving}>
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...
            </span>
          ) : idx + 1 < products.length ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Guardar y siguiente <ChevronRight size={14} /></span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} /> Finalizar</span>
          )}
        </Btn>
      </div>
    </div>
  );
}

// ── STEP 4: Done ──────────────────────────────────────────────────────────────
function StepDone({ count, onClose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={26} style={{ color: '#10b981' }} strokeWidth={2.5} />
      </div>
      <h3 style={{ color: '#f9fafb', fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>¡Todo guardado!</h3>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
        Se han guardado <strong style={{ color: '#f9fafb' }}>{count} producto(s)</strong> en tu inventario desde el ticket.
      </p>
      <Btn onClick={onClose}>Cerrar</Btn>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function TicketScanModal({ onClose, onSaved, existingItems = [], locations = [] }) {
  const [step, setStep]         = useState(0); // 0=upload 1=review 2=locate 3=done
  const [products, setProducts] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

  const titles = ['Escanear ticket', 'Revisar productos', 'Ubicar productos', '¡Listo!'];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 60, padding: '16px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '520px', backgroundColor: '#1c1f27',
        borderRadius: '16px', padding: '28px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        animation: 'modalIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#f9fafb', fontWeight: '700', fontSize: '1.05rem', margin: 0 }}>{titles[step]}</h2>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '3px', flex: 1, borderRadius: '999px',
                  backgroundColor: i <= step ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  transition: 'background-color 0.3s',
                }} />
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '30px', height: '30px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: '#6b7280', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Steps */}
        {step === 0 && (
          <StepUpload
            onDetected={(prods) => { setProducts(prods); setStep(1); }}
            onClose={onClose}
          />
        )}
        {step === 1 && (
          <StepReview
            products={products}
            onConfirm={(conf) => { setConfirmed(conf); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepLocate
            products={confirmed}
            existingItems={existingItems}
            locations={locations}
            onSave={(count) => { setSavedCount(count); setStep(3); onSaved?.(); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <StepDone count={savedCount} onClose={onClose} />}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
