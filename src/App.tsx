import React from 'react'
import Auth from './assets/pages/Auth.jsx'
import Dashboard from './assets/pages/Dashboard.jsx'
import ErrorBoundary from './assets/components/ErrorBoundary.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css'

function App() {

  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1f27',
              color: '#f9fafb',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.85rem',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
          }}
        />
        <Routes>
          <Route path='/' element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='*' element={<h1>404 - Página no encontrada </h1>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
