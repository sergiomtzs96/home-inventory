import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // para registro
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // login
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/dashboard');
      } else {
        alert(data.error || 'Error de autenticación');
      }
    } else {
      // registro
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registro exitoso. Ahora inicia sesión.');
        setIsLogin(true); // volver al login
      } else {
        alert(data.error || 'Error al registrar');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <div className="bg-white p-6 border border-gray-300 rounded-lg w-80">
        <div className="flex flex-col items-center justify-center gap-2">
          <Boxes size={48} className="bg-blue-800 p-2 rounded-lg text-white" />
          <h1 className="font-semibold text-xl">{isLogin ? 'HomeInventory' : 'Registro'}</h1>
          <p className="text-sm text-gray-500">
            {isLogin
              ? 'Inicia sesión en tu inventario doméstico'
              : 'Crea una cuenta para tu inventario doméstico'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full mt-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="text-sm font-semibold">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                placeholder="Tu nombre"
                className="bg-gray-100 rounded-lg w-full py-1 px-2 focus:border focus:border-blue-500 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              placeholder="tu@ejemplo.com"
              className="bg-gray-100 rounded-lg w-full py-1 px-2 focus:border focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              className="bg-gray-100 rounded-lg w-full py-1 px-2 focus:border focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-800 text-white rounded-lg py-1 mt-1 font-semibold text-sm hover:bg-blue-700"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="text-sm mt-2 text-center">
          <button
            className="text-blue-800 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}