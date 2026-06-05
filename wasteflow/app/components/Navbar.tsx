"use client";

import { useEffect, useState } from "react";
import { X, Menu, ArrowRight } from "lucide-react";

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const DARK_GREEN = "#002F27";
const LIME = "#B8D52E";
const BRIGHT_LIME = "#DDE11A";

const navLinks = [
  { label: "Features",     href: "#features" },
  { label: "Pricing",      href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

// ─── DESKTOP NAV LINK ─────────────────────────────────────────────────────────
function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="nav-link">
      {label}
      <span className="nav-underline" />
    </a>
  );
}

// ─── MOBILE NAV LINK ──────────────────────────────────────────────────────────
function MobileNavLink({
  label,
  href,
  index,
  onClick,
}: {
  label: string;
  href: string;
  index: number;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="mobile-link"
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      <span>{label}</span>
      <span className="mobile-link-arrow">
        <ArrowRight size={14} />
      </span>
      <span className="mobile-link-underline" />
    </a>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── GLOBAL STYLES ──────────────────────────────────────────────── */}
      <style>{`
        /* Navbar entrance */
        @keyframes navSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }

        /* Mobile link stagger */
        @keyframes mobileLinkIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Mobile panel slide */
        @keyframes panelSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes panelSlideOut {
          from { transform: translateY(0);      opacity: 1; }
          to   { transform: translateY(-100%);  opacity: 0; }
        }

        /* Backdrop fade */
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Icon spin */
        @keyframes spinIn  { from { transform: rotate(-90deg); opacity: 0; } to { transform: rotate(0deg);   opacity: 1; } }
        @keyframes spinOut { from { transform: rotate(0deg);   opacity: 1; } to { transform: rotate(90deg);  opacity: 0; } }

        /* Panel CTA entrance */
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── HEADER ── */
        .wf-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          animation: navSlideDown 0.55s ease forwards;
          transition: background 0.3s ease, border-bottom 0.3s ease, backdrop-filter 0.3s ease;
        }
        .wf-header.scrolled {
          background: rgba(0,47,39,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* ── INNER BAR ── */
        .wf-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 95px;
        }

        /* ── BRAND ── */
        .wf-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          user-select: none;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .wf-brand:hover  { transform: scale(1.02); }
        .wf-brand:active { transform: scale(0.97); }
        .wf-logo {
          height: 75px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        /* ── DESKTOP NAV ── */
        .wf-desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
          /* sits in the centre of the three-column layout */
        }

        .nav-link {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding-bottom: 4px;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .nav-link:hover { color: #fff; }
        .nav-underline {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          width: 0%;
          background: ${LIME};
          border-radius: 999px;
          transition: width 0.3s ease;
        }
        .nav-link:hover .nav-underline { width: 100%; }

        /* ── DESKTOP CTA ── */
        .wf-desktop-cta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .wf-cta-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          background: ${LIME};
          color: ${DARK_GREEN};
          border: 2px solid ${LIME};
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
          cursor: pointer;
        }
        .wf-cta-btn:hover  { background: ${BRIGHT_LIME}; border-color: ${BRIGHT_LIME}; transform: translateY(-1px) scale(1.04); }
        .wf-cta-btn:active { transform: scale(0.96); }

        /* ── HAMBURGER ── */
        .wf-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
          flex-shrink: 0;
        }
        .wf-hamburger:active { transform: scale(0.93); }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 767px) {
          .wf-desktop-nav { display: none; }
          .wf-desktop-cta { display: none; }
          .wf-hamburger   { display: flex; }
          .wf-inner {
            height: 95px;
          }
        }
        @media (min-width: 768px) {
          .wf-hamburger { display: none; }
        }

        /* ── BACKDROP ── */
        .wf-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(0,10,8,0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: backdropIn 0.25s ease forwards;
        }

        /* ── MOBILE PANEL ── */
        .wf-panel {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: ${DARK_GREEN};
          border-bottom: 1px solid rgba(255,255,255,0.07);
          animation: panelSlideIn 0.35s cubic-bezier(0.32,0.72,0,1) forwards;
        }
        .wf-panel.closing {
          animation: panelSlideOut 0.3s cubic-bezier(0.32,0.72,0,1) forwards;
        }

        .wf-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 95px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        /* Replace panel title with logo */
        .wf-panel-logo {
          height: 75px;
          width: auto;
          display: block;
          object-fit: contain;
        }
        .wf-panel-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: background 0.2s;
        }
        .wf-panel-close:hover  { background: rgba(255,255,255,0.12); }
        .wf-panel-close:active { transform: scale(0.93); }

        /* ── MOBILE LINKS ── */
        .wf-panel-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 24px 0;
          overflow-y: auto;
        }
        .mobile-link {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
          opacity: 0;
          animation: mobileLinkIn 0.3s ease forwards;
        }
        .mobile-link:hover { color: #fff; }
        .mobile-link-arrow {
          color: ${LIME};
          display: flex;
          align-items: center;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .mobile-link:hover .mobile-link-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .mobile-link-underline {
          position: absolute;
          bottom: -1px; left: 0;
          height: 1px;
          width: 0%;
          background: ${LIME};
          transition: width 0.3s ease;
        }
        .mobile-link:hover .mobile-link-underline { width: 100%; }

        /* ── PANEL CTA AREA ── */
        .wf-panel-ctas {
          padding: 24px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          animation: ctaFadeUp 0.3s ease forwards 0.28s;
        }
        .panel-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          background: ${LIME};
          color: ${DARK_GREEN};
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          box-sizing: border-box;
        }
        .panel-btn-primary:hover { background: ${BRIGHT_LIME}; }

        .panel-btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
          box-sizing: border-box;
        }
        .panel-btn-secondary:hover {
          color: #fff;
          border-color: rgba(184,213,46,0.35);
        }
      `}</style>

      {/* ── NAVBAR BAR ─────────────────────────────────────────────────── */}
      <header className={`wf-header${scrolled ? " scrolled" : ""}`}>
        <div className="wf-inner">

          {/* Brand */}
          <a href="/" className="wf-brand">
            <img src="/logo.png" alt="WasteFlow" className="wf-logo" />
          </a>

          {/* Desktop nav — centred by the space-between on wf-inner */}
          <nav className="wf-desktop-nav">
            {navLinks.map((link) => (
              <NavLink key={link.label} label={link.label} href={link.href} />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="wf-desktop-cta">
            <a href="#demo" className="wf-cta-btn">Get Started</a>
          </div>

          {/* Hamburger */}
          <button
            className={`wf-hamburger${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span style={{
              display: "flex",
              animation: mobileOpen ? "spinIn 0.18s ease forwards" : "spinIn 0.18s ease forwards",
            }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </span>
          </button>

        </div>
      </header>

      {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div className="wf-backdrop" onClick={() => setMobileOpen(false)} />

          <div className="wf-panel">
            {/* Header with logo instead of menu text */}
            <div className="wf-panel-header">
              <img src="/logo.png" alt="WasteFlow" className="wf-panel-logo" />
              <button className="wf-panel-close" onClick={() => setMobileOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Links */}
            <nav className="wf-panel-nav">
              {navLinks.map((link, i) => (
                <MobileNavLink
                  key={link.label}
                  label={link.label}
                  href={link.href}
                  index={i}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            {/* CTAs */}
            <div className="wf-panel-ctas">
              <a href="#demo" className="panel-btn-primary" onClick={() => setMobileOpen(false)}>
                Get Started
                <ArrowRight size={14} />
              </a>
              <a href="#demo" className="panel-btn-secondary" onClick={() => setMobileOpen(false)}>
                Watch Demo
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}