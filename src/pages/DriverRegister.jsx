import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, User as UserIcon, Lock } from 'lucide-react';
import { registerDriver, sendOtp, verifyOtp } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Field({ id, label, type = 'text', placeholder, value, onChange, error, icon: Icon }) {
  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-faint)' }} />}
        <input
          id={id}
          type={type}
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          style={{ paddingLeft: Icon ? 40 : 16 }}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--clr-danger)', marginTop: 4, display: 'block' }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
}

export default function DriverRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Steps: 1 = Request OTP, 2 = Verify OTP, 3 = Complete Profile
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', password: '', password2: '', phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // 👉 STEP 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error("Please enter your email or phone number.");
    setErrors({});
    setLoading(true);
    try {
      await sendOtp({ identifier });
      toast.success('OTP sent! Check your console/email/SMS.');
      setStep(2);
    } catch (err) {
      setErrors(err?.response?.data || { general: "Failed to send OTP" });
      toast.error(err?.response?.data?.identifier?.[0] || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 👉 STEP 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) return toast.error("Please enter a valid 6-digit OTP.");
    setErrors({});
    setLoading(true);
    try {
      await verifyOtp({ identifier, otp_code: otpCode });
      toast.success('Verified! Let\'s complete your profile.');
      
      const defaultUsername = identifier.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + Math.floor(Math.random()*100);
      setForm(prev => ({ 
        ...prev, 
        username: defaultUsername,
        phone: !identifier.includes('@') ? identifier : '' 
      }));
      
      setStep(3);
    } catch (err) {
      setErrors(err?.response?.data || { general: "Invalid OTP" });
      toast.error(err?.response?.data?.otp_code?.[0] || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 👉 STEP 3: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    
    const isEmail = identifier.includes('@');
    const finalPayload = {
      ...form,
      email: isEmail ? identifier : '',
      phone: !isEmail ? identifier : form.phone,
    };

    try {
      await registerDriver(finalPayload);
      await login({ username: form.username, password: form.password });
      toast.success('Driver Account created! Welcome aboard 🛵');
      navigate('/driver/dashboard');
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') setErrors(data);
      else toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: 'var(--space-xl) 0', background: 'var(--clr-bg)' }}>
      <div className="auth-card" style={{ maxWidth: 500, borderTop: '4px solid #6366f1' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)', justifyContent: 'center' }}>
          <div style={{ background: '#6366f1', padding: '8px', borderRadius: '50%' }}>
            <Truck size={24} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--clr-text)' }}>
            Delivery Partner Portal
          </span>
        </div>

        {/* STEP 1: REQUEST OTP */}
        {step === 1 && (
          <>
            <h1 className="auth-card__title" style={{ textAlign: 'center' }}>Become a Partner</h1>
            <p className="auth-card__sub" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>Sign up to start delivering orders</p>
            
            <form onSubmit={handleRequestOTP} noValidate>
              <Field
                id="identifier" type="text" placeholder="Email or Phone Number"
                value={identifier} onChange={e => setIdentifier(e.target.value)} error={errors.identifier || errors.general}
                Icon={UserIcon}
              />
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-md)', padding: '0.85rem', background: '#6366f1', borderColor: '#6366f1' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending...</> : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <>
            <h1 className="auth-card__title" style={{ textAlign: 'center' }}>Verify OTP</h1>
            <p className="auth-card__sub" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
              We sent a 6-digit code to <strong style={{ color:'var(--clr-text)' }}>{identifier}</strong>
            </p>
            
            <form onSubmit={handleVerifyOTP} noValidate>
              <Field
                id="otpCode" type="text" placeholder="Enter 6-digit OTP"
                value={otpCode} onChange={e => setOtpCode(e.target.value)} error={errors.otp_code || errors.general}
                Icon={Lock}
              />
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-md)', padding: '0.85rem', background: '#6366f1', borderColor: '#6366f1' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Verifying...</> : 'Verify & Continue'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ color: 'var(--clr-text-muted)' }}>
                  Change Email/Mobile
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: PROFILE */}
        {step === 3 && (
          <>
            <h1 className="auth-card__title" style={{ textAlign: 'center' }}>Complete Profile</h1>
            <p className="auth-card__sub" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>Set up your delivery account.</p>
            
            <form onSubmit={handleRegister} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--space-md)' }}>
                <Field id="first_name" label="First Name" placeholder="John" value={form.first_name} onChange={setF('first_name')} error={errors.first_name} />
                <Field id="last_name" label="Last Name" placeholder="Doe" value={form.last_name} onChange={setF('last_name')} error={errors.last_name} />
              </div>
              <Field id="phone" label="Phone Number *" placeholder="Your active number" value={form.phone} onChange={setF('phone')} error={errors.phone} />
              <Field id="username" label="Username *" placeholder="Choose a username" value={form.username} onChange={setF('username')} error={errors.username} />
              <Field id="reg-password" label="Password *" type="password" placeholder="Min 8 characters" value={form.password} onChange={setF('password')} error={errors.password} />
              <Field id="password2" label="Confirm Password *" type="password" placeholder="Repeat your password" value={form.password2} onChange={setF('password2')} error={errors.password2} />

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-md)', padding: '0.85rem', background: '#6366f1', borderColor: '#6366f1' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating Account...</> : 'Create Driver Account'}
              </button>
            </form>
          </>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
            Already a partner? <Link to="/driver/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
