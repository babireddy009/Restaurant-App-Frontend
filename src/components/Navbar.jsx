import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, ChefHat, LayoutDashboard, Home, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isStaff } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="navbar__brand">
            <ChefHat size={24} color="#ff6b35" />
            <span className="navbar__logo">MSR Rayalasema Ruchulu</span>
          </Link>

          <div className="navbar__nav">
            <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/menu" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Menu</NavLink>
            {user && <NavLink to="/orders" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>My Orders</NavLink>}
            {isStaff && <NavLink to="/staff" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>}
          </div>

          <div className="navbar__actions">
            <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Open cart">
              <ShoppingCart size={16} />
              <span>Cart</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {user ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link to="/profile" className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
                  <User size={14} />
                  <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.first_name || user.username}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-icon" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'active' : ''}`}>
          <ChefHat size={20} />
          <span>Menu</span>
        </NavLink>
        <button className="mobile-bottom-nav__item" onClick={() => setIsOpen(true)}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="mobile-cart-badge">{totalItems}</span>}
          </div>
          <span>Cart</span>
        </button>
        {user ? (
          <NavLink to="/orders" className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={20} />
            <span>Orders</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className={({ isActive }) => `mobile-bottom-nav__item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </>
  );
}
