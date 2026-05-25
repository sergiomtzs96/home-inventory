import { LogOut, Search, Plus, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ search, setSearch, onAdd, onScan }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '1rem',
      }}
    >
      {/* Search input */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          maxWidth: '420px',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Buscar objeto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '16px',
            paddingTop: '10px',
            paddingBottom: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#1e2028',
            fontSize: '0.875rem',
            color: '#f9fafb',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.25)';
            e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Add button */}
        <button
          onClick={onAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: '#021241ff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
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
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0px) scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Añadir objeto
        </button>

        {/* Scan ticket button */}
        <button
          onClick={onScan}
          title="Escanear ticket"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'transparent',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '0.8rem', fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.18s ease, transform 0.14s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Camera size={15} strokeWidth={2} />
          Ticket
        </button>

        {/* Logout button */}
        <div style={{ position: 'relative', display: 'inline-flex' }} className="topbar-logout-wrapper">
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: '#1e2028',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(66,3,3,0.6)';
              e.currentTarget.style.backgroundColor = 'rgba(66,3,3,0.15)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.backgroundColor = '#1e2028';
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}