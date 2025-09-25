import { Package, MapPin, Trash2, MoreVertical, RefreshCw, ClipboardPlus } from 'lucide-react';
import { useState } from 'react';

export default function ItemCard({
  item,
  onDelete,
  onUpdateQuantity,        // Solo para inventario
  onAddToShoppingList,     // Solo en inventario
  showLocation = true,
  showAddToShopping = true,
  independentQuantity = false // Si true, la cantidad es solo local
}) {
  // Si es independiente, usamos estado propio, sino inicializamos con el item
  const [quantity, setQuantity] = useState(independentQuantity ? 1 : item.quantity);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleUpdateQuantity = () => {
    if (quantity < 1) return;
    if (!independentQuantity && onUpdateQuantity) onUpdateQuantity(item._id, quantity);
    setDropdownOpen(false);
  };

  const handleBlur = () => {
    if (quantity < 1) setQuantity(independentQuantity ? 1 : item.quantity);
    if (!independentQuantity && quantity !== item.quantity && onUpdateQuantity) {
      onUpdateQuantity(item._id, quantity);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-1">{item.name}</h2>

        {showAddToShopping && (
          <div className="relative">
            <button onClick={() => setDropdownOpen(prev => !prev)}>
              <MoreVertical size={16} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md z-10 p-2 flex flex-col gap-2">
                {!independentQuantity && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">Cantidad</label>
                      <button onClick={handleUpdateQuantity} className="hover:scale-110">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      onBlur={handleBlur}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateQuantity()}
                      className="w-full border px-2 py-1 rounded mt-1 text-sm"
                    />
                  </div>
                )}

                {onAddToShoppingList && !independentQuantity && (
                  <button
                    onClick={() => { onAddToShoppingList(item, quantity); setDropdownOpen(false); }}
                    className="text-xs flex items-center gap-1 rounded-lg bg-blue-300 px-2 py-1"
                  >
                    <ClipboardPlus size={20} /> Añadir a lista de compra
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 flex flex-col gap-1 mb-4">
        <span className="flex items-center gap-1">
          <Package size={16} /> Cantidad:
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleUpdateQuantity()}
            className="w-16 border px-1 py-0.5 rounded text-sm ml-1"
          />
        </span>

        {showLocation && (
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {item.location}
          </span>
        )}

        <span className="flex items-center gap-1">
          Categoría:
          <span className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold ml-1">
            {item.category}
          </span>
        </span>
      </div>

      <div className="flex justify-between">
        <p className={`${item.expiryDate && (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 5 ? 'text-red-500 font-semibold' : 'text-gray-500 font-semibold'}`}>
          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('es-ES') : 'Sin fecha'}
        </p>
        <button
          onClick={() => onDelete(item._id)}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs flex items-center gap-1"
        >
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </div>
  );
}