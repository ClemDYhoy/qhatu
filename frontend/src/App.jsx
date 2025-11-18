// C:\qhatu\frontend\src\App.jsx
import React from 'react';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import AppRoutes from './AppRoutes';
import { AppProvider, useApp } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import './styles/global.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#dc3545' 
        }}>
          <h1>Error al ejecutar</h1>
          <p>Error: {this.state.error?.message || 'Intente recargar la página'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              background: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Componente interno que usa el contexto
function AppContent() {
  const { isLoading, authChecked } = useApp();

  // Mostrar loading mientras se verifica la sesión
  if (!authChecked || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#666' }}>Verificando sesión...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;