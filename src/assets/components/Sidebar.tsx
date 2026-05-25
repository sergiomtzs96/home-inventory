import { useMemo, useState } from 'react';
import { MapPin, Package, Grid3x3, ShieldAlert, BadgeX, ShoppingCart, ChevronDown, ChevronRight, BarChart2, ChefHat } from 'lucide-react';
import logo from '../img/logowhite.png';

export default function Sidebar({
  items = [],
  onFilterChange,
  locations = [],
  categories = [],
  setSubFilter,
  filter,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState('inventory');
  const [locationOpen, setLocationOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const allItemsCount = items.length;

  const soonExpiringCount = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 30);
    return items.filter((i) => {
      if (!i.expiryDate) return false;
      const expiry = new Date(i.expiryDate);
      return expiry >= now && expiry <= limit;
    }).length;
  }, [items]);

  const expiredCount = useMemo(() =>
    items.filter((i) => i.category === 'Caducados').length,
    [items]
  );

  const handleViewChange = (view) => {
    setActiveView(view);
    onViewChange(view);
    if (view === 'inventory') onFilterChange('all');
    if (view !== 'inventory' && view !== 'recipes') setSubFilter('');
  };

  // ── Shared style helpers ───────────────────────────────────────────────────
  const navBtn = (isActive, colorOverride?) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    width: '100%',
    padding: '9px 10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: isActive ? '600' : '400',
    letterSpacing: '0.01em',
    backgroundColor: isActive ? 'rgba(2,18,65,0.7)' : 'transparent',
    color: isActive ? '#ffffff' : colorOverride || '#9ca3af',
    transition: 'background-color 0.18s ease, color 0.18s ease',
    outline: 'none',
  });

  const sectionLabel = {
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.12em',
    color: '#4b5563',
    textTransform: 'uppercase',
    padding: '0 10px',
    marginBottom: '2px',
    marginTop: '4px',
  };

  const badge = (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 5px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: bg,
    color: color,
  });

  const subItem = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '6px 10px 6px 36px',
    fontSize: '0.8rem',
    color: '#9ca3af',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'color 0.15s ease, background-color 0.15s ease',
  };

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        backgroundColor: '#13151a',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '0',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* ── Logo / Brand ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '20px 16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <img src={logo} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        <div>
          <p style={{ color: '#f9fafb', fontSize: '0.9rem', fontWeight: '600', lineHeight: 1.2, margin: 0 }}>
            Home Inventory
          </p>
          <p style={{ color: '#4b5563', fontSize: '0.72rem', margin: 0, marginTop: '2px' }}>Mi inventario</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

        {/* SECTION: Vistas */}
        <p style={sectionLabel}>Vistas</p>

        {/* Inventario */}
        <button
          onClick={() => handleViewChange('inventory')}
          style={navBtn(activeView === 'inventory')}
          onMouseEnter={(e) => { if (activeView !== 'inventory') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={(e) => { if (activeView !== 'inventory') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={16} strokeWidth={1.8} />
            Todos los objetos
          </span>
          <span style={badge('rgba(255,255,255,0.08)', '#9ca3af')}>{allItemsCount}</span>
        </button>

        {/* Lista de compra */}
        <button
          onClick={() => handleViewChange('shopping')}
          style={navBtn(activeView === 'shopping')}
          onMouseEnter={(e) => { if (activeView !== 'shopping') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={(e) => { if (activeView !== 'shopping') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={16} strokeWidth={1.8} />
            Lista de compra
          </span>
        </button>
        {/* Analytics */}
        <button
          onClick={() => handleViewChange('analytics')}
          style={navBtn(activeView === 'analytics', '#6366f1')}
          onMouseEnter={(e) => { if (activeView !== 'analytics') { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#a5b4fc'; } }}
          onMouseLeave={(e) => { if (activeView !== 'analytics') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6366f1'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={16} strokeWidth={1.8} />
            Analíticas
          </span>
        </button>

        {/* Recetas */}
        <button
          onClick={() => handleViewChange('recipes')}
          style={navBtn(activeView === 'recipes', '#22c55e')}
          onMouseEnter={(e) => { if (activeView !== 'recipes') { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.08)'; e.currentTarget.style.color = '#4ade80'; } }}
          onMouseLeave={(e) => { if (activeView !== 'recipes') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#22c55e'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChefHat size={16} strokeWidth={1.8} />
            Recetas
          </span>
        </button>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />


        {/* SECTION: Filtros */}
        <p style={sectionLabel}>Filtros</p>

        {/* Por ubicación */}
        <div>
          <button
            onClick={() => {
              setLocationOpen((p) => !p);
              setCategoryOpen(false);
              onFilterChange('location');
              setSubFilter('');
              onViewChange('inventory');
              setActiveView('inventory');
            }}
            style={navBtn(filter === 'location')}
            onMouseEnter={(e) => { if (filter !== 'location') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={(e) => { if (filter !== 'location') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} strokeWidth={1.8} />
              Por ubicación
            </span>
            {locationOpen
              ? <ChevronDown size={14} style={{ color: '#6b7280' }} />
              : <ChevronRight size={14} style={{ color: '#6b7280' }} />}
          </button>

          {locationOpen && locations.length > 0 && (
            <div style={{ marginTop: '2px' }}>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSubFilter(loc)}
                  style={subItem}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Por categoría */}
        <div>
          <button
            onClick={() => {
              setCategoryOpen((p) => !p);
              setLocationOpen(false);
              onFilterChange('category');
              setSubFilter('');
              onViewChange('inventory');
              setActiveView('inventory');
            }}
            style={navBtn(filter === 'category')}
            onMouseEnter={(e) => { if (filter !== 'category') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={(e) => { if (filter !== 'category') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Grid3x3 size={16} strokeWidth={1.8} />
              Por categoría
            </span>
            {categoryOpen
              ? <ChevronDown size={14} style={{ color: '#6b7280' }} />
              : <ChevronRight size={14} style={{ color: '#6b7280' }} />}
          </button>

          {categoryOpen && categories.length > 0 && (
            <div style={{ marginTop: '2px' }}>
              {categories
                .filter((cat) => cat !== 'Caducados')
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSubFilter(cat)}
                    style={subItem}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />

        {/* SECTION: Alertas */}
        <p style={sectionLabel}>Alertas</p>

        {/* Caducan pronto */}
        <button
          onClick={() => { onFilterChange('expiring'); setSubFilter(''); onViewChange('inventory'); setActiveView('inventory'); }}
          style={navBtn(filter === 'expiring', '#f87171')}
          onMouseEnter={(e) => { if (filter !== 'expiring') { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#fca5a5'; } }}
          onMouseLeave={(e) => { if (filter !== 'expiring') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f87171'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={16} strokeWidth={1.8} />
            Caducan pronto
          </span>
          {soonExpiringCount > 0 && (
            <span style={badge('rgba(248,113,113,0.15)', '#f87171')}>{soonExpiringCount}</span>
          )}
        </button>

        {/* Caducados */}
        <button
          onClick={() => { onFilterChange('Caducados'); setSubFilter(''); onViewChange('inventory'); setActiveView('inventory'); }}
          style={navBtn(filter === 'Caducados', '#fb923c')}
          onMouseEnter={(e) => { if (filter !== 'Caducados') { e.currentTarget.style.backgroundColor = 'rgba(251,146,60,0.08)'; e.currentTarget.style.color = '#fdba74'; } }}
          onMouseLeave={(e) => { if (filter !== 'Caducados') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fb923c'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BadgeX size={16} strokeWidth={1.8} />
            Caducados
          </span>
          {expiredCount > 0 && (
            <span style={badge('rgba(251,146,60,0.15)', '#fb923c')}>{expiredCount}</span>
          )}
        </button>

      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.7rem',
          color: '#374151',
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}
      >
        © {new Date().getFullYear()} Home Inventory
      </div>
    </aside>
  );
}