// UBICACIÓN: src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Products from './pages/Products/Products.jsx';
import ProductDetail from './pages/ProductDetail/ProductDetail.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import VendedorDashboard from './pages/Vendedor/VendedorDashboard.jsx';
import AlmaceneroDashboard from './pages/Almacenero/AlmaceneroDashboard.jsx';
import Nosotros from './pages/Nosotros/Nosotros.jsx';
import Contact from './pages/Contact/Contact.jsx';
import Login from './components/layout/Auth/Login.jsx';
import Register from './components/layout/Auth/Register.jsx';
import ForgotPassword from './components/layout/Auth/ForgotPassword.jsx';
import ResetPassword from './components/layout/Auth/ResetPassword.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// 🚀 IMPORTACIÓN DE LA NUEVA PÁGINA DEL CARRITO - Añadimos .jsx
import CartPage from './pages/Cart/CartPage.jsx'; 

const AppRoutes = () => {
    const location = useLocation();
    
    // Obtener la ubicación de fondo desde el state (para modales como Login/Register)
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            {/* Rutas principales - se muestran detrás del modal o como páginas completas */}
            <Routes location={backgroundLocation || location}>
                {/* ========== RUTAS PÚBLICAS ========== */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* ✅ RUTA NUEVA: PÁGINA DEDICADA DEL CARRITO */}
                <Route path="/cart" element={<CartPage />} />

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
                
                {/* ========== 404 - Página no encontrada ========== */}
                <Route 
                    path="*" 
                    element={
                        <div className="text-center p-16 min-h-[400px] flex flex-col items-center justify-center">
                            <h2 className="text-4xl font-extrabold mb-4 text-red-600">
                                404
                            </h2>
                            <p className="text-xl text-gray-700 mb-8">
                                ¡Oops! Página no encontrada.
                            </p>
                            <a 
                                href="/" 
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                            >
                                Volver al inicio
                            </a>
                        </div>
                    } 
                />
            </Routes>

            {/* Modales de autenticación - Se muestran sobre las rutas principales si hay backgroundLocation */}
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