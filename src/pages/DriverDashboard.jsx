import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Navigation, CheckCircle } from 'lucide-react';
import { getAvailableDeliveries, getMyDeliveries, assignDriver } from '../api/endpoints';
import { playNotificationSound } from '../utils/audio';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'mine'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const previousOrdersRef = useRef(null);

  const fetchOrders = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const fetcher = activeTab === 'available' ? getAvailableDeliveries : getMyDeliveries;
    fetcher()
      .then(res => {
        const newOrders = res.data.results || res.data;
        
        // Notification Logic for Available Orders
        if (isBackground && activeTab === 'available' && previousOrdersRef.current) {
          const oldIds = new Set(previousOrdersRef.current.map(o => o.id));
          const hasNew = newOrders.some(o => !oldIds.has(o.id));
          
          if (hasNew) {
            playNotificationSound();
            toast.success('🛵 New Order Available for Pickup!', { duration: 5000, style: { border: '2px solid var(--clr-primary)', padding: '16px' } });
          }
        }
        
        previousOrdersRef.current = newOrders;
        setOrders(newOrders);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => fetchOrders(true), 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleClaimOrder = async (orderId) => {
    setClaiming(orderId);
    try {
      await assignDriver(orderId);
      toast.success('Order claimed successfully!');
      // Move to "mine" tab after claiming
      setActiveTab('mine');
    } catch {
      toast.error('Failed to claim order. Someone else might have taken it.');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="section" style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Driver Dashboard</h1>
            <p style={{ color: 'var(--clr-text-muted)', marginTop: 4 }}>Manage your deliveries</p>
          </div>
          <button className="btn btn-ghost" onClick={() => fetchOrders(false)} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <button 
            className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, borderRadius: '30px' }}
            onClick={() => setActiveTab('available')}
          >
            Available Orders
          </button>
          <button 
            className={`btn ${activeTab === 'mine' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, borderRadius: '30px' }}
            onClick={() => setActiveTab('mine')}
          >
            My Deliveries
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🛵</div>
            <div className="empty-state__title">
              {activeTab === 'available' ? 'No orders waiting for pickup' : 'You have no active deliveries'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--clr-primary)' }}>Order #{order.id}</div>
                  <div style={{ fontSize: '0.8rem', background: 'var(--clr-surface-2)', padding: '4px 8px', borderRadius: '4px' }}>
                    {order.payment_method === 'cod' ? '💵 COD' : '💳 PAID'}
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
                  📍 {order.delivery_address}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--clr-border)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)', textTransform: 'uppercase' }}>Customer</span>
                    <div style={{ fontWeight: 600 }}>{order.user?.username || 'Guest'}</div>
                  </div>
                  
                  {activeTab === 'available' ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleClaimOrder(order.id)}
                      disabled={claiming === order.id}
                      style={{ borderRadius: '20px', padding: '8px 24px' }}
                    >
                      {claiming === order.id ? 'Claiming...' : 'Claim Order'}
                    </button>
                  ) : (
                    <Link to={`/driver/order/${order.id}`} className="btn" style={{ background: 'var(--clr-accent)', color: 'var(--clr-bg)', borderRadius: '20px', padding: '8px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      Start Delivery <Navigation size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
