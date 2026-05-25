import { useMemo } from 'react';
import {
  TrendingUp, Package, DollarSign, AlertTriangle,
  BarChart2, PieChart, ShoppingBag, Calendar,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);

const fmtNum = (n) => new Intl.NumberFormat('es-ES').format(n || 0);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{
      backgroundColor: '#1c1f27',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: accent + '18',
        }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={2} />
        </div>
      </div>
      <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f9fafb', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ── Horizontal bar chart ───────────────────────────────────────────────────────
function BarRow({ label, value, max, color, suffix = '' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#d1d5db', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{suffix}{typeof value === 'number' && !suffix ? fmtNum(value) : value}</span>
      </div>
      <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '999px',
          backgroundColor: color, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ── Donut mini chart (SVG) ────────────────────────────────────────────────────
function MiniDonut({ slices, size = 80 }) {
  const total = slices.reduce((a, b) => a + b.value, 0);
  let offset = 0;
  const r = 28, cx = 40, cy = 40, circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
      {slices.map((s, i) => {
        const dash = (s.value / total) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ── Main Analytics component ──────────────────────────────────────────────────
export default function Analytics({ items = [] as any[] }) {
  const now = new Date();

  // ── Core metrics ──
  const totalItems = useMemo(() => items.reduce((a, i) => a + (i.quantity || 1), 0), [items]);
  const totalValue = useMemo(() => items.reduce((a, i) => a + (i.price || 0) * (i.quantity || 1), 0), [items]);
  const avgPrice = useMemo(() => {
    const priced = items.filter(i => i.price > 0);
    return priced.length ? priced.reduce((a, i) => a + i.price, 0) / priced.length : 0;
  }, [items]);

  // ── Expiring soon (≤7 days) ──
  const expiringSoon = useMemo(() => items.filter(i => {
    if (!i.expiryDate || i.category === 'Caducados') return false;
    const d = new Date(i.expiryDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }), [items]);

  const expiringValue = useMemo(() =>
    expiringSoon.reduce((a, i) => a + (i.price || 0) * (i.quantity || 1), 0), [expiringSoon]);

  // ── By category (value + count) ──
  const byCategory = useMemo(() => {
    const map: any = {};
    items.forEach(i => {
      if (!map[i.category]) map[i.category] = { count: 0, value: 0 };
      map[i.category].count += i.quantity || 1;
      map[i.category].value += (i.price || 0) * (i.quantity || 1);
    });
    return Object.entries(map)
      .map(([cat, d]: [string, any]) => ({ cat, ...d }))
      .sort((a: any, b: any) => b.value - a.value);
  }, [items]);

  // ── By location ──
  const byLocation = useMemo(() => {
    const map: any = {};
    items.forEach(i => {
      if (!map[i.location]) map[i.location] = 0;
      map[i.location] += i.quantity || 1;
    });
    return Object.entries(map)
      .map(([loc, count]) => ({ loc, count }))
      .sort((a: any, b: any) => b.count - a.count);
  }, [items]);

  // ── Expiry timeline (next 90 days, by week) ──
  const expiryTimeline = useMemo(() => {
    const weeks = Array.from({ length: 12 }, (_, i) => ({
      label: `S${i + 1}`,
      count: 0,
      value: 0,
    }));
    items.forEach(i => {
      if (!i.expiryDate || i.category === 'Caducados') return;
      const d = new Date(i.expiryDate);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 84) return;
      const weekIdx = Math.floor(diffDays / 7);
      if (weekIdx < 12) {
        weeks[weekIdx].count += i.quantity || 1;
        weeks[weekIdx].value += (i.price || 0) * (i.quantity || 1);
      }
    });
    return weeks;
  }, [items]);

  const maxWeekValue = Math.max(...expiryTimeline.map(w => w.value), 1);

  // ── Top items by value ──
  const topItems = useMemo(() =>
    [...items]
      .filter(i => i.price > 0)
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5),
    [items]);

  // ── Palette for categories ──
  const palette = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
  const catColors = {};
  byCategory.forEach((c, i) => { catColors[c.cat] = palette[i % palette.length]; });

  const sectionTitle = (title) => (
    <h2 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
      {title}
    </h2>
  );

  const card = (children, extra = {}) => (
    <div style={{
      backgroundColor: '#1c1f27', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)', padding: '20px', ...extra,
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Package} label="Total productos" value={fmtNum(totalItems)} sub={`${items.length} referencias`} accent="#6366f1" />
        <StatCard icon={DollarSign} label="Valor inventario" value={fmt(totalValue)} sub="Precio × cantidad" accent="#10b981" />
        <StatCard icon={TrendingUp} label="Precio medio" value={fmt(avgPrice)} sub="Por referencia" accent="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Caducan en 7 días" value={expiringSoon.length} sub={`Valor en riesgo: ${fmt(expiringValue)}`} accent="#ef4444" />
      </div>

      {/* ── Row 2: Categories + Locations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Category value */}
        {card(
          <>
            {sectionTitle('Valor por categoría')}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {byCategory.length > 0 && (
                <div style={{ flexShrink: 0 }}>
                  <MiniDonut slices={byCategory.map(c => ({ value: c.value || c.count, color: catColors[c.cat] }))} size={90} />
                </div>
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {byCategory.slice(0, 6).map(c => (
                  <BarRow
                    key={c.cat} label={c.cat}
                    value={fmt(c.value)}
                    max={byCategory[0]?.value || 1}
                    color={catColors[c.cat]}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Location count */}
        {card(
          <>
            {sectionTitle('Unidades por ubicación')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {byLocation.map(l => (
                <BarRow
                  key={l.loc} label={l.loc} value={l.count}
                  max={byLocation[0]?.count || 1}
                  color="#6366f1"
                />
              ))}
              {byLocation.length === 0 && (
                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>Sin datos</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Row 3: Expiry timeline ── */}
      {card(
        <>
          {sectionTitle('Predicción de caducidades (próximas 12 semanas)')}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
            {expiryTimeline.map((w, i) => {
              const h = maxWeekValue > 0 ? Math.max((w.value / maxWeekValue) * 90, w.count > 0 ? 6 : 0) : 0;
              const isUrgent = i < 2;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {w.value > 0 && (
                      <div
                        title={`${w.label}: ${fmt(w.value)} (${w.count} uds)`}
                        style={{
                          width: '100%', maxWidth: '28px',
                          height: `${h}px`,
                          backgroundColor: isUrgent ? '#ef4444' : '#6366f1',
                          borderRadius: '4px 4px 2px 2px',
                          opacity: isUrgent ? 1 : 0.7 + i * 0.01,
                          transition: 'opacity 0.2s',
                        }}
                      />
                    )}
                    {w.value === 0 && (
                      <div style={{ width: '100%', maxWidth: '28px', height: '4px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '2px' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{w.label}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '12px 0 0', lineHeight: 1.5 }}>
            Las barras <span style={{ color: '#ef4444', fontWeight: '600' }}>rojas</span> representan los próximos 14 días.
            El valor refleja el coste estimado de lo que caduca cada semana.
          </p>
        </>
      )}

      {/* ── Row 4: Top items by value ── */}
      {topItems.length > 0 && card(
        <>
          {sectionTitle('Artículos más valiosos')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topItems.map((item, i) => {
              const total = (item.price || 0) * (item.quantity || 1);
              const pct = topItems[0] ? (total / ((topItems[0].price || 0) * (topItems[0].quantity || 1))) * 100 : 0;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#4b5563', width: '16px', textAlign: 'right' }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#e5e7eb', fontWeight: '500' }}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                        {fmt(item.price)} × {item.quantity} = <strong style={{ color: '#f9fafb' }}>{fmt(total)}</strong>
                      </span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: palette[i % palette.length], borderRadius: '999px' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Row 5: Expiring items detail ── */}
      {expiringSoon.length > 0 && card(
        <>
          {sectionTitle(`⚠ Caducan en 7 días (${expiringSoon.length} productos)`)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expiringSoon.map(item => {
              const days = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px',
                  backgroundColor: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={13} style={{ color: '#ef4444' }} strokeWidth={2} />
                    <span style={{ fontSize: '0.83rem', color: '#f9fafb', fontWeight: '500' }}>
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{item.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {item.price > 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: '600' }}>
                        {fmt((item.price || 0) * (item.quantity || 1))}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: days <= 1 ? 'rgba(239,68,68,0.2)' : 'rgba(251,146,60,0.15)',
                      color: days <= 1 ? '#fca5a5' : '#fdba74',
                    }}>
                      {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `${days}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
