import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, ChefHat, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isStaff } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
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
  );
}
