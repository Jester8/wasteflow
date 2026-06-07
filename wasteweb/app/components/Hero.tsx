"use client";

import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ─── TYPEWRITER HOOK ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 55, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      if (!text) { setDone(true); return; }
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ─── SLIDES ───────────────────────────────────────────────────────────────────
const heroSlides = [
  {
    image: "/truck.png",
    eyebrow: "Skip Deliveries, Done Right.",
    headline: "Construction sites across the UK",
    highlight: "run smoother, faster.",
    sub: "Approve dispatch, track skips in real time, and eliminate delays — built for UK construction sites.",
  },
  {
    image: "/truck.png",
    eyebrow: "Real-Time Fleet Tracking.",
    headline: "Every skip, every driver,",
    highlight: "always in sight.",
    sub: "Live GPS across your entire fleet so you always know where your skips are and when they arrive on site.",
  },
  {
    image: "/truck.png",
    eyebrow: "Smarter Waste Logistics.",
    headline: "Cut costs, cut delays,",
    highlight: "cut your carbon.",
    sub: "Data-driven dispatch routes cut fuel spend and carbon footprint on every job across the UK.",
  },
];

export default function Hero() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const slide = heroSlides[slideIndex];
  const { displayed: dH, done: doneH } = useTypewriter(slide.headline, 48, 500);
  const { displayed: dLi, done: doneLi } = useTypewriter(doneH ? slide.highlight : "", 48, 80);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setSlideIndex(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [autoplay, slideIndex]);

  const goTo = (i: number) => {
    setSlideIndex(i);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 9000);
  };

  const nextSlide = () => {
    goTo((slideIndex + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    goTo((slideIndex - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Quicksand', sans-serif",
        background: "#001a13",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        * { font-family: 'Quicksand', sans-serif; box-sizing: border-box; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .tw-cursor {
          display: inline-block; width: 3px; height: 0.85em;
          background: #B8D52E; border-radius: 2px;
          margin-left: 3px; vertical-align: middle;
          animation: blink 0.9s step-start infinite;
        }
        .tw-cursor.off { opacity: 0; animation: none; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #B8D52E; color: #001a13;
          border: none; border-radius: 0.6rem;
          font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.18s;
          white-space: nowrap; font-family: 'Quicksand', sans-serif;
          font-size: 0.78rem; padding: 0.6rem 1rem;
        }
        @media (min-width: 768px) {
          .btn-primary { font-size: 0.9rem; padding: 0.8rem 1.4rem; }
        }
        .btn-primary:hover { background: #d4ef2e; transform: translateY(-2px) scale(1.04); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.8); border-radius: 0.6rem;
          font-weight: 600; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.78rem; padding: 0.6rem 1rem;
          backdrop-filter: blur(6px);
        }
        @media (min-width: 768px) {
          .btn-secondary { font-size: 0.9rem; padding: 0.8rem 1.4rem; }
        }
        .btn-secondary:hover { border-color: rgba(184,213,46,0.5); color:#fff; transform: translateY(-2px); }

        .dot-btn { background: none; border: none; padding: 4px; cursor: pointer; }

        .md-hide { display: flex; }
        .md-show { display: none; }
        @media (min-width: 768px) {
          .md-hide { display: none; }
          .md-show { display: flex; }
        }
      `}</style>

      {/* ── FULL-BLEED BACKGROUND SLIDES ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${slideIndex}`}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={slide.image}
              alt=""
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark scrim */}
        <div style={{
          position: "absolute", inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,20,14,0.82) 0%, rgba(0,20,14,0.55) 35%, rgba(0,20,14,0.60) 65%, rgba(0,20,14,0.90) 100%)",
        }} />

        {/* Lime glow */}
        <div style={{
          position: "absolute", bottom: "-80px", left: "-60px",
          width: "500px", height: "350px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,213,46,0.10) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{
        position: "relative", zIndex: 10,
        flex: 1, display: "flex", flexDirection: "column",
      }}>

        {/* Hero copy */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(5rem, 12vw, 9rem) clamp(1.25rem, 5vw, 5rem) 5rem",
        }}>
          <div style={{ maxWidth: "660px" }}>

            {/* Eyebrow pill */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`eyebrow-${slideIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: "1.1rem" }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.45rem",
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                  padding: "0.38rem 0.9rem", borderRadius: "9999px",
                  border: "1px solid rgba(184,213,46,0.35)",
                  background: "rgba(184,213,46,0.09)", color: "#B8D52E",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "#B8D52E", display: "inline-block", flexShrink: 0 }}
                  />
                  {slide.eyebrow}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Typewriter headline */}
            <h1 style={{
              fontSize: "clamp(2rem, 5.5vw, 3.8rem)",
              lineHeight: 1.1, letterSpacing: "-0.025em", fontWeight: 700,
              color: "#fff", margin: "0 0 1.1rem 0",
              minHeight: "2.5em",
            }}>
              <span>
                {dH}
                {!doneH && <span className="tw-cursor" />}
              </span>
              {doneH && <br />}
              {doneH && (
                <span style={{ color: "#B8D52E" }}>
                  {dLi}
                  <span className={`tw-cursor${doneLi ? " off" : ""}`} />
                </span>
              )}
            </h1>

            {/* Subtext */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${slideIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                style={{
                  fontSize: "clamp(0.875rem, 1.8vw, 1rem)",
                  lineHeight: 1.75, color: "rgba(255,255,255,0.55)",
                  margin: "0 0 2rem 0", maxWidth: "28rem",
                }}
              >
                {slide.sub}
              </motion.p>
            </AnimatePresence>

            {/* CTA — always side by side */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.65rem", flexWrap: "nowrap" }}
            >
              <button className="btn-primary">
                Get Started Free
                <ArrowRight size={14} />
              </button>
              <button className="btn-secondary">
                <span style={{
                  width: "1.3rem", height: "1.3rem", borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Play size={8} fill="#B8D52E" color="#B8D52E" style={{ marginLeft: "1px" }} />
                </span>
                Watch Demo
              </button>
            </motion.div>

          </div>
        </div>

        {/* ── DOTS — mobile: bottom-centre ── */}
        <div
          className="md-hide"
          style={{
            position: "absolute", bottom: "1.25rem", left: "50%",
            transform: "translateX(-50%)",
            alignItems: "center", gap: "6px", zIndex: 20,
          }}
        >
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="dot-btn" aria-label={`Slide ${i + 1}`}>
              <motion.div
                animate={{
                  width: i === slideIndex ? 20 : 8,
                  backgroundColor: i === slideIndex ? "#B8D52E" : "rgba(255,255,255,0.4)",
                }}
                transition={{ duration: 0.25 }}
                style={{ height: "4px", borderRadius: "9999px" }}
              />
            </button>
          ))}
        </div>

        {/* ── DOTS — desktop: bottom-left ── */}
        <div
          className="md-show"
          style={{
            position: "absolute", bottom: "2rem",
            left: "clamp(1.25rem, 5vw, 5rem)",
            alignItems: "center", gap: "6px", zIndex: 20,
          }}
        >
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="dot-btn" aria-label={`Slide ${i + 1}`}>
              <motion.div
                animate={{
                  width: i === slideIndex ? 28 : 10,
                  backgroundColor: i === slideIndex ? "#B8D52E" : "rgba(255,255,255,0.35)",
                }}
                transition={{ duration: 0.25 }}
                style={{ height: "4px", borderRadius: "9999px" }}
              />
            </button>
          ))}
        </div>

        {/* Slide counter — desktop only, bottom right */}
        <div
          className="md-show"
          style={{
            position: "absolute", bottom: "2rem", right: "clamp(1.25rem, 5vw, 5rem)",
            fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em", zIndex: 20,
          }}
        >
          {String(slideIndex + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
        </div>

        {/* Previous Button - Mobile Only */}
        <button
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            backdropFilter: "blur(8px)",
            zIndex: 20,
          }}
          className="md-hide"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Next Button - Mobile Only */}
        <button
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            backdropFilter: "blur(8px)",
            zIndex: 20,
          }}
          className="md-hide"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </section>
  );
}