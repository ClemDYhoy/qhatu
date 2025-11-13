// C:\qhatu\frontend\src\App.jsx
import React from 'react';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import AppRoutes from './AppRoutes';
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

function App() {
    return (
        <CartProvider>
            <ErrorBoundary>
                <div className="app-container">
                    <Header />
                    <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                        <AppRoutes />
                    </main>
                    <Footer />
                </div>
            </ErrorBoundary>
        </CartProvider>
    );
}

export default App;