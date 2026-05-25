import { Package, MapPin, Trash2, MoreVertical, RefreshCw, ClipboardPlus, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ItemCard({
  item,
  onDelete,
  onUpdateQuantity,
  onAddToShoppingList,
  showLocation = true,
  showAddToShopping = true,
  independentQuantity = false,
}: {
  item: any;
  onDelete: any;
  onUpdateQuantity: any;
  onAddToShoppingList: any;
  showLocation?: boolean;
  showAddToShopping?: boolean;
  independentQuantity?: boolean;
}) {
  const [quantity, setQuantity] = useState(
    independentQuantity ? '1' : String(item.quantity)
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value) => {
    setQuantity(value === '' ? '' : value);
  };

  const getValidQuantity = () => {
    const qty = Number(quantity);
    return quantity === '' || qty < 1 ? null : qty;
  };

  const handleUpdateQuantity = () => {
    const qty = getValidQuantity();
    if (!qty) return;
    if (!independentQuantity && onUpdateQuantity) {
      onUpdateQuantity(item.id, qty);
    }
    setDropdownOpen(false);
  };

  const handleBlur = () => {
    const qty = getValidQuantity();
    if (!qty) {
      setQuantity(independentQuantity ? '1' : String(item.quantity));
      return;
    }
    if (!independentQuantity && qty !== item.quantity && onUpdateQuantity) {
      onUpdateQuantity(item.id, qty);
    }
  };

  // ── Expiry logic ─────────────────────────────────────────────────────────
  const now = new Date();
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;
  const isSoon = daysLeft !== null && daysLeft > 5 && daysLeft <= 30;

  const expiryColor = isExpired
    ? { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' }
    : isUrgent
    ? { bg: 'rgba(251,146,60,0.1)', text: '#f97316', border: 'rgba(251,146,60,0.25)' }
    : isSoon
    ? { bg: 'rgba(234,179,8,0.08)', text: '#ca8a04', border: 'rgba(234,179,8,0.2)' }
    : { bg: 'rgba(107,114,128,0.07)', text: '#6b7280', border: 'rgba(107,114,128,0.15)' };

  const expiryLabel = isExpired
    ? 'Caducado'
    : isUrgent
    ? `Caduca en ${daysLeft}d`
    : isSoon
    ? `${daysLeft}d restantes`
    : expiry
    ? expiry.toLocaleDateString('es-ES')
    : 'Sin fecha';

  const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#1c1f27',
        borderRadius: '12px',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.35)'
          : '0 1px 4px rgba(0,0,0,0.25)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <h2
          style={{
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#f9fafb',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '0.005em',
          }}
        >
          {displayName}
        </h2>

        {showAddToShopping && (
          <div style={{ position: 'relative', flexShrink: 0 }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: dropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e5e7eb'; }}
              onMouseLeave={(e) => { if (!dropdownOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
            >
              <MoreVertical size={14} strokeWidth={2} />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '34px',
                  width: '180px',
                  backgroundColor: '#1e2028',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 20,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {!independentQuantity && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Cantidad
                      </span>
                      <button
                        onClick={handleUpdateQuantity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'transparent',
                          color: '#6b7280',
                          cursor: 'pointer',
                          transition: 'color 0.15s ease, background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; }}
                        title="Actualizar"
                      >
                        <RefreshCw size={13} strokeWidth={2.2} />
                      </button>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateQuantity()}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontSize: '0.8125rem',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#021241'; }}
                      onBlurCapture={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                  </div>
                )}

                {onAddToShoppingList && !independentQuantity && (
                  <>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                    <button
                      onClick={() => {
                        const qty = getValidQuantity() || 1;
                        onAddToShoppingList(item, qty);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '7px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#374151',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.color = '#021241'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                    >
                      <ClipboardPlus size={14} strokeWidth={2} />
                      Añadir a la lista
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Meta info ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Quantity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Package size={14} strokeWidth={1.8} style={{ color: '#6b7280', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Cantidad:</span>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateQuantity()}
            style={{
              width: '48px',
              padding: '2px 6px',
              borderRadius: '5px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.8rem',
              color: '#f9fafb',
              fontWeight: '600',
              outline: 'none',
              backgroundColor: '#13151a',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; e.target.style.backgroundColor = '#0d0f14'; }}
            onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.backgroundColor = '#13151a'; }}
          />
        </div>

        {/* Location */}
        {showLocation && item.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <MapPin size={14} strokeWidth={1.8} style={{ color: '#6b7280', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500' }}>{item.location}</span>
          </div>
        )}

        {/* Category badge */}
        {item.category && (
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: '600',
                letterSpacing: '0.03em',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.07)',
                color: '#9ca3af',
              }}
            >
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Footer: expiry + delete ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '2px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Expiry badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            borderRadius: '999px',
            backgroundColor: expiryColor.bg,
            border: `1px solid ${expiryColor.border}`,
          }}
        >
          <Calendar size={11} strokeWidth={2} style={{ color: expiryColor.text }} />
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: expiryColor.text }}>
            {expiryLabel}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(item.id)}
          title="Eliminar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '7px',
            border: '1px solid #f3f4f6',
            background: 'transparent',
            color: '#d1d5db',
            cursor: 'pointer',
            transition: 'border-color 0.18s ease, color 0.18s ease, background 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#f3f4f6';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#d1d5db';
          }}
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}