import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ search, setSearch, onAdd }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    //Eliminar el token
    localStorage.removeItem('token');

    //Redirige al login 
    navigate('/auth');
  };


  return (
    <div className="flex items-center justify-between mb-6">
      <input
        type="text"
        placeholder="Buscar objeto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:border-blue-500"
      />
      <div className='flex items-center gap-2'>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Añadir
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 text-white px-4 py-3"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}