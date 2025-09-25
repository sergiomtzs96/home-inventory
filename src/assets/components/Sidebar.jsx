import { useMemo } from 'react';
import { Home, MapPin, Package, Grid3x3, ShieldAlert, BadgeCheck } from 'lucide-react';

export default function Sidebar({
  items = [],
  onFilterChange,
  locations = [],
  categories = [],
  setSubFilter,
  filter,
  onViewChange // nuevo callback para cambiar vista: 'inventory' o 'shopping'
}) {

  const allItemsCount = items.length;

  const soonExpiringCount = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 30);
    return items.filter(i => i.expiryDate && new Date(i.expiryDate) <= limit).length;
  }, [items]);

  return (
    <aside className="bg-gray-100 p-4 w-60 h-screen border-r border-gray-300 flex flex-col gap-6">
      <div className="flex gap-2 items-center font-semibold mt-3 mb-3 border-b p-2 border-gray-400">
        <Home size={40} className="bg-blue-800 p-2 rounded-lg text-white" />
        <p className="flex flex-col">
          Home Inventory
          <span className="font-normal text-sm">Mi inventario</span>
        </p>
      </div>

      <nav className="flex flex-col gap-4 text-sm font-medium text-gray-700">

        {/* Vista inventario */}
        <button
          onClick={() => { onViewChange('inventory'); onFilterChange('all'); setSubFilter(''); }}
          className="flex gap-2 items-center hover:text-blue-700"
        >
          <Package /> Todos los objetos
          <span className="ml-auto rounded-full bg-gray-200 py-1 px-2 text-xs">{allItemsCount}</span>
        </button>

        {/* Filtro por ubicación */}
        <div>
          <button
            onClick={() => { onFilterChange('location'); setSubFilter(''); onViewChange('inventory'); }}
            className="flex gap-2 items-center hover:text-blue-700"
          >
            <MapPin /> Por ubicación
          </button>
          {filter === 'location' && (
            <div className="ml-6 mt-1 flex flex-col gap-1">
              {locations.map(loc => (
                <button key={loc} onClick={() => setSubFilter(loc)} className="text-sm hover:text-green-500 text-left">{loc}</button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro por categoría */}
        <div>
          <button
            onClick={() => { onFilterChange('category'); setSubFilter(''); onViewChange('inventory'); }}
            className="flex gap-2 items-center hover:text-blue-700"
          >
            <Grid3x3 /> Por categoría
          </button>
          {filter === 'category' && (
            <div className="ml-6 mt-1 flex flex-col gap-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSubFilter(cat)} className="text-sm hover:text-green-500 text-left">{cat}</button>
              ))}
            </div>
          )}
        </div>

        {/* Caducan pronto */}
        <button
          onClick={() => { onFilterChange('expiring'); setSubFilter(''); onViewChange('inventory'); }}
          className="flex gap-2 items-center text-red-500 hover:text-red-700"
        >
          <ShieldAlert className="text-red-500" /> Caducan pronto
          {soonExpiringCount > 0 && (
            <span className="ml-auto rounded-full bg-red-100 py-1 px-2 text-xs">{soonExpiringCount}</span>
          )}
        </button>

        {/* Caducados */}
        <button
          onClick={() => { onFilterChange('Caducados'); setSubFilter(''); onViewChange('inventory'); }}
          className='flex gap-2 items-center text-amber-500 hover:text-amber-700'
        >
          <BadgeCheck /> Caducados
        </button>

        {/* Lista de compra */}
        <button
          onClick={() => onViewChange('shopping')}
          className='flex gap-2 items-center text-green-500 hover:text-green-700'
        >
          <BadgeCheck /> Lista de compra
        </button>
      </nav>
    </aside>
  );
}