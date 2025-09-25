import { useEffect, useState } from "react";

export default function AddItemModal({ onClose, onAddItem }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    categoryInput: "",
    quantity: 1,
    location: "",
    locationInput: "",
    expiryDate: ""
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const token = localStorage.getItem("token");

  // Traer categorías y ubicaciones
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/auth/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLocations(data.locations || []);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      name: form.name,
      category: form.categoryInput || form.category,
      quantity: form.quantity,
      location: form.locationInput || form.location,
      expiryDate: form.expiryDate || null
    };

    if (!payload.name || !payload.category || !payload.location) {
      return alert("Por favor completa todos los campos obligatorios.");
    }

    fetch('http://localhost:5000/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 201) return alert(body.error || "Error al añadir objeto");
        onAddItem(); // refresca items
        onClose();
      })
      .catch(err => console.error('Error al añadir objeto:', err));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-lg">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1">Nuevo objeto</h2>
        <p className="text-gray-500 mb-4">Añade un nuevo objeto a tu inventario</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre del objeto *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ej: Leche, Detergente..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Categoría *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="O crea una nueva categoría"
                value={form.categoryInput}
                onChange={e => setForm(prev => ({ ...prev, categoryInput: e.target.value }))}
                className="w-full border px-3 py-2 rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Cantidad *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Ubicación *</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Selecciona una ubicación</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="O crea una nueva ubicación"
              value={form.locationInput}
              onChange={e => setForm(prev => ({ ...prev, locationInput: e.target.value }))}
              className="w-full border px-3 py-2 rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fecha de caducidad</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Añadir objeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}