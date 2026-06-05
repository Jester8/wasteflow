"use client";

import { useEffect, useRef } from "react";

const features = [
  {
    title: "Real-Time Tracking",
    description: "Know exactly where every skip is, at all times.",
    shortDetail: "Live GPS visibility, smart ETAs, and route optimization from one dashboard.",
    stat: "99.9% uptime",
    metric: "Updates every 30s",
    extraMetric: "Live route optimization",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Dispatch Approval",
    description: "Approve or delay collections without a single call.",
    shortDetail: "Smart workflows and automated scheduling reduce unnecessary trips by 40%.",
    stat: "40% fewer trips",
    metric: "Instant approvals",
    extraMetric: "Smart routing algorithms",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8l5 3-5 3V8z" />
      </svg>
    ),
  },
  {
    title: "Waste Reports",
    description: "Automated logs for compliance and recycling targets.",
    shortDetail: "Track volumes, recycling rates, and sustainability goals effortlessly.",
    stat: "100% compliant",
    metric: "Automated reporting",
    extraMetric: "Real-time analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-wrap {
          width: 100%;
          height: 260px;
          perspective: 1000px;
          cursor: pointer;
          animation: fadeUp 0.65s ease both;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid #c6e2d0;
        }

        .card-wrap.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .card-front {
          background: #fff;
        }

        .card-back {
          background: #132d1e;
          transform: rotateY(180deg);
          justify-content: space-between;
        }

        .card-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #e8f5ee;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: background 0.3s ease;
          flex-shrink: 0;
        }
        .card-icon svg {
          width: 20px;
          height: 20px;
        }

        .card-wrap:hover .card-icon {
          background: #a8dfc4;
        }

        .card-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a2e1f;
          margin-bottom: 4px;
        }

        .card-desc {
          font-size: 0.875rem;
          font-weight: 500;
          color: #556b5e;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .card-detail {
          font-size: 0.75rem;
          color: #7a9585;
          line-height: 1.55;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .card-back-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .card-back-header svg {
          width: 18px;
          height: 18px;
          stroke: #2e7d52;
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .card-back-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #d6f0e0;
        }

        .card-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          justify-content: center;
        }

        .stat-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #a8d9be;
        }

        .card-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(184,213,46,0.1);
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(184,213,46,0.2);
          margin-top: 12px;
        }

        .card-badge span {
          font-size: 0.7rem;
          font-weight: 600;
          color: #c8e87a;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div
        className="card-wrap"
        style={{ animationDelay: `${index * 0.11}s` }}
        onClick={(e) => (e.currentTarget as HTMLDivElement).classList.toggle("flipped")}
      >
        <div className="card-inner">
          {/* Front */}
          <div className="card-front">
            <div className="card-icon">{feature.icon}</div>
            <p className="card-title">{feature.title}</p>
            <p className="card-desc">{feature.description}</p>
            <p className="card-detail">{feature.shortDetail}</p>
          </div>

          {/* Back */}
          <div className="card-back">
            <div>
              <div className="card-back-header">
                {feature.icon}
                <span className="card-back-title">{feature.title}</span>
              </div>
              <div className="card-stats">
                <div className="stat-row"><CheckIcon /><span className="stat-text">{feature.stat}</span></div>
                <div className="stat-row"><ClockIcon /><span className="stat-text">{feature.metric}</span></div>
                <div className="stat-row"><BarIcon /><span className="stat-text">{feature.extraMetric}</span></div>
              </div>
            </div>
            <div className="card-badge">
              <ShieldIcon />
              <span>Enterprise grade security</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Features() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef  = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  let touchStartX = 0;
  let touchEndX   = 0;

  const goTo = (idx: number) => {
    const total = features.length;
    currentRef.current = ((idx % total) + total) % total;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentRef.current * (100 / total)}%)`;
    }
    dotsRef.current?.querySelectorAll(".dot").forEach((d, i) =>
      d.classList.toggle("active", i === currentRef.current)
    );
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const onTouchMove  = (e: TouchEvent) => { touchEndX = e.touches[0].clientX; };
    const onTouchEnd   = () => {
      const diff = touchStartX - touchEndX;
      if (diff > 50)  goTo(currentRef.current + 1);
      if (diff < -50) goTo(currentRef.current - 1);
    };

    track.addEventListener("touchstart", onTouchStart);
    track.addEventListener("touchmove",  onTouchMove);
    track.addEventListener("touchend",   onTouchEnd);
    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove",  onTouchMove);
      track.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .features-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px;
          overflow: hidden;
          background: #f5faf6;
          font-family: 'DM Sans', sans-serif;
        }

        .features-section::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(20,60,35,0.09) 0%, transparent 55%),
            radial-gradient(ellipse at 100% 100%, rgba(20,60,35,0.07) 0%, transparent 55%);
        }

        .features-section::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, rgba(184,213,46,0.04) 0%, transparent 60%);
        }

        .features-header {
          position: relative;
          z-index: 1;
          max-width: 560px;
          width: 100%;
          text-align: center;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease both;
        }

        .features-header h2 {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 700;
          color: #1a2e1f;
          line-height: 1.25;
          margin-bottom: 12px;
        }

        .features-header p {
          color: #556b5e;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.6;
          animation: fadeUp 0.6s 0.15s ease both;
          opacity: 0;
          animation-fill-mode: both;
        }

        /* Desktop grid */
        .features-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 300px));
          gap: 24px;
          max-width: 1024px;
          width: 100%;
          justify-content: center;
        }

        /* Mobile carousel */
        .features-carousel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          overflow: hidden;
          display: none;
        }

        .carousel-track {
          display: flex;
          width: 300%;
          transition: transform 0.3s ease-out;
          will-change: transform;
        }

        .carousel-slide {
          flex-shrink: 0;
          width: 33.3333%;
          padding: 0 8px;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #c6e2d0;
          transition: width 0.2s, background 0.2s;
        }
        .dot.active {
          width: 12px;
          background: #2e7d52;
        }

        @media (max-width: 767px) {
          .features-grid     { display: none; }
          .features-carousel { display: block; }
        }
      `}</style>

      <section className="features-section">
        <div className="features-header">
          <h2>Everything you need on site</h2>
          <p>Manage your fleet, approvals, and compliance from one clean interface built for the field.</p>
        </div>

        {/* Desktop */}
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="features-carousel">
          <div className="carousel-track" ref={trackRef}>
            {features.map((f, i) => (
              <div key={f.title} className="carousel-slide">
                <FeatureCard feature={f} index={i} />
              </div>
            ))}
          </div>
          <div className="carousel-dots" ref={dotsRef}>
            {features.map((_, i) => (
              <div key={i} className={`dot${i === 0 ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}