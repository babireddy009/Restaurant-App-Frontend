import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Shield, Truck } from 'lucide-react';
import { getFeaturedItems, getCategories } from '../api/endpoints';
import FoodCard from '../components/FoodCard';

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Fast Delivery', desc: 'Hot food at your door in 30 mins' },
  { icon: <Star size={24} />, title: 'Top Rated', desc: 'Over 10,000 happy customers' },
  { icon: <Shield size={24} />, title: 'Secure Payment', desc: 'Razorpay encrypted checkout' },
  { icon: <Clock size={24} />, title: 'Open Daily', desc: '11 AM to 11 PM every day' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedItems(), getCategories()])
      .then(([fRes, cRes]) => {
        setFeatured(fRes.data.results || fRes.data);
        setCategories(cRes.data.results || cRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero__content animate-fadeup">
            <div className="hero__tag">🌟 #1 Food Delivery in the City</div>
            <h1 className="hero__title">
              Taste the Art of <span>Authentic</span> Indian Cuisine
            </h1>
            <p className="hero__desc">
              From fragrant biryanis to creamy curries — order fresh, handcrafted dishes
              delivered straight to your door. Fast. Hot. Delicious.
            </p>
            <div className="hero__cta">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn btn-outline btn-lg">Explore Menu</Link>
            </div>
            <div className="hero__stats">
              {[['500+', 'Menu Items'], ['10K+', 'Orders Served'], ['4.8★', 'Average Rating']].map(([num, label]) => (
                <div key={label}>
                  <div className="hero__stat-num">{num}</div>
                  <div className="hero__stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Hero food image */}
        <div style={{
          position: 'absolute', right: '3%', top: '50%', transform: 'translateY(-50%)',
          width: '44%', maxWidth: 520, display: 'none',
        }} className="hero__image-side">
          <img
            src="/images/hero_food.png"
            alt="Rayalasema food spread"
            style={{
              width: '100%', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg), 0 0 60px rgba(255,107,53,0.18)',
              opacity: 0.92,
            }}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'var(--space-2xl) 0', background:'var(--clr-surface)', borderBottom:'1px solid var(--clr-border)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'var(--space-lg)' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display:'flex', alignItems:'flex-start', gap:'var(--space-md)' }}>
                <div style={{ color:'var(--clr-primary)', background:'rgba(255,107,53,0.1)', padding:'10px', borderRadius:'var(--radius-md)', flexShrink:0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, marginBottom:4 }}>{f.title}</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--clr-text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">Browse by Category</p>
              <h2 className="section-title">What are you <span style={{ color:'var(--clr-primary)' }}>craving?</span></h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'var(--space-md)' }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/menu?category=${cat.id}`}
                  style={{ textDecoration:'none', textAlign:'center', background:'var(--clr-surface-2)', border:'1px solid var(--clr-border)', borderRadius:'var(--radius-lg)', padding:'var(--space-lg) var(--space-md)', transition:'all 0.25s ease', display:'block' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--clr-primary)'; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--clr-border)'; e.currentTarget.style.transform='translateY(0)'; }}
                >
                  <div style={{ marginBottom:12, width: '100%', aspectRatio: '1.5', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize:'3rem', display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'var(--clr-surface)' }}>
                        {{'Starters':'🥗','Main Course':'🍛','Biryani & Rice':'🍚','Breads':'🍞','Desserts':'🍮','Beverages':'🥤','Pizza':'🍕','Burgers':'🍔'}[cat.name] || '🍽️'}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{cat.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--clr-text-muted)', marginTop:2 }}>{cat.item_count} items</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED ITEMS */}
      <section className="section" style={{ background:'var(--clr-surface)', borderTop:'1px solid var(--clr-border)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-tag">Chef's Selection</p>
            <h2 className="section-title">Featured <span style={{ color:'var(--clr-primary)' }}>Dishes</span></h2>
            <p className="section-desc">Our most loved items, handpicked for their flavour and quality</p>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="menu-grid">
              {featured.slice(0, 8).map(item => <FoodCard key={item.id} item={item} />)}
            </div>
          )}
          <div style={{ textAlign:'center', marginTop:'var(--space-2xl)' }}>
            <Link to="/menu" className="btn btn-outline btn-lg">
              View Full Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
