import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Nosotros from './pages/Nosotros/Nosotros';
import Contact from './pages/Contact/Contact';
import Login from './components/layout/Auth/Login';
import Register from './components/layout/Auth/Register';
import ForgotPassword from './components/layout/Auth/ForgotPassword';
import ResetPassword from './components/layout/Auth/ResetPassword';
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
                <div className="error-boundary" style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
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

function App() {
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
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route 
                                    path="*" 
                                    element={
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '60px 20px',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                                404 - Página no encontrada
                                            </h2>
                                            <p style={{ color: '#666', marginBottom: '2rem' }}>
                                                La página que buscas no existe
                                            </p>
                                            <a 
                                                href="/" 
                                                style={{
                                                    padding: '10px 24px',
                                                    background: '#007bff',
                                                    color: '#fff',
                                                    textDecoration: 'none',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                Volver al inicio
                                            </a>
                                        </div>
                                    } 
                                />
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