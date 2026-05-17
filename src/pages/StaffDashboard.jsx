import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Filter, BarChart2 } from 'lucide-react';
import { getStaffOrders, updateOrderStatus } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import DeliveryChat from '../components/DeliveryChat';
import { MessageCircle } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const previousOrdersRef = useRef(null);

  const fetchOrders = (status = filterStatus, isBackground = false) => {
    if (!isBackground) setLoading(true);
    const params = {};
    if (status) params.status = status;
    getStaffOrders(params)
      .then(r => {
        const newOrders = r.data.results || r.data;
        
        // Notification Logic
        if (isBackground && previousOrdersRef.current) {
          const oldIds = new Set(previousOrdersRef.current.map(o => o.id));
          const oldStatusMap = new Map(previousOrdersRef.current.map(o => [o.id, o.status]));
          
          let hasNewOrder = false;
          let hasCancellation = false;

          newOrders.forEach(order => {
            if (!oldIds.has(order.id)) {
              hasNewOrder = true;
            } else if (order.status === 'cancelled' && oldStatusMap.get(order.id) !== 'cancelled') {
              hasCancellation = true;
            }
          });

          if (hasNewOrder) {
            playNotificationSound();
            toast.success('🛎️ New Order Received!', { duration: 5000, style: { border: '2px solid var(--clr-primary)', padding: '16px' }});
          } else if (hasCancellation) {
            playNotificationSound();
            toast.error('❌ An Order was Cancelled!', { duration: 5000 });
          }
        }
        
        previousOrdersRef.current = newOrders;
        setOrders(newOrders);
      })
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(filterStatus, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} → ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const stats = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="section">
      <div className="container">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-xl)' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:4 }}>Staff Dashboard</h1>
            <p style={{ color:'var(--clr-text-muted)' }}>{orders.length} total orders</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/staff/analytics" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={16} /> View Analytics
            </Link>
            <button className="btn btn-ghost" onClick={() => fetchOrders()}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'var(--space-md)', marginBottom:'var(--space-xl)' }}>
          {[['pending','⏳','Pending'], ['confirmed','✅','Confirmed'], ['preparing','👨‍🍳','Preparing'], ['delivered','🎉','Delivered']].map(([s,icon,label]) => (
            <div key={s} className="card" style={{ padding:'var(--space-md)', textAlign:'center', cursor:'pointer', borderColor: filterStatus===s ? 'var(--clr-primary)' : '' }}
              onClick={() => setFilterStatus(v => v===s ? '' : s)}>
              <div style={{ fontSize:'1.5rem' }}>{icon}</div>
              <div style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--clr-primary)', marginTop:4 }}>{stats[s] || 0}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--clr-text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:'var(--space-sm)', marginBottom:'var(--space-lg)', flexWrap:'wrap' }}>
          <button className={`category-chip ${!filterStatus ? 'active' : ''}`} onClick={() => setFilterStatus('')}>All</button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`category-chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(v => v===s?'':s)}>
              {s.replace('_',' ')}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">📭</div><div className="empty-state__title">No orders found</div></div>
        ) : (
          <div className="staff-grid">
            {orders.map(order => (
              <div key={order.id} className="staff-order-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'var(--space-md)' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>Order #{order.id}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)', marginTop:2 }}>
                      👤 {order.user?.username} · {new Date(order.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => setChatOrder(order)} 
                      title="Chat with Customer/Driver"
                      style={{ padding: '4px', height: 'auto' }}
                    >
                      <MessageCircle size={18} color="var(--clr-primary)" />
                    </button>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div style={{ marginBottom:'var(--space-md)', fontSize:'0.85rem' }}>
                  {order.items?.map(i => (
                    <div key={i.id} style={{ display:'flex', justifyContent:'space-between', color:'var(--clr-text-muted)', padding:'3px 0' }}>
                      <span>{i.item_name} × {i.quantity}</span>
                      <span>₹{parseFloat(i.item_price) * i.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:'rgba(255,107,53,0.08)', border:'1px solid rgba(255,107,53,0.15)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:'0.8rem', marginBottom:'var(--space-md)', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--clr-text-muted)' }}>Total</span>
                  <strong style={{ color:'var(--clr-primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>

                <div style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)', marginBottom:'var(--space-sm)' }}>
                  📍 {order.delivery_address?.substring(0,60)}...
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--clr-border)' }}>
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary w-full" onClick={() => handleStatusUpdate(order.id, 'confirmed')} disabled={updating === order.id}>
                          Accept Order
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0 12px' }} onClick={() => handleStatusUpdate(order.id, 'cancelled')} disabled={updating === order.id} title="Cancel Order">
                          ✕
                        </button>
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <button className="btn btn-outline w-full" onClick={() => handleStatusUpdate(order.id, 'preparing')} disabled={updating === order.id}>
                        👨‍🍳 Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button className="btn w-full" style={{ background: 'var(--clr-accent)', color: 'var(--clr-bg)' }} onClick={() => handleStatusUpdate(order.id, 'ready')} disabled={updating === order.id}>
                        ✅ Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <div style={{ padding: '10px', background: 'var(--clr-surface-2)', color: 'var(--clr-text-muted)', textAlign: 'center', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                        ⏳ Waiting for Driver to claim...
                      </div>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button className="btn btn-outline w-full" style={{ borderColor: 'var(--clr-success)', color: 'var(--clr-success)' }} onClick={() => handleStatusUpdate(order.id, 'delivered')} disabled={updating === order.id}>
                        🎉 Mark Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {chatOrder && (
        <DeliveryChat 
          orderId={chatOrder.id} 
          driverName={chatOrder.driver_name} 
          driverPhone={chatOrder.driver_phone} 
          onClose={() => setChatOrder(null)} 
        />
      )}
    </div>
  );
}
