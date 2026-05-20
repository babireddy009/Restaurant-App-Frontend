import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();
  return (
    <div className="cart-item">
      <div className="cart-item__img" style={{
        background: 'linear-gradient(135deg,#232340,#2d2d50)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'1.5rem', flexShrink:0, width:60, height:60, borderRadius:8
      }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8 }} />
        ) : '🍽️'}
      </div>
      <div className="cart-item__info">
        <div className="cart-item__name">{item.name}</div>
        <div className="cart-item__price">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
      </div>
      <div className="cart-item__qty">
        <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
        <span className="qty-num">{item.quantity}</span>
        <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, totalPrice, totalItems } = useCart();

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={() => setIsOpen(false)} />}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Shopping Cart">
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            🛒 Cart {totalItems > 0 && <span style={{ color:'var(--clr-primary)' }}>({totalItems})</span>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <p style={{ fontWeight:600, marginBottom:8 }}>Your cart is empty</p>
              <p style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)', marginBottom:16 }}>Add some delicious items from our menu!</p>
              <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>
                Go to Menu
              </button>
            </div>
          ) : (
            items.map(item => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, color:'var(--clr-text-muted)', fontSize:'0.9rem' }}>
              <span>Subtotal</span>
              <strong style={{ color:'var(--clr-text)' }}>₹{totalPrice.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-primary w-full" onClick={() => setIsOpen(false)}>
              <ShoppingBag size={16} />
              Proceed to Checkout — ₹{totalPrice.toFixed(2)}
            </Link>
            <button 
              className="btn btn-outline w-full" 
              style={{ marginTop: 8 }}
              onClick={() => setIsOpen(false)}
            >
              ← Keep Shopping & Add More
            </button>
          </div>
        )}
      </div>
    </>
  );
}
