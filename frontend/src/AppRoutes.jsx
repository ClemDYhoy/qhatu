// C:\qhatu\frontend\src\AppRoutes.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import VendedorDashboard from './pages/Vendedor/VendedorDashboard';
import AlmaceneroDashboard from './pages/Almacenero/AlmaceneroDashboard';
import Nosotros from './pages/Nosotros/Nosotros';
import Contact from './pages/Contact/Contact';
import Login from './components/layout/Auth/Login';
import Register from './components/layout/Auth/Register';
import ForgotPassword from './components/layout/Auth/ForgotPassword';
import ResetPassword from './components/layout/Auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
    const location = useLocation();
    
    // Obtener la ubicación de fondo desde el state
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            {/* Rutas principales - se muestran detrás del modal */}
            <Routes location={backgroundLocation || location}>
                {/* ========== RUTAS PÚBLICAS ========== */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* ========== RUTAS PROTEGIDAS - ADMIN ========== */}
                <Route 
                    path="/admin/*" 
                    element={
                        <ProtectedRoute allowedRoles={['super_admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* ========== RUTAS PROTEGIDAS - VENDEDOR ========== */}
                <Route 
                    path="/vendedor/*" 
                    element={
                        <ProtectedRoute allowedRoles={['vendedor']}>
                            <VendedorDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* ========== RUTAS PROTEGIDAS - ALMACENERO ========== */}
                <Route 
                    path="/almacenero/*" 
                    element={
                        <ProtectedRoute allowedRoles={['almacenero']}>
                            <AlmaceneroDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Reset Password (no modal) */}
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Si no hay backgroundLocation, mostrar auth como página completa */}
                {!backgroundLocation && (
                    <>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </>
                )}
                
                {/* ========== 404 ========== */}
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

            {/* Modales de autenticación - solo se muestran si hay backgroundLocation */}
            {backgroundLocation && (
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            )}
        </>
    );
};

export default AppRoutes;