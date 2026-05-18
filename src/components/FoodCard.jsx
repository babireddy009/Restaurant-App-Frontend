import { useState } from 'react';
import { Plus, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const SPICE_ICONS = { none: '', mild: '🌶️', medium: '🌶️🌶️', hot: '🌶️🌶️🌶️' };

const CATEGORY_EMOJI = {
  'Starters': '🥗', 'Main Course': '🍛', 'Biryani & Rice': '🍚',
  'Breads': '🫓', 'Desserts': '🍮', 'Beverages': '🥤',
  'Pizza': '🍕', 'Burgers': '🍔',
};

// Resolves image path to a full URL the browser can load
function resolveImage(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;         // absolute URL
  if (imagePath.startsWith('/images/')) return imagePath;     // frontend public folder — served by Vercel as-is
  // Django media upload paths — prefix with backend base URL
  let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  if (apiBase.endsWith('/')) apiBase = apiBase.slice(0, -1);
  if (apiBase.endsWith('/api')) apiBase = apiBase.slice(0, -4);
  return `${apiBase}${imagePath}`;
}


export default function FoodCard({ item }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const imageUrl = resolveImage(item.image);
  const emoji = CATEGORY_EMOJI[item.category_name] || '🍽️';

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(item);
    toast.success(`${item.name} added!`, {
      duration: 1800,
      style: {
        background: '#1a1a2e', color: '#f0f0f5',
        border: '1px solid rgba(6,214,160,0.3)',
        fontSize: '0.85rem',
      },
    });
  };

  return (
    <div className="food-card card">
      {/* Image Section */}
      <div className="food-card__img-wrap">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="food-card__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="food-card__img food-card__img--placeholder">
            <span>{emoji}</span>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="food-card__badges">
          <span className={`badge ${item.is_vegetarian ? 'badge-veg' : 'badge-nonveg'}`}>
            <span style={{ fontSize: '0.6rem' }}>{item.is_vegetarian ? '🟢' : '🔴'}</span>
            {item.is_vegetarian ? 'Veg' : 'Non-Veg'}
          </span>
          {item.is_bestseller && <span className="badge badge-bestseller">🔥 Best</span>}
          {item.is_featured && !item.is_bestseller && <span className="badge badge-featured">⭐</span>}
        </div>

        {/* Spice Level Overlay */}
        {item.spice_level !== 'none' && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.65)', borderRadius: 6,
            padding: '2px 7px', fontSize: '0.7rem', backdropFilter: 'blur(4px)',
          }}>
            {SPICE_ICONS[item.spice_level]}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="food-card__body">
        <h3 className="food-card__name">{item.name}</h3>
        <p className="food-card__desc">{item.description}</p>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 'var(--space-sm)', fontSize: '0.75rem',
          color: 'var(--clr-text-faint)',
        }}>
          {item.preparation_time > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} /> {item.preparation_time} min
            </span>
          )}
          {item.rating_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--clr-accent)' }}>
              <Star size={11} fill="currentColor" />
              {Number(item.rating).toFixed(1)}
              <span style={{ color: 'var(--clr-text-faint)' }}>({item.rating_count})</span>
            </span>
          )}
        </div>

        {/* Price + Add Button */}
        <div className="food-card__footer">
          <div className="food-card__price">₹{parseFloat(item.price).toFixed(0)}</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            id={`add-to-cart-${item.id}`}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
