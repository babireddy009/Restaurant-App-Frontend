import React, { useEffect, useState } from 'react';

export default function SuccessOverlay({ message, show, onComplete }) {
  const [render, setRender] = useState(show);

  useEffect(() => {
    if (show) {
      setRender(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500); // 3.5s for the Zomato-like animation to fully play
      return () => clearTimeout(timer);
    } else {
      setRender(false);
    }
  }, [show, onComplete]);

  if (!render) return null;

  return (
    <div className="zomato-success-overlay">
      <div className="zomato-success-card">
        <div className="success-animation-container">
           {/* Ripple effect behind the circle */}
           <div className="ripple"></div>
           {/* SVG for the animated checkmark */}
           <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
           </svg>
        </div>
        <h1 className="success-text">{message || 'Order Confirmed!'}</h1>
        <p className="success-subtext">Preparing your food with love...</p>
      </div>
      <style>{`
        .zomato-success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--clr-bg, #1a1a2e);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fade-in 0.3s ease-out forwards;
        }

        .zomato-success-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-animation-container {
          position: relative;
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
        }

        /* SVG Checkmark Animation */
        .checkmark {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: block;
          stroke-width: 3.5;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #06d6a0;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
          z-index: 2;
        }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3.5;
          stroke-miterlimit: 10;
          stroke: #06d6a0;
          fill: none;
          animation: stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        /* Ripple effect behind the circle */
        .ripple {
          position: absolute;
          width: 90px;
          height: 90px;
          background-color: #06d6a0;
          border-radius: 50%;
          z-index: 1;
          animation: ripple-out 1.2s cubic-bezier(0.165, 0.84, 0.44, 1) 0.5s forwards;
          opacity: 0;
        }

        .success-text {
          color: var(--clr-text, #f0f0f5);
          font-size: 2.4rem;
          font-weight: 800;
          margin: 0;
          opacity: 0;
          transform: translateY(20px);
          animation: slide-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1s forwards;
          text-align: center;
          letter-spacing: -0.5px;
          padding: 0 20px;
        }

        .success-subtext {
          color: var(--clr-text-faint, #a0a0b0);
          font-size: 1.1rem;
          margin-top: 12px;
          opacity: 0;
          transform: translateY(20px);
          animation: slide-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s forwards;
        }

        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }

        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.15, 1.15, 1); }
        }

        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 60px #06d6a0; }
        }

        @keyframes ripple-out {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
