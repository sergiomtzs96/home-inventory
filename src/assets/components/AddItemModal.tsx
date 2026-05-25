import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api.js';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.08)',
  fontSize: '0.8375rem',
  color: '#f9fafb',
  backgroundColor: '#13151a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
  marginTop: '6px',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#6b7280',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function StyledInput({ style: extraStyle, ...props }: any) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...extraStyle }}
      onFocus={(e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.25)';
        e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
        e.target.style.backgroundColor = '#0d0f14';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
        e.target.style.boxShadow = 'none';
        e.target.style.backgroundColor = '#13151a';
      }}
    />
  );
}

function StyledSelect({ children, ...props }: any) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      onFocus={(e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.25)';
        e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
        e.target.style.backgroundColor = '#0d0f14';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
        e.target.style.boxShadow = 'none';
        e.target.style.backgroundColor = '#13151a';
      }}
    >
      {children}
    </select>
  );
}

export default function AddItemModal({ onClose, onAddItem }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    categoryInput: '',
    quantity: 1,
    price: '',
    location: '',
    locationInput: '',
    expiryDate: '',
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/auth/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLocations(data.locations || []);
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.categoryInput || form.category,
      quantity: form.quantity,
      price: parseFloat(form.price) || 0,
      location: form.locationInput || form.location,
      expiryDate: form.expiryDate || null,
    };

    if (!payload.name || !payload.category || !payload.location) {
      toast.error('Completa todos los campos obligatorios.');
      return;
    }

    fetch(`${API_BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 201) {
          toast.error(body.error || 'Error al añadir objeto');
          return;
        }
        toast.success('Objeto añadido correctamente');
        onAddItem();
        onClose();
      })
      .catch((err) => {
        console.error('Error al añadir objeto:', err);
        toast.error('Error de conexión al añadir objeto');
      });
  };

  return (
    // Backdrop
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      {/* Modal panel */}
      <div
        style={{
          backgroundColor: '#1c1f27',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f9fafb', margin: 0 }}>
            Nuevo objeto
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px', marginBottom: 0 }}>
            Añade un nuevo objeto a tu inventario
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Nombre */}
          <Field label="Nombre del objeto *">
            <StyledInput
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Leche, Detergente..."
              required
            />
          </Field>

          {/* Categoría + Cantidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Categoría *">
              <StyledSelect name="category" value={form.category} onChange={handleChange}>
                <option value="">Selecciona</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </StyledSelect>
              <StyledInput
                type="text"
                placeholder="O crea una nueva..."
                value={form.categoryInput}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryInput: e.target.value }))}
                style={{ marginTop: '6px' }}
              />
            </Field>

            <Field label="Cantidad *">
              <StyledInput
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          {/* Precio + Caducidad en una fila */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Precio unitario (€)">
              <StyledInput
                type="number"
                name="price"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
              />
            </Field>

            {/* Fecha de caducidad */}
            <Field label="Fecha de caducidad">
              <StyledInput
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
              />
            </Field>
          </div>

          {/* Ubicación */}
          <Field label="Ubicación *">
            <StyledSelect name="location" value={form.location} onChange={handleChange}>
              <option value="">Selecciona</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </StyledSelect>
            <StyledInput
              type="text"
              placeholder="O crea una nueva..."
              value={form.locationInput}
              onChange={(e) => setForm((prev) => ({ ...prev, locationInput: e.target.value }))}
              style={{ marginTop: '6px' }}
            />
          </Field>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />


          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e5e7eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#021241',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease',
                boxShadow: '0 2px 8px rgba(2,18,65,0.35)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0a2870';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(2,18,65,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#021241';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,18,65,0.35)';
              }}
            >
              Añadir objeto
            </button>
          </div>
        </form>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1);    }
        }
      `}</style>
    </div>
  );
}