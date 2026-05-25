import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api.js';
import logo from '../img/logowhite.png';

function AuthInput({ id, label, type, placeholder, value, onChange, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: '500', color: '#9ca3af' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#1e2028',
          color: '#f9fafb',
          fontSize: '0.875rem',
          outline: 'none',
        }}
      />
      {error && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#ef4444', lineHeight: '1.3' }}>{error}</p>
      )}
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({} as Record<string, string>);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin) {
      if (!username.trim()) {
        newErrors.username = 'El usuario es obligatorio';
      } else if (username.trim().length < 3) {
        newErrors.username = 'El usuario debe tener al menos 3 caracteres';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Correo electrónico no válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const url = isLogin
      ? `${API_BASE_URL}/api/auth/login`
      : `${API_BASE_URL}/api/auth/register`;

    const body = isLogin
      ? { email, password }
      : { email, password, username };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/dashboard');
      } else {
        toast.error(data.error || (isLogin ? 'Error de autenticación' : 'Error al registrar'));
      }
    } catch {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => setErrors({});

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#13151a', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1c1f27', borderRadius: '16px', padding: '36px 32px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <img src={logo} alt="logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f9fafb', margin: 0 }}>Home Inventory</h1>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, marginTop: '2px' }}>
              {isLogin ? 'Inicia sesión en tu inventario' : 'Crea una cuenta nueva'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <AuthInput id="username" label="Usuario" type="text" placeholder="Tu nombre" value={username} onChange={handleChange(setUsername, 'username')} error={errors.username} />
          )}
          <AuthInput id="email" label="Correo electrónico" type="email" placeholder="tu@ejemplo.com" value={email} onChange={handleChange(setEmail, 'email')} error={errors.email} />
          <AuthInput id="password" label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={handleChange(setPassword, 'password')} error={errors.password} />

          <button type="submit" disabled={loading} style={{
            marginTop: '6px', padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: loading ? '#374151' : '#021241', color: '#ffffff', fontSize: '0.875rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease',
            boxShadow: loading ? 'none' : '0 2px 8px rgba(2,18,65,0.45)',
          }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#0a2870'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#021241'; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />
          <button onClick={() => { setIsLogin(!isLogin); clearErrors(); }} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#6b7280', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f9fafb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
          >
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span style={{ color: '#a5b4fc', fontWeight: '600' }}>{isLogin ? 'Regístrate' : 'Inicia sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
