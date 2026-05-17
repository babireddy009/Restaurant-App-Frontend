import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed in this session
    const wasDismissed = sessionStorage.getItem('pwa-dismissed');
    if (wasDismissed) return;

    // Check if already running as installed PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (isInstalled) return;

    // Detect iOS (Safari)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;
    if (ios && !isInStandaloneMode) {
      setIsIOS(true);
      // Show iOS prompt after 3 seconds
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      width: 'min(90vw, 380px)', zIndex: 9999,
      background: 'linear-gradient(135deg, #1e1e38, #2a2a50)',
      border: '1.5px solid rgba(255,107,53,0.4)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(255,107,53,0.15)',
      padding: 'var(--space-lg)',
      animation: 'fadeInUp 0.4s ease forwards',
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: 'none', color: 'var(--clr-text-faint)',
          cursor: 'pointer', padding: 4,
        }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* App Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #ff6b35, #e55520)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
        }}>
          🍛
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 3 }}>
            Install MSR Food App
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
            {isIOS
              ? 'Tap the Share button below, then "Add to Home Screen" to install'
              : 'Add to your home screen for a full app experience — works offline!'
            }
          </div>

          {isIOS ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.07)', borderRadius: 8,
              padding: '8px 12px', fontSize: '0.8rem', color: 'var(--clr-text-muted)',
            }}>
              <Smartphone size={14} color="#ff6b35" />
              Safari → <strong style={{ color: 'var(--clr-text)' }}>Share</strong> →
              <strong style={{ color: 'var(--clr-text)' }}>Add to Home Screen</strong>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #e55520)',
                color: 'white', border: 'none', borderRadius: 8,
                padding: '8px 18px', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
              }}
            >
              <Download size={14} /> Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
