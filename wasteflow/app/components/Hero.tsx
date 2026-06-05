"use client";

import { ArrowRight, Play, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ─── SITE ROWS ────────────────────────────────────────────────────────────────
const siteRows = [
  { site: "Site Alpha — E14", pct: 82, status: "Active" },
  { site: "Site Beta — SE1",  pct: 47, status: "Pending" },
  { site: "Site Gamma — N1",  pct: 91, status: "Active" },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Truck image component to avoid duplication
  const TruckImage = () => (
    <div style={{
      padding: "1.5rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      background: "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,47,39,0.4) 100%)",
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.09)",
    }}>
      <img
        src="/truck.png"
        alt="Skip delivery truck"
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
          borderRadius: "0.5rem",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const fallbackSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            fallbackSvg.setAttribute("width", "280");
            fallbackSvg.setAttribute("height", "140");
            fallbackSvg.setAttribute("viewBox", "0 0 280 140");
            fallbackSvg.style.maxWidth = "100%";
            fallbackSvg.innerHTML = `
              <rect width="280" height="140" rx="8" fill="#1a4a3f" />
              <rect x="20" y="50" width="160" height="50" rx="8" fill="#B8D52E" opacity="0.9" />
              <circle cx="55" cy="110" r="18" fill="#222" />
              <circle cx="55" cy="110" r="10" fill="#444" />
              <circle cx="145" cy="110" r="18" fill="#222" />
              <circle cx="145" cy="110" r="10" fill="#444" />
              <rect x="190" y="40" width="70" height="60" rx="6" fill="#2a6b5a" />
              <text x="225" y="75" fill="#B8D52E" font-size="12" font-family="Quicksand, sans-serif" text-anchor="middle">SKIP</text>
              <path d="M30 50 L40 20 L180 20 L190 50 Z" fill="#8BAA1F" />
            `;
            parent.appendChild(fallbackSvg);
          }
        }}
      />
    </div>
  );

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "#002F27",
      fontFamily: "'Quicksand', sans-serif",
    }}>

      {/* ── KEYFRAMES ──────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Quicksand', sans-serif;
        }

        @keyframes blobTopRight {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.12) translate(16px, -12px); }
        }
        @keyframes blobBottomLeft {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.08) translate(-10px, 0px); }
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          background: #B8D52E;
          color: #002F27;
          transition: all 0.2s;
          white-space: nowrap;
          cursor: pointer;
          border: none;
          font-family: 'Quicksand', sans-serif;
        }
        .hero-btn-primary:hover { background: #DDE11A; transform: translateY(-2px) scale(1.04); }
        .hero-btn-primary:active { transform: scale(0.96); }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.75);
          transition: all 0.2s;
          white-space: nowrap;
          cursor: pointer;
          background: transparent;
          font-family: 'Quicksand', sans-serif;
        }
        .hero-btn-secondary:hover { border-color: rgba(184,213,46,0.45); color: #fff; transform: translateY(-2px) scale(1.04); }
        .hero-btn-secondary:active { transform: scale(0.96); }

        /* Responsive hero grid */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
          }
        }

        /* Mobile menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 80%;
          max-width: 300px;
          background: #00332A;
          z-index: 1000;
          padding: 2rem 1.5rem;
          box-shadow: -4px 0 20px rgba(0,0,0,0.3);
          font-family: 'Quicksand', sans-serif;
        }

        /* Hide right column content on mobile */
        .desktop-only {
          display: none;
        }
        @media (min-width: 1024px) {
          .desktop-only {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            align-items: stretch;
          }
        }

        /* Mobile truck image wrapper */
        .mobile-truck {
          display: block;
          margin: 1.5rem 0;
        }
        @media (min-width: 1024px) {
          .mobile-truck {
            display: none;
          }
        }
      `}</style>

      {/* ── BACKGROUND LAYERS ──────────────────────────────────────────── */}

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Top-right lime blob */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          x: [0, 16, 0],
          y: [0, -12, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "520px", height: "520px", borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(184,213,46,0.18) 0%, transparent 65%)",
          filter: "blur(48px)",
        }}
      />

      {/* Bottom-left green blob */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          x: [0, -10, 0],
          y: [0, 0, 0],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute", bottom: 0, left: "-60px",
          width: "400px", height: "400px", borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(0,80,60,0.55) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Centre ambient */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px", height: "700px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(0,60,48,0.4) 0%, transparent 65%)",
        filter: "blur(80px)",
      }} />

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 100,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <Menu size={24} color="#B8D52E" />
        </button>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 999,
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="mobile-menu"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={24} color="#B8D52E" />
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "3rem" }}>
                <a href="#features" style={{ color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 500, fontFamily: "'Quicksand', sans-serif" }}>Features</a>
                <a href="#pricing" style={{ color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 500, fontFamily: "'Quicksand', sans-serif" }}>Pricing</a>
                <a href="#about" style={{ color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 500, fontFamily: "'Quicksand', sans-serif" }}>About</a>
                <a href="#contact" style={{ color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 500, fontFamily: "'Quicksand', sans-serif" }}>Contact</a>
                <button className="hero-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Get Started
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "72px",
      }}>
        <div style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: isMobile ? "2rem 1.5rem" : "4rem 1.5rem",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div className="hero-grid">

            {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
            >

              {/* Category pill */}
              <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                  padding: "0.45rem 1rem", borderRadius: "9999px",
                  border: "1px solid rgba(184,213,46,0.3)",
                  background: "rgba(184,213,46,0.08)", color: "#B8D52E",
                  fontFamily: "'Quicksand', sans-serif",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#B8D52E",
                      display: "inline-block", flexShrink: 0,
                    }}
                  />
                  Construction Waste Logistics
                </span>
              </motion.div>

              {/* Headline - Quicksand applied here */}
              <motion.div
                variants={itemVariants}
                style={{ marginBottom: "1.25rem" }}
              >
                <h1
                  style={{
                    fontSize: "clamp(2.4rem, 4.5vw, 4rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.025em",
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  Skip Deliveries,<br />
                  <span style={{ color: "#B8D52E", fontFamily: "'Quicksand', sans-serif" }}>Done Right.</span>
                </h1>
              </motion.div>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.55)",
                  margin: "0 0 2rem 0",
                  maxWidth: "30rem",
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                Approve dispatch, track skips in real time, and eliminate
                delays all in one platform built for construction sites.
              </motion.p>

              {/* Mobile Truck Image - appears AFTER the subheadline text on mobile only */}
              <div className="mobile-truck">
                <TruckImage />
              </div>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "2rem",
                }}
              >
                <button className="hero-btn-primary">
                  Get Started Free
                  <ArrowRight size={15} />
                </button>
                <button className="hero-btn-secondary">
                  <span style={{
                    width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Play size={9} fill="#B8D52E" color="#B8D52E" style={{ marginLeft: "1px" }} />
                  </span>
                  Watch Demo
                </button>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN ── Desktop Only (Truck Image on Desktop) ─────────── */}
            <div className="desktop-only">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "'Quicksand', sans-serif" }}>
                    Live Fleet Tracking
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "#B8D52E", fontFamily: "'Quicksand', sans-serif" }}>
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#B8D52E",
                        display: "inline-block",
                      }}
                    />
                    3 Active
                  </span>
                </div>

                {/* Truck Image */}
                <TruckImage />
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom edge fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "6rem",
        pointerEvents: "none",
        background: "linear-gradient(to bottom, transparent, rgba(0,47,39,0.15))",
      }} />
    </section>
  );
}