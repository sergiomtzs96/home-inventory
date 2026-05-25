import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#13151a', padding: '24px',
        }}>
          <div style={{
            maxWidth: '420px', textAlign: 'center',
            backgroundColor: '#1c1f27', borderRadius: '16px', padding: '40px 32px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ color: '#f9fafb', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 8px' }}>
              Algo salió mal
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 24px', lineHeight: '1.5' }}>
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none',
                backgroundColor: '#021241', color: '#fff', fontSize: '0.875rem',
                fontWeight: '600', cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a2870'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#021241'}
            >
              Recargar página
            </button>
            {this.state.error && (
              <details style={{ marginTop: '16px', textAlign: 'left' }}>
                <summary style={{ color: '#6b7280', fontSize: '0.75rem', cursor: 'pointer' }}>Detalles técnicos</summary>
                <pre style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
