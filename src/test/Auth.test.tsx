import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../assets/pages/Auth.jsx';

const renderAuth = () =>
  render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );

describe('Auth page', () => {
  it('renders the brand name', () => {
    renderAuth();
    expect(screen.getByText('Home Inventory')).toBeInTheDocument();
  });

  it('shows login form by default', () => {
    renderAuth();
    expect(screen.getByText('Inicia sesión en tu inventario')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('has email and password fields', () => {
    renderAuth();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('does not show username field by default', () => {
    renderAuth();
    expect(screen.queryByLabelText('Usuario')).not.toBeInTheDocument();
  });

  it('toggles to register when clicking the link', () => {
    renderAuth();
    const toggle = screen.getByText('Regístrate');
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
  });
});
