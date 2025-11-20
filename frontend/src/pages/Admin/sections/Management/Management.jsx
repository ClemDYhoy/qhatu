// sections/Management/Management.jsx
import React, { useState } from 'react';
import UserManagement from './components/UserManagement';
import RolesConfig from './components/RolesConfig';
import CarouselManager from './components/CarouselManager';
import CategoryManager from './components/CategoryManager';
import './Management.css';

const Management = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'carousels' | 'categories'

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'roles', label: 'Roles', icon: '🔐' },
    { id: 'carousels', label: 'Carruseles', icon: '🎨' },
    { id: 'categories', label: 'Categorías', icon: '📂' }
  ];

  return (
    <div className="management-section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1>⚙️ Gestión del Sistema</h1>
          <p className="section-subtitle">
            Administración de usuarios, roles, carruseles y categorías
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="management-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`management-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido según tab activo */}
      <div className="management-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'roles' && <RolesConfig />}
        {activeTab === 'carousels' && <CarouselManager />}
        {activeTab === 'categories' && <CategoryManager />}
      </div>
    </div>
  );
};

export default Management;

/* 
CSS ESPECIFICACIONES (Management.css):
- .management-section: padding 30px
- .section-header: margin-bottom 30px
- .section-header h1: margin 0 0 5px 0, font-size 28px, color #2c3e50
- .section-subtitle: margin 0, font-size 14px, color #7f8c8d
- .management-tabs: display flex, gap 10px, margin-bottom 30px, border-bottom 2px solid #ecf0f1
- .management-tab: padding 15px 25px, background none, border none, border-bottom 3px solid transparent, cursor pointer, display flex, align-items center, gap 10px, transition all 0.3s, color #7f8c8d
- .management-tab:hover: color #2c3e50, background rgba(52,152,219,0.05)
- .management-tab.active: color #3498db, border-bottom-color #3498db, font-weight 600
- .tab-icon: font-size 20px
- .tab-label: font-size 15px
- .management-content: background white, border-radius 12px, padding 25px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
*/