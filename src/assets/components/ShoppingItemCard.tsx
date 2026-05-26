import { useState } from 'react';
import { Trash2, Package } from 'lucide-react';

export default function ShoppingItemCard({ item, onDelete, onUpdateQuantity }) {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [hovered, setHovered] = useState(false);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setQuantity(value);
  };

  const handleBlur = () => {
    const newQty = Number(quantity);
    if (newQty !== item.quantity && newQty > 0) {
      onUpdateQuantity(item.id, newQty);
    } else {
      setQuantity(item.quantity);
    }
  };

  const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);


  
  const handleIncrement = () => {
    const newQty = Number(quantity) + 1;
    setQuantity(newQty);
    onUpdateQuantity(item.id, newQty);
  };

  const handleDecrement = () => {
    const newQty = Number(quantity) - 1;
    setQuantity(newQty);
    onUpdateQuantity(item.id, newQty);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: '#1c1f27',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        gap: '12px',
      }}
    >
      {/* Left: icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        <Package size={15} strokeWidth={1.8} style={{ color: '#6b7280', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayName}
        </span>
        {item.category && (
          <span style={{
            fontSize: '0.68rem', fontWeight: '600', padding: '2px 7px',
            borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.07)',
            color: '#9ca3af', flexShrink: 0,
          }}>
            {item.category}
          </span>
        )}
      </div>

      {/* Right: quantity + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Cant.</label>
        <button onClick={handleDecrement}> - </button>
        <input
          type="text"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleBlur}
          style={{
            width: '40px',
            textAlign: 'center',
            padding: '4px 6px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#13151a',
            color: '#f9fafb',
            fontSize: '0.8rem',
            fontWeight: '600',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; }}
        />
        <button onClick={handleIncrement}> + </button>
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
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'transparent',
            color: '#4b5563',
            cursor: 'pointer',
            transition: 'border-color 0.18s ease, color 0.18s ease, background 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#4b5563';
          }}
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}