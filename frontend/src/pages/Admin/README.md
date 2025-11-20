# 🏪 AdminDashboard - Documentación

## 📁 Estructura del Proyecto

```
Admin/
├── AdminDashboard.jsx          # Componente principal (orquestador)
├── AdminDashboard.css          # Estilos globales
│
├── components/                  # Componentes compartidos (5)
│   ├── index.js                # Exportaciones
│   ├── Sidebar.jsx             # Navegación lateral
│   ├── Sidebar.css
│   ├── StatCard.jsx            # Tarjeta de estadística
│   ├── StatCard.css
│   ├── DataTable.jsx           # Tabla genérica
│   ├── DataTable.css
│   ├── Modal.jsx               # Modal genérico
│   ├── Modal.css
│   ├── AIAlert.jsx             # Alerta de IA
│   └── AIAlert.css
│
└── sections/                    # Secciones principales (4)
    ├── index.js                # Exportaciones
    │
    ├── Dashboard/              # 📊 Vista General
    │   ├── Dashboard.jsx
    │   ├── Dashboard.css
    │   └── components/
    │       ├── StatsGrid.jsx
    │       ├── StatsGrid.css
    │       ├── SalesChart.jsx
    │       ├── SalesChart.css
    │       ├── QuickAlerts.jsx
    │       └── QuickAlerts.css
    │
    ├── Inventory/              # 📦 Inventario
    │   ├── Inventory.jsx
    │   ├── Inventory.css
    │   └── components/
    │       ├── ProductList.jsx
    │       ├── ProductList.css
    │       ├── ProductForm.jsx
    │       ├── ProductForm.css
    │       ├── StockAlerts.jsx
    │       ├── StockAlerts.css
    │       ├── ExpiryAlerts.jsx
    │       └── ExpiryAlerts.css
    │
    ├── AIReports/              # 🤖 Reportes IA
    │   ├── AIReports.jsx
    │   ├── AIReports.css
    │   └── components/
    │       ├── PredictionPanel.jsx
    │       ├── PredictionPanel.css
    │       ├── RecommendationsPanel.jsx
    │       ├── RecommendationsPanel.css
    │       ├── SellerAssistPanel.jsx
    │       ├── SellerAssistPanel.css
    │       ├── CarouselSuggestions.jsx
    │       └── CarouselSuggestions.css
    │
    └── Management/             # ⚙️ Gestión
        ├── Management.jsx
        ├── Management.css
        └── components/
            ├── UserManagement.jsx
            ├── UserManagement.css
            ├── RolesConfig.jsx
            ├── RolesConfig.css
            ├── CarouselManager.jsx
            ├── CarouselManager.css
            ├── CategoryManager.jsx
            └── CategoryManager.css
```

## 🎯 Secciones Principales

### 1. 📊 Dashboard - Vista General
**Ruta**: `sections/Dashboard/Dashboard.jsx`

**Componentes**:
- `StatsGrid`: Grid de tarjetas con estadísticas (ventas, productos, usuarios)
- `SalesChart`: Gráfico de ventas de los últimos 7 días
- `QuickAlerts`: Alertas rápidas de las 3 IAs

**Datos que necesita**:
- Total ventas del día/mes
- Total productos
- Stock crítico
- Usuarios activos
- Ventas por día (últimos 7 días)
- Alertas de las IAs

---

### 2. 📦 Inventory - Gestión de Inventario
**Ruta**: `sections/Inventory/Inventory.jsx`

**Componentes**:
- `ProductList`: Tabla de productos con búsqueda y ordenamiento
- `ProductForm`: Formulario crear/editar producto
- `StockAlerts`: Alertas de productos con stock crítico
- `ExpiryAlerts`: Alertas de productos próximos a vencer

**Datos que necesita**:
- Lista de productos (GET /api/products)
- Categorías (GET /api/categories)
- Productos con stock < 10
- Productos próximos a vencer (< 30 días)

**Acciones**:
- Crear producto (POST /api/products)
- Editar producto (PUT /api/products/:id)
- Eliminar producto (DELETE /api/products/:id)

---

### 3. 🤖 AIReports - Reportes Inteligentes
**Ruta**: `sections/AIReports/AIReports.jsx`

**Tabs**:
1. **PredictionPanel**: IA de Predicción de Inventario
   - Productos en riesgo de agotarse
   - Productos próximos a vencer
   - Productos con sobre-stock

2. **RecommendationsPanel**: IA de Recomendaciones
   - Oportunidades de cross-selling
   - Categorías en tendencia
   - Productos para destacar

3. **SellerAssistPanel**: IA Asistente del Vendedor
   - Clientes inactivos
   - Carritos abandonados
   - Oportunidades de upselling

4. **CarouselSuggestions**: Sugerencias de Carruseles
   - Carruseles generados automáticamente por IA
   - Aprobar, editar o rechazar sugerencias

**Datos que necesita**:
- Predicciones de la IA (cuando esté lista)
- Recomendaciones de productos relacionados
- Análisis de comportamiento de clientes
- Sugerencias de carruseles automáticos

---

### 4. ⚙️ Management - Gestión del Sistema
**Ruta**: `sections/Management/Management.jsx`

**Tabs**:
1. **UserManagement**: Gestión de Usuarios
   - Lista de usuarios con roles
   - Crear/editar/eliminar usuarios
   - Activar/desactivar usuarios

2. **RolesConfig**: Configuración de Roles
   - Vista de roles y permisos
   - Editar permisos (excepto super_admin)

3. **CarouselManager**: Gestión de Carruseles
   - Carruseles activos/inactivos
   - Crear/editar/eliminar carruseles
   - Activar/desactivar carruseles

4. **CategoryManager**: Gestión de Categorías
   - Árbol de categorías
   - Crear/editar/eliminar categorías
   - Vista de productos por categoría

**Datos que necesita**:
- Usuarios (GET /api/users)
- Roles (GET /api/roles)
- Carruseles (GET /api/carousels)
- Categorías (GET /api/categories)

---

## 🔧 Componentes Compartidos

### Sidebar
**Props**:
- `activeSection`: string - Sección activa
- `onSectionChange`: function - Callback al cambiar sección
- `user`: object - Usuario actual
- `onLogout`: function - Callback al cerrar sesión

### StatCard
**Props**:
- `icon`: string - Emoji o icono
- `label`: string - Etiqueta
- `value`: string/number - Valor a mostrar
- `trend`: 'up' | 'down' | null - Tendencia
- `trendValue`: string - Valor de tendencia (ej: "+15%")
- `color`: 'primary' | 'success' | 'warning' | 'danger'

### DataTable
**Props**:
- `columns`: array - Columnas [{key, label, sortable}]
- `data`: array - Datos a mostrar
- `actions`: function - Función que retorna JSX con acciones
- `searchable`: boolean - Habilitar búsqueda
- `sortable`: boolean - Habilitar ordenamiento

### Modal
**Props**:
- `isOpen`: boolean - Modal visible/oculto
- `onClose`: function - Callback al cerrar
- `title`: string - Título del modal
- `children`: ReactNode - Contenido
- `size`: 'small' | 'medium' | 'large'
- `footer`: ReactNode - Footer opcional

### AIAlert
**Props**:
- `type`: 'prediction' | 'recommendation' | 'assistant'
- `severity`: 'info' | 'warning' | 'critical'
- `title`: string - Título
- `message`: string - Mensaje
- `data`: object - Datos adicionales
- `actions`: array - Botones de acción

---

## 🚀 Próximos Pasos

### Fase 1: Conectar con APIs Reales ✅
1. Reemplazar datos simulados en Dashboard
2. Conectar Inventory con `/api/products`
3. Implementar CRUD de productos completo

### Fase 2: Implementar Formularios ⏳
1. ProductForm completo con validaciones
2. UserForm con gestión de roles
3. CategoryForm con árbol jerárquico

### Fase 3: Integrar IAs 🔮
1. Conectar con IA de Predicción de Inventario
2. Conectar con IA de Recomendaciones
3. Conectar con IA Asistente del Vendedor
4. Implementar aprobación de carruseles automáticos

### Fase 4: Optimizaciones 🎨
1. Agregar paginación en tablas
2. Implementar filtros avanzados
3. Agregar exportación de reportes (PDF/Excel)
4. Mejorar responsividad mobile

---

## 📝 Notas de Implementación

### Estado de Componentes
- ✅ Estructura completa creada
- ✅ JSX base implementado
- ✅ CSS especificado en comentarios
- ⏳ Conectar con APIs reales
- ⏳ Implementar validaciones
- ⏳ Conectar con IAs

### Datos Simulados
Todos los componentes actualmente usan datos simulados (hardcoded) que se encuentran en:
- `useState()` inicial de cada componente
- Marcados con comentario: `// Datos simulados - luego vendrán de la API`

### TODOs Pendientes
Buscar en el código por `// TODO:` para encontrar funcionalidades pendientes:
- Implementación de formularios completos
- Llamadas a API reales
- Validaciones de formularios
- Manejo de errores mejorado
- Confirmaciones de acciones

---

## 🎨 Guía de Estilos

### Colores Principales
- **Primary**: #3498db (Azul)
- **Success**: #27ae60 (Verde)
- **Warning**: #f39c12 (Naranja)
- **Danger**: #e74c3c (Rojo)
- **Info**: #3498db (Azul claro)
- **Secondary**: #95a5a6 (Gris)

### Tipografía
- **Títulos H1**: 28px, bold
- **Títulos H2**: 24px, semibold
- **Títulos H3**: 18px, semibold
- **Texto normal**: 14px
- **Texto pequeño**: 12-13px

### Espaciados
- **Gap pequeño**: 8-10px
- **Gap medio**: 15-20px
- **Gap grande**: 25-30px
- **Padding cards**: 20-25px
- **Border radius**: 6-12px

---

## 🐛 Troubleshooting

### Error: Cannot find module
**Solución**: Verificar que todos los archivos existan en las rutas correctas según la estructura.

### Datos no se actualizan
**Solución**: Verificar que las llamadas a API estén correctamente implementadas y que los estados se actualicen.

### Estilos no se aplican
**Solución**: Verificar que los archivos CSS estén importados correctamente en cada componente.

---

## 📞 Contacto y Soporte

Para dudas o problemas con la implementación, revisar:
1. Este README
2. Comentarios en el código (marcados con `/* */`)
3. TODOs pendientes (marcados con `// TODO:`)