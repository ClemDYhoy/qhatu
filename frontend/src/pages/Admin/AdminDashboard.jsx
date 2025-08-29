import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import CarouselEditor from './CarouselEditor';

const AdminDashboard = () => {
const { user } = useAuth();

if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
}

return (
    <div>
    <h1>Dashboard Admin - Qhatu Marca</h1>
    <CarouselEditor />
    <button onClick={() => window.location.href = '/'}>Volver a Home</button>
    </div>
);
};

export default AdminDashboard;