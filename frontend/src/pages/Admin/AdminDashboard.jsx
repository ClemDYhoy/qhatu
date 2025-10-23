import React from 'react';
import CarouselEditor from '../../components/CarouselEditor';
import './AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h2>Panel de Administración</h2>
            <CarouselEditor />
        </div>
    );
};

export default AdminDashboard;