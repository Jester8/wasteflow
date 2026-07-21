"use client";

import Link from "next/link";

const OPTIONS = [
  {
    title: "Sign up as a Company",
    sub: "Operator Admin — onboard your fleet, price list, and dispatch",
    href: "/signup?role=operatorAdmin",
  },
  {
    title: "Sign in as Fleet Operator",
    sub: "Driver access to jobs assigned to you",
    href: "/operators/login",
  },
  {
    title: "Sign up your Site",
    sub: "Contractor — request skips for your construction site",
    href: "/signup?role=contractor",
  },
  {
    title: "Sign in as Contractor",
    sub: "Returning site contractor",
    href: "/login?role=contractor",
  },
];

export default function GetStartedModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,22,13,0.55)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440, background: "#ffffff", borderRadius: 18,
        padding: 28, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#B8D52E", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              WasteFlow
            </p>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a2e1f", margin: "4px 0 0" }}>
              Get Started
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 9, border: "none", background: "#f0f7f2",
              color: "#4a7a5a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#6b8f7a", fontWeight: 600, margin: "0 0 20px" }}>
          Choose how you'd like to continue.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OPTIONS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              style={{
                display: "block", padding: "14px 16px", borderRadius: 12,
                border: "1px solid #e8f2eb", textDecoration: "none",
                transition: "border-color 0.15s, background 0.15s",
              }}
              className="wf-getstarted-option"
            >
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{o.title}</p>
              <p style={{ fontSize: "0.76rem", color: "#6b8f7a", fontWeight: 600, margin: "3px 0 0" }}>{o.sub}</p>
            </Link>
          ))}
        </div>

        <style>{`
          .wf-getstarted-option:hover { border-color: #B8D52E !important; background: #f5faf6; }
        `}</style>
      </div>
    </div>
  );
}
