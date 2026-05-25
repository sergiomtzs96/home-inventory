import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import ItemCard from '../components/ItemCard.jsx';
import AddItemModal from '../components/AddItemModal.jsx';
import ShoppingItemCard from '../components/ShoppingItemCard.jsx';
import Analytics from './Analytics.jsx';
import RecipeSuggestions from '../components/RecipeSuggestions.jsx';
import TicketScanModal from '../components/TicketScanModal.jsx';
import { API_BASE_URL } from '../../api.js';
import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('');
  const [view, setView] = useState('inventory'); // 'inventory', 'shopping', 'analytics', 'recipes'
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const token = localStorage.getItem('token');
  const alertShown = useRef(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingShopping, setLoadingShopping] = useState(false);
  const [newShoppingItemName, setNewShoppingItemName] = useState('');
  const [newShoppingItemQuantity, setNewShoppingItemQuantity] = useState(1);
  const [newShoppingItemCategory, setNewShoppingItemCategory] = useState('');

  // -----------------------
  // Fetch items
  const fetchItems = async () => {
    if (!token) return;
    setLoadingItems(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      toast.error('Error al cargar los objetos');
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch shopping list
  const fetchShoppingList = async () => {
    if (!token) return;
    setLoadingShopping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShoppingList(data);
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      toast.error('Error al cargar la lista de compra');
    } finally {
      setLoadingShopping(false);
    }
  };

  // -----------------------
  // Load data by view
  useEffect(() => {
    if (view === 'inventory') fetchItems();
    else fetchShoppingList();
  }, [view]);

  // -----------------------
  // Delete item
  const handleDelete = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setItems((prev) => prev.filter((item) => item.id !== id));
      setShoppingList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('Error actualizando cantidad');
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Shopping list functions
  const handleAddToShoppingList = async (item) => {
    if (!token) return;
    const existing = shoppingList.find((i) => i.name === item.name);
    if (existing) {
      await handleUpdateShoppingQuantity(existing.id, existing.quantity + item.quantity);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: item.name, quantity: item.quantity, category: item.category }),
      });
      const newItem = await res.json();
      setShoppingList((prev) => [...prev, newItem]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setShoppingList((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateShoppingQuantity = async (id, quantity) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      const updatedItem = await res.json();
      setShoppingList((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Alert: Expiring items (≤5 días) y no caducados
  useEffect(() => {
    if (items.length === 0 || alertShown.current) return;
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 5);

    const expiringItems = items.filter((item) => {
      if (!item.expiryDate) return false;
      if (item.category === 'Caducados') return false;
      const expiry = new Date(item.expiryDate);
      return expiry >= now && expiry <= limit;
    });

    if (expiringItems.length > 0) {
      const itemsList = expiringItems
        .slice(0, 5)
        .map((item) => {
          const dias = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return `${item.name} (${dias} día${dias !== 1 ? 's' : ''})`;
        })
        .join(', ');
      const mensaje = itemsList + (expiringItems.length > 5 ? ` y ${expiringItems.length - 5} más` : '');
      toast.success(`Productos próximos a caducar: ${mensaje}`, { duration: 6000 });
      alertShown.current = true;
    }
  }, [items]);


  //Añadir producto manualmente
  const handleAddShoppingItem = async () => {
    if (!token || !newShoppingItemName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newShoppingItemName.trim(), quantity: Number(newShoppingItemQuantity) || 1, category: newShoppingItemCategory || 'Otros' })
      });

      const newItem = await res.json();
      setShoppingList(prev => [...prev, newItem]);

      //Limpiar inputs
      setNewShoppingItemName('');
      setNewShoppingItemQuantity(1);
      setNewShoppingItemCategory('');
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Filtered items
  const filtered = useMemo(() => {
    const now = new Date();
    const limitExpiring = new Date();
    limitExpiring.setDate(now.getDate() + 30);
    let data = items;

    if (filter === 'expiring') {
      data = data.filter((item) => {
        if (!item.expiryDate) return false;
        if (item.category === 'Caducados') return false;
        const expiry = new Date(item.expiryDate);
        return expiry >= now && expiry <= limitExpiring;
      });
    }

    if (filter === 'location' && subFilter) data = data.filter((i) => i.location === subFilter);
    if (filter === 'category' && subFilter) data = data.filter((i) => i.category === subFilter);
    if (filter === 'Caducados') data = data.filter((i) => i.category === 'Caducados');
    if (search.trim() !== '') data = data.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    return data;
  }, [items, filter, subFilter, search]);

  // Unique locations & categories
  const locations = useMemo(() => [...new Set(items.map((i) => i.location).filter(Boolean))], [items]);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))], [items]);

  // -----------------------
  const sectionTitle = () => {
    if (filter === 'all') return 'Todos los objetos';
    if (filter === 'location') return `Ubicación: ${subFilter || 'Selecciona'}`;
    if (filter === 'category') return `Categoría: ${subFilter || 'Selecciona'}`;
    if (filter === 'expiring') return 'Caducan pronto';
    if (filter === 'Caducados') return 'Caducados';
    return '';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#13151a', overflow: 'hidden' }}>
      <Sidebar
        items={items}
        onFilterChange={(f) => { setFilter(f); setSubFilter(''); }}
        locations={locations}
        categories={categories}
        setSubFilter={setSubFilter}
        filter={filter}
        onViewChange={setView}
      />

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <Topbar search={search} setSearch={setSearch} onAdd={() => setShowModal(true)} onScan={() => setShowTicketModal(true)} />

        {/* ── Analytics view ── */}
        {view === 'analytics' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#f9fafb', margin: 0, letterSpacing: '-0.01em' }}>
                Analíticas
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '22px', height: '22px', padding: '0 6px',
                borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
              }}>{items.length}</span>
            </div>
            <Analytics items={items} />
          </>
        )}

        {/* ── Recipes view ── */}
        {view === 'recipes' && (
          <RecipeSuggestions items={items} onAddToShoppingList={handleAddToShoppingList} />
        )}

        {/* ── Inventory view ── */}
        {view === 'inventory' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#f9fafb', margin: 0, letterSpacing: '-0.01em' }}>
                {sectionTitle()}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '22px', height: '22px', padding: '0 6px',
                borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.08)', color: '#9ca3af',
              }}>
                {filtered.length}
              </span>
            </div>

            {loadingItems ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '10px', color: '#6b7280', paddingTop: '60px' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.85rem' }}>Cargando objetos...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flex: 1, gap: '8px', color: '#9ca3af', paddingTop: '60px',
              }}>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>No hay objetos que mostrar</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}>
                {filtered.map((item) => {
                  const now = new Date();
                  const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
                  const isSoon = expiry && (expiry.getTime() - now.getTime() <= 5 * 24 * 60 * 60 * 1000);
                  return (
                    <ItemCard
                      key={item.id}
                      item={{ ...item, isSoon }}
                      onDelete={handleDelete}
                      onUpdateQuantity={handleUpdateQuantity}
                      onAddToShoppingList={handleAddToShoppingList}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Shopping list view ── */}
        {view === 'shopping' && (
          <>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#f9fafb', margin: 0, letterSpacing: '-0.01em' }}>
                Lista de compra
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '22px', height: '22px', padding: '0 6px',
                borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.08)', color: '#9ca3af',
              }}>
                {shoppingList.length}
              </span>
            </div>

            {/* Add shopping item row */}
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              marginBottom: '16px', maxWidth: '600px',
            }}>
              <input
                type="text"
                placeholder="Nuevo artículo..."
                value={newShoppingItemName}
                onChange={(e) => setNewShoppingItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddShoppingItem()}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8375rem',
                  color: '#f9fafb', backgroundColor: '#1e2028', outline: 'none',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <input
                type="number"
                placeholder="Cant."
                value={newShoppingItemQuantity}
                onChange={(e) => setNewShoppingItemQuantity(Number(e.target.value))}
                style={{
                  width: '72px', padding: '9px 10px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8375rem',
                  color: '#f9fafb', backgroundColor: '#1e2028', outline: 'none',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleAddShoppingItem}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#021241', color: '#ffffff',
                  fontSize: '0.8375rem', fontWeight: '600', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease',
                  boxShadow: '0 2px 8px rgba(2,18,65,0.35)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0a2870'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(2,18,65,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#021241'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,18,65,0.35)'; }}
              >
                Añadir
              </button>
            </div>

            {/* Shopping items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
              {loadingShopping ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', padding: '20px 0' }}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem' }}>Cargando lista...</span>
                </div>
              ) : shoppingList.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                  Tu lista de compra está vacía
                </p>
              ) : (
                shoppingList.map((item) => (
                  <ShoppingItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteShoppingItem}
                    onUpdateQuantity={handleUpdateShoppingQuantity}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showModal && <AddItemModal onClose={() => setShowModal(false)} onAddItem={fetchItems} />}
      {showTicketModal && (
        <TicketScanModal
          onClose={() => setShowTicketModal(false)}
          onSaved={fetchItems}
          existingItems={items}
          locations={locations}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>

  );
}
