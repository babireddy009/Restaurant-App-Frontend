import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard, Phone, MessageCircle, Star } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { getOrderDetail, submitReview, cancelOrder } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import DeliveryChat from '../components/DeliveryChat';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const RESTAURANT_LOCATION = { lat: 15.625224761297483, lng: 79.62384590419613 }; // MSR Rayalaseema Ruchulu (Podili)

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '450px',
  borderRadius: 'var(--radius-lg)'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({ food_rating: 5, driver_rating: 5, comments: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    getOrderDetail(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
    const interval = setInterval(() => {
      getOrderDetail(id).then(r => setOrder(r.data)).catch(() => {});
    }, 3000); // fast polling every 3s for live updates
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (isLoaded && order?.status === 'out_for_delivery' && order?.driver_lat && order?.delivery_lat) {
      const fetchDirections = async () => {
        try {
          const directionsService = new window.google.maps.DirectionsService();
          const results = await directionsService.route({
            origin: { lat: order.driver_lat, lng: order.driver_lng },
            destination: { lat: order.delivery_lat, lng: order.delivery_lng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          });
          setDirections(results);
          if (results.routes[0]?.legs[0]) {
            setEta(results.routes[0].legs[0].duration.text);
            setDistance(results.routes[0].legs[0].distance.text);
          }
        } catch (err) {
          console.warn("Directions API failed (expected if API key doesn't have it enabled)", err);
        }
      };
      fetchDirections();
    }
  }, [isLoaded, order?.status, order?.driver_lat, order?.driver_lng, order?.delivery_lat, order?.delivery_lng]);

  if (loading) return <div className="loading-center" style={{ minHeight:'60vh' }}><div className="spinner" /></div>;
  if (!order) return <div className="empty-state"><div className="empty-state__title">Order not found</div></div>;

  const stepIdx = STEPS.indexOf(order.status);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await submitReview(order.id, reviewForm);
      setReviewSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const shareBillOnWhatsApp = () => {
    const itemsList = order.items?.map(item => `- ${item.quantity}x ${item.item_name} (₹${(parseFloat(item.item_price) * item.quantity).toFixed(0)})`).join('\n') || '';
    const subtotal = order.items?.reduce((acc, item) => acc + (parseFloat(item.item_price) * item.quantity), 0) || 0;
    const tax = Math.round(subtotal * 0.05);
    const grandTotal = parseFloat(order.total_amount);
    const paymentDisplay = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Paid)';
    
    const text = `*MSR Rayalaseema Ruchulu* 🍛\n*Bill Receipt - Order #${order.id}*\n\n` +
      `*Items Summary:*\n${itemsList}\n\n` +
      `*Subtotal:* ₹${subtotal.toFixed(2)}\n` +
      `*GST (5%):* ₹${tax.toFixed(2)}\n` +
      `*Delivery Fee:* FREE\n` +
      `*Grand Total:* ₹${grandTotal.toFixed(2)}\n\n` +
      `*Payment Method:* ${paymentDisplay}\n` +
      `*Address:* ${order.delivery_address}\n\n` +
      `Thank you for ordering with MSR Rayalaseema Ruchulu! 🛵`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleCancelOrder = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      const res = await cancelOrder(order.id);
      toast.success(res.data.message, { duration: 8000 });
      setOrder(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel the order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const renderStars = (rating, setRating) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          size={24} 
          fill={star <= rating ? '#fbbf24' : 'none'} 
          color={star <= rating ? '#fbbf24' : 'var(--clr-border)'}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="section">
      <div className="container" style={{ maxWidth:700 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '10px', marginBottom:'var(--space-lg)' }}>
          <Link to="/orders" className="btn btn-ghost btn-sm" style={{ display:'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={shareBillOnWhatsApp}
              className="btn btn-outline btn-sm"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                borderColor: '#25D366', 
                color: '#25D366', 
                background: 'rgba(37, 211, 102, 0.05)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '20px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={14} color="#25D366" /> Share Bill on WhatsApp
            </button>
            {order.payment_method === 'online' && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button 
                onClick={() => setShowCancelModal(true)}
                className="btn btn-danger btn-sm"
                disabled={cancelling}
                style={{ 
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-xl)' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem' }}>Order #{order.id}</h1>
            <p style={{ color:'var(--clr-text-muted)', fontSize:'0.85rem', marginTop:4 }}>
              {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', color:'var(--clr-success)', fontWeight:600 }}>
                <span className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--clr-success)', borderRadius: '50%' }}></span>
                Live Sync
              </div>
            )}
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Live Tracking Map */}
        {order.status === 'out_for_delivery' && (
          <div className="card" style={{ padding:'var(--space-md)', marginBottom:'var(--space-lg)' }}>
            <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'var(--space-md)', color:'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--clr-danger)', borderRadius: '50%' }}></span>
              LIVE TRACKING
            </h3>
            {isLoaded ? (
              order.driver_lat && order.delivery_lat ? (
                <>
                  {eta && (
                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Arrival</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-primary)' }}>{eta}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)' }}>Distance</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700 }}>{distance}</div>
                      </div>
                    </div>
                  )}
                  <GoogleMap
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={{ lat: order.driver_lat, lng: order.driver_lng }}
                    zoom={14}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    {directions && (
                      <DirectionsRenderer 
                        directions={directions} 
                        options={{ 
                          suppressMarkers: true, 
                          polylineOptions: { strokeColor: 'var(--clr-primary)', strokeWeight: 5 } 
                        }} 
                      />
                    )}
                    {/* Restaurant */}
                    <Marker 
                      position={RESTAURANT_LOCATION} 
                      icon={{ url: 'http://maps.google.com/mapfiles/kml/pal2/icon62.png', scaledSize: new window.google.maps.Size(32, 32) }} 
                      title="Restaurant"
                    />
                    {/* Driver */}
                    <Marker 
                      position={{ lat: order.driver_lat, lng: order.driver_lng }} 
                      icon={{ url: 'http://maps.google.com/mapfiles/kml/shapes/motorcycling.png', scaledSize: new window.google.maps.Size(32, 32) }} 
                      title="Driver"
                    />
                    {/* Destination */}
                    <Marker 
                      position={{ lat: order.delivery_lat, lng: order.delivery_lng }} 
                      icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }} 
                      title="Destination"
                    />
                  </GoogleMap>
                </>
              ) : (
                <div className="empty-state" style={{ minHeight: '300px' }}>Waiting for driver location...</div>
              )
            ) : (
              <div className="loading-center" style={{ minHeight: '300px' }}><div className="spinner" /></div>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginTop: '12px', textAlign: 'center', fontWeight: 600 }}>
              🏬 Restaurant &nbsp;&nbsp;|&nbsp;&nbsp; 🛵 Driver &nbsp;&nbsp;|&nbsp;&nbsp; 🔴 Your Destination
            </p>

            {/* Driver Details & Actions */}
            {order.driver_name && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--clr-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛵</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.driver_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Delivery Partner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.driver_phone && (
                    <a href={`tel:${order.driver_phone}`} className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: '20px', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.85rem' }}>
                      <Phone size={14} /> Call
                    </a>
                  )}
                  <button onClick={() => setIsChatOpen(true)} className="btn btn-outline" style={{ padding: '8px 12px', borderRadius: '20px', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.85rem' }}>
                    <MessageCircle size={14} /> Chat
                  </button>
                </div>
              </div>
            )}

            {/* Delivery OTP */}
            {order.delivery_otp && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1.5px dashed rgba(99, 102, 241, 0.4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Delivery PIN</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--clr-primary)', letterSpacing: '4px' }}>{order.delivery_otp}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '8px' }}>Share this PIN with the driver to confirm your delivery.</div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {order.status !== 'cancelled' && (
          <div className="card" style={{ padding:'var(--space-xl)', marginBottom:'var(--space-lg)' }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'var(--space-lg)', color:'var(--clr-text-muted)' }}>ORDER PROGRESS</h3>
            <div style={{ display:'flex', alignItems:'center' }}>
              {STEPS.map((step, i) => (
                <div key={step} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: i <= stepIdx ? 'var(--clr-primary)' : 'var(--clr-surface-3)', border: i <= stepIdx ? '2px solid var(--clr-primary)' : '2px solid var(--clr-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, transition:'all 0.3s', zIndex:1, color:i<=stepIdx?'white':'var(--clr-text-faint)' }}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ position:'absolute', left:'50%', top:14, width:'100%', height:2, background: i < stepIdx ? 'var(--clr-primary)' : 'var(--clr-border)', transition:'background 0.3s', zIndex:0 }} />
                  )}
                  <div style={{ fontSize:'0.65rem', color: i <= stepIdx ? 'var(--clr-primary)' : 'var(--clr-text-faint)', marginTop:6, textAlign:'center', textTransform:'capitalize' }}>
                    {step.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card" style={{ padding:'var(--space-xl)', marginBottom:'var(--space-lg)' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'var(--space-md)' }}>Items Ordered</h3>
          {order.items?.map(item => (
            <div key={item.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--clr-border)', fontSize:'0.9rem' }}>
              <div>
                <span style={{ fontWeight:600 }}>{item.item_name}</span>
                <span style={{ color:'var(--clr-text-muted)', marginLeft:8 }}>× {item.quantity}</span>
              </div>
              <span style={{ fontWeight:700, color:'var(--clr-primary)' }}>₹{parseFloat(item.item_price) * item.quantity}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, fontWeight:800, fontSize:'1.1rem' }}>
            <span>Total</span>
            <span style={{ color:'var(--clr-primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'var(--space-md)' }}>
          <div className="card" style={{ padding:'var(--space-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, color:'var(--clr-primary)' }}>
              <MapPin size={16} /> <strong style={{ fontSize:'0.85rem' }}>Delivery Address</strong>
            </div>
            <p style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)', lineHeight:1.6 }}>{order.delivery_address}</p>
          </div>
          <div className="card" style={{ padding:'var(--space-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, color:'var(--clr-primary)' }}>
              <span style={{ fontSize: '1rem' }}>🏪</span> <strong style={{ fontSize:'0.85rem' }}>Restaurant Location</strong>
            </div>
            <p style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)', lineHeight:1.6 }}>
              MSR Rayalaseema Ruchulu, Darsi Road, Podili<br />
              <a 
                href="https://maps.app.goo.gl/x47GgBFFouqvA1Bt6" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--clr-primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
              >
                📍 View on Google Maps
              </a>
            </p>
          </div>
          <div className="card" style={{ padding:'var(--space-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, color:'var(--clr-primary)' }}>
              <CreditCard size={16} /> <strong style={{ fontSize:'0.85rem' }}>Payment</strong>
            </div>
            <p style={{ fontSize:'0.85rem', color: order.payment_method === 'cod' ? 'var(--clr-text-muted)' : (order.is_paid ? 'var(--clr-success)' : 'var(--clr-warning)') }}>
              {order.payment_method === 'cod' 
                ? '💵 Cash on Delivery (To be paid)' 
                : (order.is_paid ? '✅ Paid via UPI/Card' : '⏳ Payment Pending')
              }
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="card" style={{ padding:'var(--space-lg)', marginTop:'var(--space-md)' }}>
            <strong style={{ fontSize:'0.85rem' }}>Special Instructions</strong>
            <p style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)', marginTop:4 }}>{order.notes}</p>
          </div>
        )}

        {order.status === 'delivered' && !order.review && !reviewSubmitted && (
          <div className="card" style={{ padding:'var(--space-xl)', marginTop:'var(--space-md)', background: 'linear-gradient(145deg, var(--clr-surface) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ fontSize:'1.2rem', fontFamily:'var(--font-display)', marginBottom:'var(--space-md)', color:'var(--clr-primary)' }}>Rate Your Experience</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-lg)' }}>We hope you enjoyed your meal! Please let us know how we did.</p>
            
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Food Quality</label>
                {renderStars(reviewForm.food_rating, (v) => setReviewForm(p => ({...p, food_rating: v})))}
              </div>
              
              {order.driver_name && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Delivery by {order.driver_name}</label>
                  {renderStars(reviewForm.driver_rating, (v) => setReviewForm(p => ({...p, driver_rating: v})))}
                </div>
              )}
              
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Comments (Optional)</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Tell us what you loved or what could be improved..."
                  value={reviewForm.comments}
                  onChange={e => setReviewForm(p => ({...p, comments: e.target.value}))}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {(order.review || reviewSubmitted) && (
          <div className="card" style={{ padding:'var(--space-xl)', marginTop:'var(--space-md)', textAlign: 'center', background: 'rgba(6,214,160,0.05)', border: '1px solid rgba(6,214,160,0.2)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
            <h3 style={{ fontSize:'1.1rem', fontWeight: 700, color:'var(--clr-success)' }}>Thank you for your feedback!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginTop: '4px' }}>Your review helps us improve our service.</p>
          </div>
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

      {showCancelModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="custom-modal-header">
              <span className="warning-icon-badge">⚠️</span>
              <h2>Cancel Order #{order.id}</h2>
            </div>
            
            <div className="custom-modal-body">
              {(() => {
                const beforePrepare = order.status === 'pending' || order.status === 'confirmed';
                return beforePrepare ? (
                  <div className="policy-block refund-eligible">
                    <div className="policy-pill success">100% Refundable</div>
                    <p className="policy-message">
                      The kitchen has not started preparing your food yet. You are eligible for a <strong>full refund</strong>.
                    </p>
                    <div className="refund-summary-row">
                      <span>Refund Amount:</span>
                      <span className="refund-val success">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                    <p className="policy-timeline">
                      * The refund will be credited back to your original payment method within 5-10 business days.
                    </p>
                  </div>
                ) : (
                  <div className="policy-block refund-charge">
                    <div className="policy-pill danger">100% Cancellation Charge Applies</div>
                    <p className="policy-message">
                      Our kitchen has already started preparing your fresh food! If you cancel now, you will be charged a 100% cancellation fee as per Zomato's refund policy.
                    </p>
                    <div className="refund-summary-row">
                      <span>Refund Amount:</span>
                      <span className="refund-val danger">₹0.00</span>
                    </div>
                    <div className="fee-summary-row">
                      <span>Cancellation Fee:</span>
                      <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                    <p className="policy-timeline warning-text">
                      * No refund will be issued back to your account.
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="custom-modal-footer">
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="btn btn-ghost" 
                style={{ borderRadius: '25px', padding: '10px 24px', flex: 1 }}
              >
                Keep My Order
              </button>
              <button 
                onClick={handleCancelOrder} 
                className="btn btn-danger" 
                style={{ borderRadius: '25px', padding: '10px 24px', flex: 1 }}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>

          <style>{`
            .custom-modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              z-index: 1000;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: modal-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              padding: var(--space-md);
            }

            .custom-modal-card {
              background: var(--grad-card, #fff);
              border: 1px solid var(--clr-border);
              border-radius: var(--radius-lg);
              width: 100%;
              max-width: 480px;
              box-shadow: var(--shadow-lg);
              display: flex;
              flex-direction: column;
              animation: modal-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              overflow: hidden;
            }

            .custom-modal-header {
              padding: var(--space-lg) var(--space-lg) var(--space-md);
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: var(--space-sm);
              border-bottom: 1px solid var(--clr-border);
            }

            .warning-icon-badge {
              font-size: 2.2rem;
              line-height: 1;
              animation: warning-pulse 1.5s ease-in-out infinite;
            }

            .custom-modal-header h2 {
              font-family: var(--font-display);
              font-size: 1.4rem;
              font-weight: 800;
              color: var(--clr-text);
              margin: 0;
            }

            .custom-modal-body {
              padding: var(--space-lg);
              color: var(--clr-text-muted);
            }

            .policy-block {
              display: flex;
              flex-direction: column;
              gap: var(--space-md);
            }

            .policy-pill {
              align-self: center;
              padding: 6px 16px;
              border-radius: var(--radius-full);
              font-size: 0.78rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .policy-pill.success {
              background: rgba(16, 185, 129, 0.12);
              color: var(--clr-success);
              border: 1.5px solid rgba(16, 185, 129, 0.25);
            }

            .policy-pill.danger {
              background: rgba(239, 68, 68, 0.12);
              color: var(--clr-danger);
              border: 1.5px solid rgba(239, 68, 68, 0.25);
            }

            .policy-message {
              font-size: 0.92rem;
              line-height: 1.5;
              text-align: center;
              color: var(--clr-text-muted);
            }

            .refund-summary-row, .fee-summary-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--space-md) var(--space-lg);
              background: var(--clr-surface-2);
              border-radius: var(--radius-md);
              font-weight: 700;
              font-size: 0.95rem;
            }

            .fee-summary-row {
              margin-top: calc(-1 * var(--space-xs));
              background: rgba(239, 68, 68, 0.03);
              border: 1px dashed rgba(239, 68, 68, 0.15);
              font-weight: 600;
              color: var(--clr-text-muted);
            }

            .refund-val {
              font-size: 1.15rem;
              font-weight: 800;
            }

            .refund-val.success {
              color: var(--clr-success);
            }

            .refund-val.danger {
              color: var(--clr-danger);
            }

            .policy-timeline {
              font-size: 0.75rem;
              color: var(--clr-text-faint);
              text-align: center;
              line-height: 1.4;
            }

            .policy-timeline.warning-text {
              color: var(--clr-danger);
              font-weight: 600;
            }

            .custom-modal-footer {
              padding: var(--space-lg);
              display: flex;
              gap: var(--space-md);
              border-top: 1px solid var(--clr-border);
              background: var(--clr-surface);
            }

            @keyframes modal-fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes modal-slide-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @keyframes warning-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
