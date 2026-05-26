import { useMemo, useState } from 'react';
import { MapPin, Package, Grid3x3, ShieldAlert, BadgeX, ShoppingCart, ChevronDown, ChevronRight, ChevronLeft, BarChart2, ChefHat } from 'lucide-react';
import logo from '../img/logowhite.png';

export default function Sidebar({
  items = [],
  onFilterChange,
  locations = [],
  categories = [],
  setSubFilter,
  filter,
  onViewChange,
  mode = 'expanded',
  isMobile = false,
  onToggleInner,
}) {
  const isCollapsed = mode === 'collapsed';
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
    justifyContent: isCollapsed ? 'center' : 'space-between',
    gap: '10px',
    width: '100%',
    padding: isCollapsed ? '9px 0' : '9px 10px',
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
        width: isCollapsed ? '60px' : mode === 'hidden' ? '0px' : '240px',
        minWidth: isCollapsed ? '60px' : mode === 'hidden' ? '0px' : '240px',
        height: '100vh',
        backgroundColor: '#13151a',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isCollapsed || mode === 'hidden' ? 'none' : '1px solid rgba(255,255,255,0.06)',
        padding: '0',
        overflowY: 'hidden',
        overflowX: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease, border 0.25s ease',
        ...(isMobile && mode !== 'hidden' ? {
          position: 'fixed' as const,
          left: 0,
          top: 0,
          zIndex: 100,
        } : {}),
      }}
    >
      {/* ── Logo / Brand ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '10px',
          padding: isCollapsed ? '20px 0' : '20px 16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <img src={logo} alt="logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        {!isCollapsed && (
          <div>
            <p style={{ color: '#f9fafb', fontSize: '0.9rem', fontWeight: '600', lineHeight: 1.2, margin: 0 }}>
              Home Inventory
            </p>
            <p style={{ color: '#4b5563', fontSize: '0.72rem', margin: 0, marginTop: '2px' }}>Mi inventario</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: isCollapsed ? '16px 0' : '16px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

        {/* SECTION: Vistas */}
        {!isCollapsed && <p style={sectionLabel}>Vistas</p>}

        {/* Inventario */}
        <button
          onClick={() => handleViewChange('inventory')}
          style={navBtn(activeView === 'inventory')}
          onMouseEnter={(e) => { if (activeView !== 'inventory') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
          onMouseLeave={(e) => { if (activeView !== 'inventory') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={16} strokeWidth={1.8} />
            {!isCollapsed && 'Todos los objetos'}
          </span>
          {!isCollapsed && <span style={badge('rgba(255,255,255,0.08)', '#9ca3af')}>{allItemsCount}</span>}
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
            {!isCollapsed && 'Lista de compra'}
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
            {!isCollapsed && 'Analíticas'}
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
            {!isCollapsed && 'Recetas'}
          </span>
        </button>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />

        {/* SECTION: Filtros */}
        {!isCollapsed && <p style={sectionLabel}>Filtros</p>}

        {/* Por ubicación */}
        <div>
          <button
            onClick={() => {
              if (!isCollapsed) { setLocationOpen((p) => !p); setCategoryOpen(false); }
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
              {!isCollapsed && 'Por ubicación'}
            </span>
            {!isCollapsed && (locationOpen
              ? <ChevronDown size={14} style={{ color: '#6b7280' }} />
              : <ChevronRight size={14} style={{ color: '#6b7280' }} />)}
          </button>

          {!isCollapsed && locationOpen && locations.length > 0 && (
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
              if (!isCollapsed) { setCategoryOpen((p) => !p); setLocationOpen(false); }
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
              {!isCollapsed && 'Por categoría'}
            </span>
            {!isCollapsed && (categoryOpen
              ? <ChevronDown size={14} style={{ color: '#6b7280' }} />
              : <ChevronRight size={14} style={{ color: '#6b7280' }} />)}
          </button>

          {!isCollapsed && categoryOpen && categories.length > 0 && (
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
        {!isCollapsed && <p style={sectionLabel}>Alertas</p>}

        {/* Caducan pronto */}
        <button
          onClick={() => { onFilterChange('expiring'); setSubFilter(''); onViewChange('inventory'); setActiveView('inventory'); }}
          style={navBtn(filter === 'expiring', '#f87171')}
          onMouseEnter={(e) => { if (filter !== 'expiring') { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#fca5a5'; } }}
          onMouseLeave={(e) => { if (filter !== 'expiring') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f87171'; } }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={16} strokeWidth={1.8} />
            {!isCollapsed && 'Caducan pronto'}
          </span>
          {!isCollapsed && soonExpiringCount > 0 && (
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
            {!isCollapsed && 'Caducados'}
          </span>
          {!isCollapsed && expiredCount > 0 && (
            <span style={badge('rgba(251,146,60,0.15)', '#fb923c')}>{expiredCount}</span>
          )}
        </button>

      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: isCollapsed ? '8px 0' : '8px 16px',
          gap: '4px',
        }}
      >
        {isMobile && (
          <button
            onClick={onToggleInner}
            title={mode === 'expanded' ? 'Colapsar a iconos' : 'Expandir sidebar'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'transparent', color: '#6b7280', cursor: 'pointer',
              transition: 'background-color 0.18s ease, color 0.18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            {mode === 'expanded' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!isCollapsed && (
          <span style={{ fontSize: '0.7rem', color: '#374151', letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} Home Inventory
          </span>
        )}
      </div>
    </aside>
  );
}