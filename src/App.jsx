import React from 'react'
import Auth from './assets/pages/Auth.jsx'
import Dashboard from './assets/pages/Dashboard.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
function App() {

  return (
    <Router>
      <Routes>
        {/* Ruta raíz: redirige a Login para mantener un único punto de entrada */}
        <Route path='/' element={<Navigate to="/auth" replace />} />

        {/* Páginas principales */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Cualquier otra ruta: 404 */}
        <Route path='*' element={<h1>404 - Página no encontrada </h1>} />
      </Routes>
    </Router>
  )
}

export default App
