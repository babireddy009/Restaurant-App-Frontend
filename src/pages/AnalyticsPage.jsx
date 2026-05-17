import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShoppingBag, Star, Activity, Utensils } from 'lucide-react';
import { getAnalytics } from '../api/endpoints';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center" style={{ minHeight:'60vh' }}><div className="spinner" /></div>;
  if (!data) return <div className="empty-state">Failed to load analytics</div>;

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
          <div>
            <Link to="/staff" className="btn btn-ghost btn-sm" style={{ marginBottom: '8px', display: 'inline-flex' }}>
              <ArrowLeft size={16} /> Back to Staff Dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>Analytics Dashboard</h1>
            <p style={{ color: 'var(--clr-text-muted)' }}>Real-time business insights</p>
          </div>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--clr-primary)', marginBottom: 8 }}>
              <TrendingUp size={20} /> <span style={{ fontWeight: 600 }}>Total Revenue</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{data.total_revenue.toFixed(2)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>From delivered orders</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#06d6a0', marginBottom: 8 }}>
              <ShoppingBag size={20} /> <span style={{ fontWeight: 600 }}>Total Orders</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{data.total_orders}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Successfully delivered</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef476f', marginBottom: 8 }}>
              <Activity size={20} /> <span style={{ fontWeight: 600 }}>Active Orders</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{data.active_orders}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Currently in progress</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
          
          {/* Top Items */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Utensils size={20} color="var(--clr-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Selling Items</h2>
            </div>
            {data.top_items.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>No sales data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.top_items.map((item, idx) => {
                  const maxSold = data.top_items[0].sold;
                  const percent = Math.max(10, (item.sold / maxSold) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span style={{ color: 'var(--clr-text-muted)' }}>{item.sold} sold</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--clr-surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--clr-primary)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ratings */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Star size={20} color="#fbbf24" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Customer Satisfaction</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.avg_food_rating}</span>
                  <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--clr-text-muted)' }}>/ 5.0</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Food Quality</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Average rating across all menu items.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #06d6a0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.avg_driver_rating}</span>
                  <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--clr-text-muted)' }}>/ 5.0</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Delivery Partners</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Average rating for drivers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
