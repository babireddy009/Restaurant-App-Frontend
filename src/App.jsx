import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffDashboard from './pages/StaffDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import GalleryPage from './pages/GalleryPage';
import DriverPortal from './pages/DriverPortal';
import DriverDashboard from './pages/DriverDashboard';
import DriverLogin from './pages/DriverLogin';
import DriverRegister from './pages/DriverRegister';
import DriverLayout from './components/DriverLayout';

// Route guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ minHeight:'100vh' }}><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function StaffRoute({ children }) {
  const { user, isStaff, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ minHeight:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return children;
}

function DriverRoute({ children }) {
  const { user, isDriver, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ minHeight:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDriver) return <Navigate to="/" replace />;
  return children;
}

function MainLayout() {
  return (
    <div>
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
          <Route path="/staff/analytics" element={<StaffRoute><AnalyticsPage /></StaffRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Driver Routes using DriverLayout */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route path="login" element={<DriverLogin />} />
          <Route path="register" element={<DriverRegister />} />
          <Route path="dashboard" element={<DriverRoute><DriverDashboard /></DriverRoute>} />
          <Route path="order/:id" element={<DriverRoute><DriverPortal /></DriverRoute>} />
        </Route>

        {/* Main Restaurant Routes using MainLayout */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>

      <InstallPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background:'#1a1a2e', color:'#f0f0f5', border:'1px solid rgba(255,255,255,0.1)', fontFamily:'Inter,sans-serif', fontSize:'0.88rem' },
          success: { iconTheme:{ primary:'#06d6a0', secondary:'#1a1a2e' } },
          error: { iconTheme:{ primary:'#ef476f', secondary:'#1a1a2e' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
