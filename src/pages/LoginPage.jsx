import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, handleGoogleLogin } = useAuth();
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
      toast.success(`Welcome back, ${user.first_name || user.username}!`);
      navigate(user.role === 'staff' || user.role === 'admin' ? '/staff' : '/');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'var(--space-lg)' }}>
          <ChefHat size={28} color="var(--clr-primary)" />
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--clr-primary)' }}>MSR Rayalasema Ruchulu</span>
        </div>
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__sub">Sign in to your account to continue</p>

        {error && (
          <div style={{ background:'rgba(239,71,111,0.1)', border:'1px solid rgba(239,71,111,0.3)', color:'var(--clr-danger)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:'0.85rem', marginBottom:'var(--space-md)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setLoading(true);
                const user = await handleGoogleLogin(credentialResponse.credential);
                toast.success(`Welcome back, ${user.first_name || user.username}!`);
                navigate(user.role === 'staff' || user.role === 'admin' ? '/staff' : '/');
              } catch (err) {
                setError(err?.response?.data?.detail || 'Google Login failed. Check if test config was bypassed.');
              } finally {
                setLoading(false);
              }
            }}
            onError={() => toast.error('Google Sign-In failed')}
            useOneTap
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-md) 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
          <span style={{ margin: '0 10px', fontSize: '0.85rem', color: 'var(--clr-text-faint)' }}>or sign in with username</span>
          <div style={{ flex: 1, height: 1, background: 'var(--clr-border)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" type="text" className="form-input" placeholder="Your username"
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
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop:'var(--space-md)', padding:'0.85rem' }} disabled={loading} id="login-btn">
            {loading ? <><div className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'var(--space-lg)', fontSize:'0.9rem', color:'var(--clr-text-muted)' }}>
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>

        <div style={{ marginTop:'var(--space-lg)', padding:'var(--space-md)', background:'rgba(0,0,0,0.02)', border:'1px solid var(--clr-border)', borderRadius:'var(--radius-sm)', fontSize:'0.78rem', color:'var(--clr-text-muted)' }}>
          <strong>Demo credentials:</strong><br />
          Admin: admin / admin@123<br />
          Staff: staff / staff@123
        </div>

        <div style={{ marginTop:'var(--space-md)', display:'flex', justifyContent:'space-between', fontSize:'0.82rem' }}>
          <Link to="/driver/login" className="auth-link">Driver Portal</Link>
          <a href="https://restaurant-app-backend-g8w3.onrender.com/admin/" target="_blank" rel="noopener noreferrer" className="auth-link">Django Admin Portal</a>
        </div>
      </div>
    </div>
  );
}
