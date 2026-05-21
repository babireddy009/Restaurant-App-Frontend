import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, FileText, FlaskConical, Crosshair } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createPayment, verifyPayment } from '../api/endpoints';
import api from '../api/client';
import toast from 'react-hot-toast';
import SuccessOverlay from '../components/SuccessOverlay';

const IS_DEV = import.meta.env.DEV; // true when running `npm run dev`

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '250px',
  borderRadius: 'var(--radius-md)',
  marginTop: '12px',
  border: '1px solid var(--clr-border)'
};

export default function CheckoutPage() {
  const { items, totalPrice, cartPayload, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [detecting, setDetecting] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successOrderId, setSuccessOrderId] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const deliveryFee = totalPrice > 500 ? 0 : 49;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDeliveryLat(lat);
        setDeliveryLng(lng);

        try {
          if (!window.google?.maps?.Geocoder) throw new Error('Maps not loaded');
          const geocoder = new window.google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results[0]) {
            setAddress(response.results[0].formatted_address);
            toast.success('Location detected!');
          }
        } catch (err) {
          console.warn("Geocoding failed", err);
          toast.success('GPS Location secured! 📍', { duration: 4000 });
          toast('Please type your street address manually (Geocoding API not enabled on your key).', { duration: 6000, icon: '✍️' });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        toast.error('Location access denied or failed.');
      }
    );
  };

  // ─── Validate common fields before any payment ────────────────────────────
  const validate = () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return false; }
    if (!user) { toast.error('Please login to place an order'); navigate('/login'); return false; }
    if (items.length === 0) { toast.error('Your cart is empty'); return false; }
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 💳 REAL Razorpay payment (requires API keys in .env)
  // ─────────────────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!validate()) return;

    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway failed to load. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order in Django
      const payload = {
        items: cartPayload,
        delivery_address: address,
        notes,
        payment_method: paymentMethod === 'cod' ? 'cod' : 'online',
      };
      if (deliveryLat && deliveryLng) {
        payload.delivery_lat = deliveryLat;
        payload.delivery_lng = deliveryLng;
      }
      const orderRes = await createOrder(payload);
      const orderId = orderRes.data.id;

      // If Cash on Delivery, bypass Razorpay entirely!
      if (paymentMethod === 'cod') {
        setSuccessMessage('Order Confirmed Successfully!');
        setSuccessOrderId(orderId);
        setShowSuccess(true);
        return;
      }

      // Step 2: Create Razorpay order via backend
      let payRes;
      try {
        payRes = await createPayment(orderId);
      } catch (payErr) {
        const msg = payErr?.response?.data?.error || 'Payment initiation failed.';
        toast.error(msg, { duration: 6000 });
        setLoading(false);
        return;
      }

      const { razorpay_order_id, amount, key } = payRes.data;

      // Step 3: Open Razorpay checkout modal
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'MSR Rayalasema Ruchulu',
        description: `Order #${orderId}`,
        order_id: razorpay_order_id,
        prefill: {
          name:    `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          email:   user.email  || '',
          contact: user.phone  || '',
          method:  paymentMethod === 'upi' ? 'upi' : undefined,
        },
        theme: { color: '#ff6b35' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            setSuccessMessage('Payment Successful! Order Confirmed.');
            setSuccessOrderId(orderId);
            setShowSuccess(true);
          } catch (verErr) {
            toast.error(verErr?.response?.data?.error || 'Signature verification failed.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled. Order saved — you can retry.', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description || 'Unknown error'}`, { duration: 6000 });
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail
        || err?.message || 'Something went wrong. Please try again.';
      toast.error(errMsg, { duration: 5000 });
      setLoading(false);
    }
  };

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state__icon">🛒</div>
            <div className="empty-state__title">Your cart is empty</div>
            <p style={{ marginBottom: 'var(--space-lg)' }}>Add some food items before checking out</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <SuccessOverlay 
        show={showSuccess} 
        message={successMessage} 
        onComplete={() => {
          clearCart();
          navigate(`/orders/${successOrderId}`);
        }} 
      />
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1 className="page-header__title">Checkout</h1>
            <p className="page-header__sub">Almost there! Confirm your order</p>
          </div>
          <Link to="/menu" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
            ← Add More Items / Back to Menu
          </Link>
        </div>

        <div className="checkout-grid">
          {/* LEFT: Delivery & Notes */}
          <div>
            <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="var(--clr-primary)" /> Delivery Address
                </h2>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={handleDetectLocation} 
                  disabled={detecting || !isLoaded}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                >
                  {detecting ? <div className="spinner" style={{width: 14, height: 14, borderWidth: 2}} /> : <Crosshair size={14} />}
                  Use Current Location
                </button>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="delivery-address">Full delivery address *</label>
                <textarea
                  id="delivery-address"
                  className="form-textarea"
                  placeholder="Enter your complete address (house no., street, area, city, pincode)"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={4}
                />
                
                {deliveryLat && deliveryLng && isLoaded && (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--clr-primary)', margin: 0 }}>📍 Adjust Pin Location</label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-faint)' }}>Drag to refine</span>
                    </div>
                    <GoogleMap
                      mapContainerStyle={MAP_CONTAINER_STYLE}
                      center={{ lat: deliveryLat, lng: deliveryLng }}
                      zoom={17}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      <Marker 
                        position={{ lat: deliveryLat, lng: deliveryLng }} 
                        draggable={true}
                        onDragEnd={async (e) => {
                          const lat = e.latLng.lat();
                          const lng = e.latLng.lng();
                          setDeliveryLat(lat);
                          setDeliveryLng(lng);
                          
                          // Try to update address text when pin is dragged
                          try {
                            if (window.google?.maps?.Geocoder) {
                              const geocoder = new window.google.maps.Geocoder();
                              const response = await geocoder.geocode({ location: { lat, lng } });
                              if (response.results[0]) {
                                setAddress(response.results[0].formatted_address);
                              }
                            }
                          } catch (err) {
                            // ignore quietly on drag
                          }
                        }}
                      />
                    </GoogleMap>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--clr-primary)" /> Order Items ({items.length})
              </h2>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--clr-border)', fontSize: '0.9rem' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong style={{ color: 'var(--clr-primary)' }}>
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Special Instructions</h2>
              <textarea
                id="order-notes"
                className="form-textarea"
                placeholder="Allergies, extra spice, no onion... (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div>
            <div className="checkout-summary">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Order Summary</h2>

              <div className="checkout-total-row">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--clr-success)' : 'inherit' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="checkout-total-row">
                <span>GST (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="checkout-total-row">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {deliveryFee > 0 && (
                <div style={{ background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--clr-accent)', marginTop: 'var(--space-md)' }}>
                  Add ₹{(500 - totalPrice).toFixed(0)} more for FREE delivery!
                </div>
              )}

              {/* ── Payment Method Selector ── */}
              <div style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Google Pay / PhonePe (UPI Direct) */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    border: paymentMethod === 'upi' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer', 
                    background: paymentMethod === 'upi' ? 'rgba(255,107,53,0.06)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="upi" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')} 
                      style={{ accentColor: 'var(--clr-primary)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Google Pay / PhonePe / Paytm (UPI)</span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          background: 'linear-gradient(135deg, #fd7e14, #ff6b35)', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>
                          ⚡ Direct App / QR
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)', marginTop: 4 }}>
                        Redirects directly to PhonePe, Google Pay, or Paytm for fast checkout.
                      </span>
                    </div>
                  </label>

                  {/* Standard Cards & Netbanking */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    border: paymentMethod === 'online' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer', 
                    background: paymentMethod === 'online' ? 'rgba(255,107,53,0.06)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="online" 
                      checked={paymentMethod === 'online'} 
                      onChange={() => setPaymentMethod('online')} 
                      style={{ accentColor: 'var(--clr-primary)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cards, Netbanking or Wallet</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)', marginTop: 4 }}>
                        Credit/Debit Card (Visa, Mastercard, RuPay), Netbanking, or Wallets.
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    border: paymentMethod === 'cod' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer', 
                    background: paymentMethod === 'cod' ? 'rgba(255,107,53,0.06)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')} 
                      style={{ accentColor: 'var(--clr-primary)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cash on Delivery (COD)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)', marginTop: 4 }}>
                        Pay with cash when your food arrives.
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* ── Checkout Button ── */}
              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 'var(--space-md)', padding: '1rem' }}
                onClick={handlePayment}
                disabled={loading}
                id="pay-now-btn"
              >
                {loading
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                  : paymentMethod !== 'cod' ? <>🔒 Pay ₹{grandTotal.toFixed(2)} Securely</> : <>🛵 Confirm Order (COD)</>
                }
              </button>

              {paymentMethod !== 'cod' && (
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-faint)', marginTop: 8, marginBottom: 12 }}>
                  🔒 Secured by Razorpay · 256-bit SSL
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
