import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export default function Footer() {
  const scrollImages = [
    '/restaurant_photos/chicken_biryani.png',
    '/restaurant_photos/butter_chicken.png',
    '/restaurant_photos/garlic_naan.png',
    '/restaurant_photos/margherita_pizza.png',
    '/restaurant_photos/mango_lassi.png',
    '/restaurant_photos/paneer_tikka.png',
  ];

  return (
    <footer className="footer">
      <div className="marquee-container">
        <div className="marquee-track">
          {/* Double the array for infinite scroll effect */}
          {[...scrollImages, ...scrollImages].map((src, idx) => (
            <div key={idx} className="marquee-item">
              <img src={src} alt="Restaurant gallery" />
            </div>
          ))}
        </div>
      </div>
      <div className="container" style={{ marginTop: 'var(--space-2xl)' }}>
        <div className="footer__grid">
          <div>
            <div className="footer__brand">MSR Rayalaseema Ruchulu</div>
            <p className="footer__desc">
              Authentic Rayalaseema flavors, modern experience. Order your favorite
              traditional dishes online and get them delivered hot to your door.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {/* WhatsApp */}
              <a href="https://wa.me/919390448306" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-icon" style={{ width: 36, height: 36 }} title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/msr_vaari_rayalaseema?igsh=eGQzaHFsYWF2amtv" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-icon" style={{ width: 36, height: 36 }} title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-icon" style={{ width: 36, height: 36 }} title="Twitter / X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <p className="footer__heading">Quick Links</p>
            <ul className="footer__links">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/orders', 'My Orders'], ['/login', 'Login'], ['/driver/login', 'Delivery Partner Login']].map(([to, label]) => (
                <li key={to}><Link to={to} className="footer__link">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__heading">Contact</p>
            <ul className="footer__links">
              <li>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=15.625224761297483,79.62384590419613" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer__link" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  📍 MSR Rayalaseema Ruchulu, Darsi Road, Opposite HP petrol bunk, Podili, Markapuram District, Andhra Pradesh- 523240
                </a>
              </li>
              <li><span className="footer__link">📞 +91  9390448306</span></li>
              <li><span className="footer__link">✉️ contact@msrrayalaseemaruchulu.in</span></li>
              <li><span className="footer__link">🕐 11 AM – 11 PM Daily</span></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <p style={{ 
            fontSize: '0.88rem', 
            color: 'var(--clr-text-muted)', 
            fontWeight: 500, 
            letterSpacing: '0.2px',
            margin: 0
          }}>
            © 2026 <span style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>MSR Rayalaseema Ruchulu</span>. All rights reserved.
          </p>
          <p style={{ 
            fontSize: '0.78rem', 
            color: 'var(--clr-text-faint)', 
            marginTop: '6px',
            fontWeight: 500
          }}>
            This site is developed and maintained by{' '}
            <span style={{ 
              background: 'var(--grad-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.5px',
              display: 'inline-block'
            }}>
              Venkata Reddy Yenika
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
