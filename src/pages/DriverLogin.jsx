import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DriverLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role !== 'driver') {
        logout();
        setError('Unauthorized. This portal is strictly for Delivery Partners.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, Delivery Partner ${user.first_name || user.username}!`);
      navigate('/driver/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'var(--clr-bg)' }}>
      <div className="auth-card" style={{ borderTop: '4px solid #6366f1' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'var(--space-lg)' }}>
          <div style={{ background: '#6366f1', padding: '8px', borderRadius: '50%' }}>
            <Truck size={24} color="white" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--clr-text)' }}>Delivery Partner Portal</span>
        </div>
        <h1 className="auth-card__title">Driver Sign In</h1>
        <p className="auth-card__sub">Access your delivery dashboard</p>

        {error && (
          <div style={{ background:'rgba(239,71,111,0.1)', border:'1px solid rgba(239,71,111,0.3)', color:'var(--clr-danger)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:'0.85rem', marginBottom:'var(--space-md)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Driver ID / Username</label>
            <input id="username" type="text" className="form-input" placeholder="e.g. driver"
              value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position:'relative' }}>
              <input id="password" type={showPwd ? 'text' : 'password'} className="form-input"
                placeholder="Your password" style={{ paddingRight:'2.5rem' }}
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position:'absolute', right:'0.8rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--clr-text-faint)', cursor:'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop:'var(--space-md)', padding:'0.85rem', background: '#6366f1', borderColor: '#6366f1' }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-md)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
          Want to become a Delivery Partner? <br/>
          <Link to="/driver/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Register Here</Link>
        </div>
      </div>
    </div>
  );
}
