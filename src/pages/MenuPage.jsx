import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getCategories, getMenuItems } from '../api/endpoints';
import FoodCard from '../components/FoodCard';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCat = searchParams.get('category') || '';

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results || r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCat) params.category = selectedCat;
    if (vegOnly) params.vegetarian = 'true';
    if (search) params.search = search;
    getMenuItems(params)
      .then(r => setItems(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [selectedCat, vegOnly, search]);

  const handleCatSelect = (id) => {
    const p = new URLSearchParams(searchParams);
    if (String(id) === selectedCat) { p.delete('category'); }
    else { if (id) p.set('category', id); else p.delete('category'); }
    setSearchParams(p);
  };

  const selectedCatName = categories.find(c => String(c.id) === selectedCat)?.name || 'All Items';

  return (
    <div className="section">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-header__title">Our <span style={{ color:'var(--clr-primary)' }}>Menu</span></h1>
          <p className="page-header__sub">{items.length} delicious dishes waiting for you</p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display:'flex', gap:'var(--space-md)', marginBottom:'var(--space-lg)', flexWrap:'wrap', alignItems:'center' }}>
          <div className="search-bar" style={{ flex:1, minWidth:220 }}>
            <Search size={15} className="search-bar__icon" />
            <input
              type="text" placeholder="Search dishes..." className="form-input search-bar__input"
              value={search} onChange={e => setSearch(e.target.value)}
              id="menu-search"
            />
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', background:'var(--clr-surface-2)', padding:'0.65rem 1rem', borderRadius:'var(--radius-md)', border:'1.5px solid var(--clr-border)', fontSize:'0.9rem', userSelect:'none' }}>
            <input type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} id="veg-filter" style={{ accentColor:'var(--clr-success)', width:16, height:16 }} />
            🟢 Veg Only
          </label>
        </div>

        {/* Category Chips */}
        <div className="category-filter">
          <button className={`category-chip ${!selectedCat ? 'active' : ''}`} onClick={() => handleCatSelect('')}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} className={`category-chip ${String(cat.id) === selectedCat ? 'active' : ''}`} onClick={() => handleCatSelect(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: cat.image ? '8px' : undefined }}>
              {cat.image && <img src={cat.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-lg)' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--clr-text-muted)' }}>
            {selectedCatName}
            <span style={{ color:'var(--clr-primary)', marginLeft:8 }}>({items.length})</span>
          </h2>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__title">No items found</div>
            <p>Try a different category or search term</p>
          </div>
        ) : (
          <div className="menu-grid">
            {items.map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        )}

      </div>
    </div>
  );
}
