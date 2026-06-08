"use client";

import { useState } from "react";

const howItWorks = [
  {
    title: "Create Request",
    description: "Submit skip requests in seconds",
    shortDetail: "Fill out our simple form with your site details, skip size, and preferred delivery time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    cardBg: "#ffffff",
    cardBorder: "#c6e2d0",
    accent: "#1a4d2e",
    iconBg: "#e8f5ee",
    iconColor: "#1a4d2e",
    stepBg: "#e8f5ee",
    stepColor: "#1a4d2e",
    titleColor: "#1a2e1f",
    descColor: "#4a6655",
    hintColor: "#8aab97",
    glowColor: "rgba(26,77,46,0.14)",
    hoverBorder: "rgba(26,77,46,0.4)",
    cornerTint: "rgba(26,77,46,0.06)",
    backBg: "#0f2d1a",
    backAccent: "#B8D52E",
    backText: "#c8e8d2",
    backLabel: "#B8D52E",
    backDivider: "#B8D52E",
  },
  {
    title: "Online Approval",
    description: "Instant or scheduled approval",
    shortDetail: "Get notified immediately when your request is reviewed. Approve or modify with one click.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    cardBg: "#0d2416",
    cardBorder: "rgba(184,213,46,0.2)",
    accent: "#B8D52E",
    iconBg: "rgba(184,213,46,0.12)",
    iconColor: "#B8D52E",
    stepBg: "rgba(184,213,46,0.12)",
    stepColor: "#B8D52E",
    titleColor: "#e8f5ee",
    descColor: "#7aaa8a",
    hintColor: "#3d6b4d",
    glowColor: "rgba(184,213,46,0.18)",
    hoverBorder: "rgba(184,213,46,0.5)",
    cornerTint: "rgba(184,213,46,0.08)",
    backBg: "#B8D52E",
    backAccent: "#0d2416",
    backText: "#1a3a20",
    backLabel: "#1a3a20",
    backDivider: "#1a3a20",
  },
  {
    title: "Real-Time Tracking",
    description: "Live GPS visibility",
    shortDetail: "Track your skip from dispatch to delivery with live GPS updates and accurate ETAs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    cardBg: "#d4e84a",
    cardBorder: "rgba(26,77,46,0.2)",
    accent: "#1a4d2e",
    iconBg: "rgba(26,77,46,0.12)",
    iconColor: "#1a4d2e",
    stepBg: "rgba(26,77,46,0.12)",
    stepColor: "#1a4d2e",
    titleColor: "#0f2d1a",
    descColor: "#2a5c38",
    hintColor: "#3d7a4d",
    glowColor: "rgba(26,77,46,0.2)",
    hoverBorder: "rgba(26,77,46,0.45)",
    cornerTint: "rgba(26,77,46,0.1)",
    backBg: "#1a4d2e",
    backAccent: "#d4e84a",
    backText: "#c8e8a0",
    backLabel: "#d4e84a",
    backDivider: "#d4e84a",
  },
  {
    title: "On-Time Pickup",
    description: "Scheduled collection guaranteed",
    shortDetail: "Automatic scheduling ensures your skip is picked up exactly when needed on your preferred date.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8l5 3-5 3V8z" />
      </svg>
    ),
    cardBg: "#ffffff",
    cardBorder: "#d4e84a",
    accent: "#5a8a1a",
    iconBg: "#f4fadc",
    iconColor: "#4a7a10",
    stepBg: "#0d2416",
    stepColor: "#B8D52E",
    titleColor: "#1a2e1f",
    descColor: "#4a6655",
    hintColor: "#8aab97",
    glowColor: "rgba(184,213,46,0.2)",
    hoverBorder: "rgba(184,213,46,0.7)",
    cornerTint: "rgba(184,213,46,0.1)",
    backBg: "#0d2416",
    backAccent: "#d4e84a",
    backText: "#c8e8a0",
    backLabel: "#d4e84a",
    backDivider: "#d4e84a",
  },
  {
    title: "Two-Way Approval",
    description: "Both parties confirm before anything moves.",
    shortDetail: "Contractors place the order and operators review and accept it. Once accepted, the operator sends a readiness request that the contractor confirms — ensuring both parties are aligned before collection begins.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    cardBg: "#ffffff",
    cardBorder: "rgba(26,77,46,0.18)",
    accent: "#1a4d2e",
    iconBg: "#e8f5ee",
    iconColor: "#1a4d2e",
    stepBg: "#e8f5ee",
    stepColor: "#1a4d2e",
    titleColor: "#1a2e1f",
    descColor: "#4a6655",
    hintColor: "#8aab97",
    glowColor: "rgba(26,77,46,0.14)",
    hoverBorder: "rgba(26,77,46,0.45)",
    cornerTint: "rgba(26,77,46,0.06)",
    backBg: "#1a4d2e",
    backAccent: "#d4e84a",
    backText: "#c8e8a0",
    backLabel: "#d4e84a",
    backDivider: "#d4e84a",
  },
];

type HowItWorksItem = typeof howItWorks[0];

function FlipCard({ item, index }: { item: HowItWorksItem; index: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hiw-wrap-${index} {
          perspective: 1100px;
          height: 290px;
          cursor: pointer;
          animation: fadeSlideUp 0.55s ease both;
          animation-delay: ${index * 0.09}s;
        }

        .hiw-inner-${index} {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          border-radius: 20px;
          transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1), box-shadow 0.3s ease;
        }

        .hiw-inner-${index}.flipped {
          transform: rotateY(180deg);
        }

        .hiw-wrap-${index}:hover .hiw-inner-${index}:not(.flipped) {
          transform: translateY(-6px);
        }

        .hiw-face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          padding: 26px 24px 22px;
        }

        .hiw-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }
      `}</style>

      <div className={`hiw-wrap-${index}`} onClick={() => setFlipped(f => !f)}>
        <div
          className={`hiw-inner-${index}${flipped ? " flipped" : ""}`}
          style={{
            boxShadow: flipped
              ? `0 0 0 1.5px ${item.hoverBorder}, 0 12px 40px ${item.glowColor}`
              : `0 0 0 1px ${item.cardBorder}, 0 2px 16px rgba(0,0,0,0.06)`,
          }}
        >
          {/* FRONT */}
          <div className="hiw-face" style={{ background: item.cardBg }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 110, height: 110,
              borderRadius: "0 20px 0 100%",
              background: `radial-gradient(circle, ${item.accent} 0%, transparent 70%)`,
              opacity: 0.09, pointerEvents: "none",
            }} />

            {/* Step badge */}
            <div style={{
              position: "absolute", top: 20, right: 20,
              width: 26, height: 26, borderRadius: 8,
              background: item.stepBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700,
              color: item.stepColor, fontFamily: "'DM Sans',sans-serif",
            }}>
              {index + 1}
            </div>

            {/* Icon */}
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: item.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item.iconColor, marginBottom: 16,
            }}>
              {item.icon}
            </div>

            <h3 style={{
              fontSize: "1rem", fontWeight: 700,
              color: item.titleColor, marginBottom: 8,
              fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.01em",
            }}>
              {item.title}
            </h3>

            <p style={{
              fontSize: "0.855rem", color: item.descColor,
              fontWeight: 500, lineHeight: 1.55,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {item.description}
            </p>

            {/* Tap hint */}
            <div style={{
              position: "absolute", bottom: 14, right: 18,
              fontSize: "0.67rem", color: item.hintColor,
              fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="11" rx="2"/>
              </svg>
              tap to flip
            </div>
          </div>

          {/* BACK */}
          <div className="hiw-face hiw-back" style={{ background: item.backBg }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 110, height: 110,
              borderRadius: "0 20px 0 100%",
              background: `radial-gradient(circle, ${item.backAccent} 0%, transparent 70%)`,
              opacity: 0.15, pointerEvents: "none",
            }} />

            <span style={{
              fontSize: "0.67rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: item.backLabel, fontFamily: "'DM Sans',sans-serif",
            }}>
              How it works
            </span>

            <div style={{ width: 28, height: 2, borderRadius: 2, background: item.backDivider, opacity: 0.6 }} />

            <p style={{
                fontSize: "0.88rem", color: item.backText,
                lineHeight: 1.68, fontWeight: 500,
                fontFamily: "'DM Sans',sans-serif",
              }}>
                {item.shortDetail}
              </p>

            {/* Flip back hint */}
            <div style={{
              position: "absolute", bottom: 14, right: 18,
              fontSize: "0.67rem", color: item.backLabel,
              fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", gap: 4, opacity: 0.5,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
              </svg>
              flip back
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HowItWorks() {
  return (
    <>
      <style>{`
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
          opacity: 0.35;
        }

        .hiw-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px 96px;
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
            radial-gradient(ellipse at 10% 0%, rgba(184,213,46,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 100%, rgba(26,77,46,0.06) 0%, transparent 50%);
        }

        .hiw-header {
          position: relative;
          z-index: 1;
          max-width: 560px;
          width: 100%;
          text-align: center;
          margin-bottom: 48px;
        }

        .hiw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px;
          border-radius: 999px;
          border: 1px solid #c6e2d0;
          background: #edf7f1;
          color: #1a4d2e;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .hiw-header h2 {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #1a2e1f;
          line-height: 1.2;
          margin-bottom: 14px;
          letter-spacing: -0.02em;
        }

        .hiw-header h2 span { color: #B8D52E; }

        .hiw-header p {
          color: #556b5e;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.65;
        }

        .hiw-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 1400px;
          width: 100%;
        }

        @media (min-width: 1100px) {
          .hiw-grid { grid-template-columns: repeat(5, 1fr); gap: 20px; }
        }

        @media (min-width: 700px) and (max-width: 1099px) {
          .hiw-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        @media (max-width: 639px) {
          .hiw-section {
            padding: 60px 20px 72px;
          }
          .hiw-grid {
            grid-template-columns: 1fr;
            max-width: 420px;
          }
        }
      `}</style>

      <div className="hiw-separator">
        <div className="hiw-separator-line" />
      </div>

      <section className="hiw-section">
        <div className="hiw-header">
          <div className="hiw-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Process
          </div>
          <h2>How It <span>Works</span></h2>
          <p>From request to completion — manage your skip logistics in five simple steps</p>
        </div>

        <div className="hiw-grid">
          {howItWorks.map((item, i) => (
            <FlipCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}