import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import Home from './pages/Home/Home'
import Products from './pages/Products/Products'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Register from './pages/Admin/Register';
import Auth from './pages/Auth/Auth'; // Nueva página
import Nosotros from './pages/Nosotros/Nosotros';
import { useAuth } from './hooks/useAuth';
import './App.css'


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AppProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Register />} /> 
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/nosotros" element={<Nosotros />} /> 
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AppProvider>
  )
}

export default App