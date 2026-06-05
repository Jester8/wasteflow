"use client";

import { useEffect, useRef } from "react";

const howItWorks = [
  {
    title: "Create Request",
    description: "Submit skip requests in seconds",
    shortDetail: "Fill out our simple form with your site details, skip size, and preferred delivery time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Online Approval",
    description: "Instant or scheduled approval",
    shortDetail: "Get notified immediately when your request is reviewed. Approve or modify with one click.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: "Real-Time Tracking",
    description: "Live GPS visibility",
    shortDetail: "Track your skip from dispatch to delivery with live GPS updates and accurate ETAs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "On-Time Pickup",
    description: "Scheduled collection guaranteed",
    shortDetail: "Automatic scheduling ensures your skip is picked up exactly when needed on your preferred date.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8l5 3-5 3V8z" />
      </svg>
    ),
  },
];

function HowItWorksCard({ item, index }: { item: typeof howItWorks[0]; index: number }) {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hiw-card {
          width: 100%;
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid #c6e2d0;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          animation: fadeUp 0.65s ease both;
        }

        .hiw-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.09);
          transform: translateY(-4px);
        }

        .hiw-step-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e8f5ee;
          color: #2e7d52;
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .hiw-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #e8f5ee;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: background 0.3s ease;
        }

        .hiw-card:hover .hiw-icon {
          background: #a8dfc4;
        }

        .hiw-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a2e1f;
          margin-bottom: 8px;
        }

        .hiw-card-desc {
          font-size: 0.875rem;
          font-weight: 500;
          color: #556b5e;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .hiw-card-detail {
          font-size: 0.75rem;
          color: #7a9585;
          line-height: 1.55;
        }
      `}</style>

      <div
        className="hiw-card"
        style={{ animationDelay: `${index * 0.11}s` }}
      >
        <div className="hiw-step-badge">{index + 1}</div>
        <div className="hiw-icon">{item.icon}</div>
        <h3 className="hiw-card-title">{item.title}</h3>
        <p className="hiw-card-desc">{item.description}</p>
        <p className="hiw-card-detail">{item.shortDetail}</p>
      </div>
    </>
  );
}

export default function HowItWorks() {
  const trackRef   = useRef<HTMLDivElement>(null);
  const dotsRef    = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  let touchStartX  = 0;
  let touchEndX    = 0;

  const total = howItWorks.length;

  const goTo = (idx: number) => {
    currentRef.current = ((idx % total) + total) % total;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentRef.current * (100 / total)}%)`;
    }
    dotsRef.current?.querySelectorAll(".hiw-dot").forEach((d, i) =>
      d.classList.toggle("active", i === currentRef.current)
    );
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const onTouchMove  = (e: TouchEvent) => { touchEndX   = e.touches[0].clientX; };
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

        /* Separator */
        .hiw-separator {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 24px;
        }
        .hiw-separator-line {
          width: 100%;
          max-width: 1200px;
          height: 1px;
          background: linear-gradient(to right, transparent, #B8D52E, transparent);
          opacity: 0.3;
        }

        /* Section */
        .hiw-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px;
          overflow: hidden;
          background: #f5faf6;
          font-family: 'DM Sans', sans-serif;
        }

        .hiw-section::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(20,60,35,0.09) 0%, transparent 55%),
            radial-gradient(ellipse at 100% 100%, rgba(20,60,35,0.07) 0%, transparent 55%);
        }

        .hiw-section::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, rgba(184,213,46,0.04) 0%, transparent 60%);
        }

        /* Header */
        .hiw-header {
          position: relative;
          z-index: 1;
          max-width: 560px;
          width: 100%;
          text-align: center;
          margin-bottom: 40px;
          animation: fadeUp 0.6s ease both;
        }

        .hiw-header h2 {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 700;
          color: #1a2e1f;
          line-height: 1.25;
          margin-bottom: 12px;
        }

        .hiw-header h2 span {
          color: #B8D52E;
        }

        .hiw-header p {
          color: #556b5e;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.6;
          animation: fadeUp 0.6s 0.15s ease both;
          opacity: 0;
          animation-fill-mode: both;
        }

        /* Desktop grid */
        .hiw-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 260px));
          gap: 20px;
          max-width: 1100px;
          width: 100%;
          justify-content: center;
          align-items: stretch;
        }

        /* Mobile carousel */
        .hiw-carousel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          overflow: hidden;
          display: none;
        }

        .hiw-track {
          display: flex;
          width: 400%; /* 4 slides */
          transition: transform 0.3s ease-out;
          will-change: transform;
        }

        .hiw-slide {
          flex-shrink: 0;
          width: 25%; /* 100% / 4 slides */
          padding: 0 8px;
        }

        /* Dots */
        .hiw-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .hiw-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #c6e2d0;
          transition: width 0.2s ease, background 0.2s ease;
        }

        .hiw-dot.active {
          width: 12px;
          background: #2e7d52;
        }

        @media (max-width: 767px) {
          .hiw-grid     { display: none; }
          .hiw-carousel { display: block; }
        }
      `}</style>

      {/* Separator */}
      <div className="hiw-separator">
        <div className="hiw-separator-line" />
      </div>

      <section className="hiw-section">
        {/* Header */}
        <div className="hiw-header">
          <h2>How It <span>Works</span></h2>
          <p>From request to completion — manage your skip logistics in four simple steps</p>
        </div>

        {/* Desktop grid */}
        <div className="hiw-grid">
          {howItWorks.map((item, i) => (
            <HowItWorksCard key={item.title} item={item} index={i} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="hiw-carousel">
          <div className="hiw-track" ref={trackRef}>
            {howItWorks.map((item, i) => (
              <div key={item.title} className="hiw-slide">
                <HowItWorksCard item={item} index={i} />
              </div>
            ))}
          </div>
          <div className="hiw-dots" ref={dotsRef}>
            {howItWorks.map((_, i) => (
              <div key={i} className={`hiw-dot${i === 0 ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}