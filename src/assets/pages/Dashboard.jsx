import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import ItemCard from '../components/ItemCard.jsx';
import AddItemModal from '../components/AddItemModal.jsx';
import ShoppingItemCard from '../components/ShoppingItemCard.jsx';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('');
  const [view, setView] = useState('inventory'); // 'inventory' o 'shopping'
  const [shoppingList, setShoppingList] = useState([]);

  const token = localStorage.getItem('token');
  const alertShown = useRef(false);

  // -----------------------
  // Obtener items del backend
  const fetchItems = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  // Obtener lista de compra
  const fetchShoppingList = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/shopping', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setShoppingList(data);
    } catch (err) {
      console.error('Error fetching shopping list:', err);
    }
  };

  // -----------------------
  // Efecto para cargar datos según vista
  useEffect(() => {
    if (view === 'inventory') fetchItems();
    else if (view === 'shopping') fetchShoppingList();
  }, [view]);

  // -----------------------
  // Eliminar item del inventario
  const handleDelete = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setItems(prev => prev.filter(item => item._id !== id));
      setShoppingList(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Actualizar cantidad inventario
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!res.ok) throw new Error('Error actualizando la cantidad');
      setItems(prev => prev.map(i => i._id === id ? { ...i, quantity: newQuantity } : i));
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Lista de compra
  const handleAddToShoppingList = async (item) => {
    if (!token) return;

    // Evitar duplicados por nombre
    const existing = shoppingList.find(i => i.name === item.name);
    if (existing) {
      await handleUpdateShoppingQuantity(existing._id, existing.quantity + item.quantity);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: item.name, quantity: item.quantity, category: item.category })
      });
      const newItem = await res.json();
      setShoppingList(prev => [...prev, newItem]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/shopping/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setShoppingList(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateShoppingQuantity = async (id, quantity) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity })
      });
      const updatedItem = await res.json();
      setShoppingList(prev => prev.map(i => i._id === id ? updatedItem : i));
    } catch (err) {
      console.error(err);
    }
  };

  // Productos que caducan pronto

useEffect(() => {
    if (items.length === 0 || alertShown.current) return;

    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 5);

    const expiringItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      return expiry >= now && expiry <= limit;
    });

    if (expiringItems.length > 0) {
      const mensaje = expiringItems.map(item => {
        const dias = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
        const nombreCapitalizado = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        return `${nombreCapitalizado} (caduca en ${dias} día${dias !== 1 ? 's' : ''})`;
      }).join('\n');

      alert(`Productos a punto de caducar:\n\n${mensaje}`);
      alertShown.current = true;
    }
  }, [items]);


  // -----------------------
  // Filtrado dinámico
  const filtered = useMemo(() => {
    let data = items;

    if (filter === 'expiring') {
      const now = new Date();
      const limit = new Date();
      limit.setDate(now.getDate() + 30);
      data = data.filter(i => i.expiryDate && new Date(i.expiryDate) <= limit);
    }

    if (filter === 'location' && subFilter) {
      data = data.filter(i => i.location === subFilter);
    }

    if (filter === 'category' && subFilter) {
      data = data.filter(i => i.category === subFilter);
    }

    if (filter === 'Caducados') {
      data = data.filter(i => i.category === 'Caducados');
    }

    if (search.trim() !== '') {
      data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    return data;
  }, [items, filter, subFilter, search]);

  // Obtener todas las ubicaciones y categorías únicas
  const locations = useMemo(() => [...new Set(items.map(i => i.location).filter(Boolean))], [items]);
  const categories = useMemo(() => [...new Set(items.map(i => i.category).filter(Boolean))], [items]);

  // -----------------------
  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar
        items={items}
        onFilterChange={(f) => { setFilter(f); setSubFilter(''); }}
        locations={locations}
        categories={categories}
        setSubFilter={setSubFilter}
        filter={filter}
        onViewChange={setView}
      />

      <div className='flex flex-col flex-1 p-6'>
        <Topbar search={search} setSearch={setSearch} onAdd={() => setShowModal(true)} />

        {view === 'inventory' && (
          <>
            <h1 className="text-xl font-semibold mb-2">
              {filter === 'all'
                ? 'Todos los objetos'
                : filter === 'location'
                  ? `Ubicación: ${subFilter || 'Selecciona'}`
                  : filter === 'category'
                    ? `Categoría: ${subFilter || 'Selecciona'}`
                    : filter === 'expiring'
                      ? 'Caducan pronto'
                      : filter === 'Caducados'
                        ? 'Caducados'
                        : ''
              }
            </h1>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {filtered.map(item => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onDelete={handleDelete}
                  onUpdateQuantity={handleUpdateQuantity}
                  onAddToShoppingList={handleAddToShoppingList}
                />
              ))}
            </div>
          </>
        )}

        {view === 'shopping' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Lista de compra</h1>
            <div className='flex flex-col gap-2'>
              {shoppingList.map(item => (
                <ShoppingItemCard
                  key={item._id}
                  item={item}
                  onDelete={handleDeleteShoppingItem}
                  onUpdateQuantity={handleUpdateShoppingQuantity}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <AddItemModal
          onClose={() => setShowModal(false)}
          onAddItem={() => fetchItems()}
        />
      )}
    </div>
  );
};