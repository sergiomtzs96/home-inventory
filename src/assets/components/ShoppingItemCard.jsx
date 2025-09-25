import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function ShoppingItemCard({ item, onDelete }) {
  //Cantidad local solo para la lista de compra
  const [quantity, setQuantity] = useState(item.quantity || 1);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setQuantity(value);
  };

  const handleBlur = () => {
    const newQty = Number(quantity);
    if (newQty !== item.quantity && newQty > 0) {
      onUpdateQuantity(item._id, newQty);
    } else {
      setQuantity(item.quantity);
    }
  };

  return (
    <div className='w-full border rounded-lg p-2 '>
      <div className='flex items-center justify-between'>
        <p className='font-semibold'>{item.name}</p>
        <div className='flex items-center gap-2'>
          <label className='text-sm'>Cantidad:</label>
          <input
            type='text'
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleBlur}
            className='w-10 text-center text-sm border rounded px-1 py-0.5'
          />
          <button
            onClick={() => onDelete(item._id)}
            className='bg-red-500 text-white rounded-lg p-2 hover:bg-red-800'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}