// C:\qhatu\frontend\src\App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Nosotros from './pages/Nosotros/Nosotros';
import Login from './components/layout/Auth/Login';
import Register from './components/layout/Auth/Register';
import ForgotPassword from './components/layout/Auth/ForgotPassword';
import ResetPassword from './components/layout/Auth/ResetPassword';
import { CartProvider } from './contexts/CartContext';
import './styles/global.css';
import './styles/reset.css';
import './styles/variables.css';

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
        <div className="error-boundary" style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
          <h1>Error al ejecutar</h1>
          <p>Error: {this.state.error?.message || 'Intente recargar la página'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  console.log('App renderizado'); // Log para depuración
  return (
    <Router>
      <CartProvider>
        <ErrorBoundary>
          <div className="app-container">
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="*" element={<h2 style={{ textAlign: 'center', padding: '20px' }}>Página no encontrada</h2>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </CartProvider>
    </Router>
  );
}

export default App;