import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCcw } from 'lucide-react';
import { getMyOrders } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { replaceCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (e, order) => {
    e.preventDefault(); // Prevent navigating to order details
    const newCartItems = order.items.map(item => ({
      id: item.menu_item,
      name: item.item_name,
      price: item.item_price,
      quantity: item.quantity,
      // Note: we don't have the image here, but that's fine for the cart
    }));
    replaceCart(newCartItems);
    toast.success('Cart updated! Ready for checkout.');
    navigate('/checkout');
  };

  if (loading) return <div className="loading-center" style={{ minHeight:'60vh' }}><div className="spinner" /></div>;

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const OrderCard = ({ order, isPast }) => (
    <Link to={`/orders/${order.id}`} style={{ textDecoration:'none' }}>
      <div className="order-card" style={{ cursor:'pointer', transition:'all 0.25s', ':hover':{ borderColor:'var(--clr-primary)' }, marginBottom: 'var(--space-md)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--clr-primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--clr-border)'}
      >
        <div className="order-card__header">
          <div>
            <div style={{ fontWeight:700, fontSize:'1rem' }}>Order #{order.id}</div>
            <div className="order-card__id">{new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <StatusBadge status={order.status} />
            <ChevronRight size={18} color="var(--clr-text-faint)" />
          </div>
        </div>
        <div className="order-card__items">
          {order.items?.map(i => `${i.item_name} ×${i.quantity}`).join(' · ')}
        </div>
        <div className="order-card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>
              {order.items?.reduce((s, i) => s + i.quantity, 0)} items
            </span>
            <span className="order-card__total" style={{ marginLeft: 8 }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          {isPast && order.status === 'delivered' && (
            <button 
              className="btn btn-outline btn-sm" 
              onClick={(e) => handleReorder(e, order)}
              style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCcw size={14} /> Reorder
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="section">
      <div className="container" style={{ maxWidth:720 }}>
        <div className="page-header">
          <h1 className="page-header__title">My Orders</h1>
          <p className="page-header__sub">{orders.length} orders placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__title">No orders yet</div>
            <p style={{ marginBottom:'var(--space-lg)' }}>Looks like you haven't ordered anything. Let's fix that!</p>
            <Link to="/menu" className="btn btn-primary">Order Now</Link>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>Active Orders</h2>
                {activeOrders.map(order => <OrderCard key={order.id} order={order} isPast={false} />)}
              </div>
            )}
            
            {pastOrders.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>Past Orders</h2>
                {pastOrders.map(order => <OrderCard key={order.id} order={order} isPast={true} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
