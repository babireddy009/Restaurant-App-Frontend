import React, { useState, useEffect } from 'react';
import { getGalleryImages } from '../api/endpoints';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryImages()
      .then(res => {
        setImages(res.data.results || res.data);
      })
      .catch(err => console.error("Could not fetch gallery", err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="section">
      <div className="container">
        
        {/* Header */}
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-header__title">Our <span style={{ color:'var(--clr-primary)' }}>Gallery</span></h1>
          <p className="page-header__sub">A sneak peek into our restaurant and our beautiful authentic dishes.</p>
        </div>

        {/* Masonry/Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-xl)'
        }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : images.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state__icon">📸</div>
              <div className="empty-state__title">No images yet</div>
              <p>Check back soon for photos of our restaurant!</p>
            </div>
          ) : images.map((img, idx) => (
            <div key={img.id || idx} style={{ 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-sm)',
              aspectRatio: idx % 3 === 0 ? '4/5' : '1/1', // mixed aspect ratios for dynamic look
            }}>
              <img 
                src={img.image} 
                alt={img.title || `Restaurant Gallery ${idx + 1}`} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
