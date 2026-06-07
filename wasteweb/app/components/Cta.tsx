"use client";

export default function CTA() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cta-section {
          width: 100%;
          background: #ffffff;
          padding: 56px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .cta-section::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(19,45,30,0.12), transparent);
        }

        .cta-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          max-width: 1100px;
          width: 100%;
          flex-wrap: wrap;
        }

        .cta-text h2 {
          font-size: clamp(1.3rem, 2.5vw, 1.75rem);
          font-weight: 700;
          color: #1a2e1f;
          line-height: 1.25;
          margin-bottom: 6px;
          animation: fadeUp 0.5s ease both;
        }

        .cta-text p {
          font-size: 0.9rem;
          color: #556b5e;
          font-weight: 400;
          line-height: 1.5;
          animation: fadeUp 0.5s 0.1s ease both;
          opacity: 0;
          animation-fill-mode: both;
        }

        .cta-text h2 span { color: #2e7d52; }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          animation: fadeUp 0.5s 0.2s ease both;
          opacity: 0;
          animation-fill-mode: both;
        }

        .cta-btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 10px;
          background: #B8D52E;
          color: #132d1e;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(184,213,46,0.3);
        }

        .cta-btn-primary:hover {
          background: #cce83a;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(184,213,46,0.42);
        }

        .cta-btn-primary::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 14px;
          border: 1.5px solid #B8D52E;
          animation: pulse-ring 2.2s ease-out infinite;
          pointer-events: none;
        }

        .cta-btn-primary svg {
          width: 15px;
          height: 15px;
          stroke: #132d1e;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: transform 0.2s ease;
        }

        .cta-btn-primary:hover svg { transform: translateX(3px); }

        .cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          border-radius: 10px;
          background: transparent;
          color: #0d2416;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #0d2416;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
        }

        .cta-btn-secondary:hover {
          border-color: #0a1b10;
          color: #0a1b10;
          background: rgba(13,36,22,0.05);
        }

        @media (max-width: 768px) {
          .cta-inner {
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }
          .cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .cta-btn-primary,
          .cta-btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-text">
            <h2>Ready to streamline your <span>skip management?</span></h2>
            <p>Join site managers already saving time with smarter logistics.</p>
          </div>
          <div className="cta-actions">
            <a href="#" className="cta-btn-primary">
              Request a Demo
              <svg viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="#" className="cta-btn-secondary">
              Watch how it works
            </a>
          </div>
        </div>
      </section>
    </>
  );
}