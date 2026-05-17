import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DeliveryChat from '../components/DeliveryChat';

import { getDriverOrderView, confirmDelivery } from '../api/endpoints';

export default function DriverPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Note: For this demo, we're assuming the driver is accessing this view via a direct link.
  // We'll use the public endpoints to get the order details.
  useEffect(() => {
    // Fetch order details via the public driver view endpoint
    getDriverOrderView(id)
      .then(res => {
        setOrder(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleConfirmDelivery = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await confirmDelivery(id, enteredOtp);
      
      toast.success('Delivery Confirmed successfully!');
      setOrder(prev => ({ ...prev, status: 'delivered' }));
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to confirm delivery');
      }
      setOtp(['', '', '', '']); // reset OTP
      document.getElementById('otp-input-0').focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh', background: 'var(--clr-bg)' }}><div className="spinner" /></div>;

  if (!order) return <div className="empty-state" style={{ minHeight: '100vh', background: 'var(--clr-bg)' }}><div className="empty-state__title">Order not found</div></div>;

  const isDelivered = order.status === 'delivered';

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh', padding: 'var(--space-lg)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'var(--clr-primary)', color: 'white', fontSize: '1.8rem', marginBottom: '16px' }}>
            🛵
          </div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>Driver Portal</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Delivery for Order #{order.id}</p>
        </div>

        {isDelivered ? (
          <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <CheckCircle size={64} color="var(--clr-success)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Delivery Completed</h2>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 'var(--space-xl)' }}>Great job! The order has been successfully delivered to the customer.</p>
            <button onClick={() => navigate('/orders')} className="btn btn-primary w-full" style={{ padding: '14px', borderRadius: '30px' }}>
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Details */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-primary)', marginBottom: '12px' }}>
                <MapPin size={18} />
                <h3 style={{ fontWeight: 700 }}>Customer Address</h3>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px' }}>{order.delivery_address}</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} /> Call
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setIsChatOpen(true)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <MessageCircle size={16} /> Chat
                </button>
              </div>
            </div>

            {/* OTP Section */}
            <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Confirm Delivery</h3>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>Ask the customer for their 4-digit Delivery PIN to confirm handover.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: 'var(--space-xl)' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`otp-input-${index - 1}`).focus();
                      }
                    }}
                    style={{
                      width: '50px',
                      height: '60px',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--clr-border)',
                      background: 'var(--clr-surface-2)',
                      color: 'var(--clr-text)'
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={handleConfirmDelivery} 
                className="btn btn-primary w-full" 
                disabled={otp.join('').length !== 4 || isSubmitting}
                style={{ padding: '16px', borderRadius: '30px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {isSubmitting ? 'Confirming...' : 'Complete Delivery'} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {isChatOpen && (
        <DeliveryChat 
          orderId={order.id} 
          driverName={order.driver_name} 
          driverPhone={order.driver_phone} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
}
