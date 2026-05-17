import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/driver/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Driver Navbar */}
      <header style={{ 
        background: 'var(--clr-surface)', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--clr-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link to="/driver/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ background: 'var(--clr-primary)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            🛵
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text)' }}>
            Delivery Partner
          </span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', display: 'none', '@media(minWidth: 600px)': { display: 'block' } }}>
              {user.first_name || user.username}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-ghost" 
              style={{ color: 'var(--clr-danger)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px' }}
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      
      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}
