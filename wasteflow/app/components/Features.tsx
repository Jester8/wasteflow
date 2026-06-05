"use client";

import { useState, useEffect } from "react";
import * as motion from "framer-motion/client";
import { MapPin, Truck, FileText, Clock, CheckCircle, BarChart3, Shield } from "lucide-react";

const features = [
  {
    title: "Real-Time Tracking",
    description: "Know exactly where every skip is, at all times.",
    shortDetail: "Live GPS visibility, smart ETAs, and route optimization from one dashboard.",
    stat: "99.9% uptime",
    metric: "Updates every 30s",
    extraMetric: "Live route optimization",
    icon: MapPin,
  },
  {
    title: "Dispatch Approval",
    description: "Approve or delay collections without a single call.",
    shortDetail: "Smart workflows and automated scheduling reduce unnecessary trips by 40%.",
    stat: "40% fewer trips",
    metric: "Instant approvals",
    extraMetric: "Smart routing algorithms",
    icon: Truck,
  },
  {
    title: "Waste Reports",
    description: "Automated logs for compliance and recycling targets.",
    shortDetail: "Track volumes, recycling rates, and sustainability goals effortlessly.",
    stat: "100% compliant",
    metric: "Automated reporting",
    extraMetric: "Real-time analytics",
    icon: FileText,
  },
];

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <motion.h2 
          style={styles.heading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Everything you need on site
        </motion.h2>

        <motion.p 
          style={styles.subheading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          Manage your fleet, approvals, and compliance from one clean interface
          built for the field.
        </motion.p>
      </div>

      {/* DESKTOP: Original Grid Layout */}
      {!isMobile && (
        <div style={styles.grid}>
          {features.map((feature, i) => (
            <div key={feature.title} style={{ width: "100%" }}>
              <FeatureCard feature={feature} index={i} />
            </div>
          ))}
        </div>
      )}

      {/* MOBILE: Swipe-only Carousel */}
      {isMobile && (
        <div style={styles.carouselContainer}>
          <div 
            style={styles.carouselTrack}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {features.map((feature, i) => (
              <div
                key={feature.title}
                style={{
                  ...styles.slide,
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                <FeatureCard feature={feature} index={i} />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div style={styles.dotsContainer}>
            {features.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.dot,
                  backgroundColor: idx === currentIndex ? "#2e7d52" : "#c6e2d0",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      className="feature-card-container"
      style={styles.cardContainer}
      onClick={() => setIsFlipped(!isFlipped)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.11 }}
    >
      <div
        style={{
          ...styles.flipper,
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div style={styles.cardFront}>
          <div style={styles.iconWrap} className="feature-icon">
            <Icon size={20} color="#2e7d52" strokeWidth={1.8} />
          </div>
          <p style={styles.cardTitle}>{feature.title}</p>
          <p style={styles.cardDesc}>{feature.description}</p>
          <p style={styles.cardMiniText}>{feature.shortDetail}</p>
        </div>

        {/* Back */}
        <div style={styles.cardBack}>
          <div style={styles.backHeader}>
            <Icon size={18} color="#2e7d52" strokeWidth={1.8} />
            <p style={styles.backTitle}>{feature.title}</p>
          </div>
          <div style={styles.statsContainer}>
            <div style={styles.statRow}>
              <CheckCircle size={13} color="#2e7d52" />
              <span style={styles.statText}>{feature.stat}</span>
            </div>
            <div style={styles.statRow}>
              <Clock size={13} color="#2e7d52" />
              <span style={styles.statText}>{feature.metric}</span>
            </div>
            <div style={styles.statRow}>
              <BarChart3 size={13} color="#2e7d52" />
              <span style={styles.statText}>{feature.extraMetric}</span>
            </div>
          </div>
          <div style={styles.metricBadge}>
            <Shield size={12} color="#B8D52E" />
            <span style={styles.metricText}>Enterprise grade security</span>
          </div>
        </div>
      </div>

      <style>{`
        .feature-card-container .feature-icon {
          transition: background-color 0.3s ease;
        }
        .feature-card-container:hover .feature-icon {
          background-color: #a8dfc4;
        }
      `}</style>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    backgroundColor: "#f5faf6",
    backgroundImage: `
      radial-gradient(ellipse at 0% 0%, rgba(20, 60, 35, 0.09) 0%, transparent 55%),
      radial-gradient(ellipse at 100% 100%, rgba(20, 60, 35, 0.07) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, rgba(184,213,46,0.04) 0%, transparent 60%)
    `,
    padding: "5rem 1.5rem",
    fontFamily: "'Quicksand', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  header: {
    maxWidth: "560px",
    marginBottom: "2.5rem",
    textAlign: "center",
    width: "100%",
  },
  heading: {
    fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
    fontWeight: 700,
    color: "#1a2e1f",
    lineHeight: 1.2,
    margin: "0 0 0.75rem 0",
    fontFamily: "'Quicksand', sans-serif",
  },
  subheading: {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#556b5e",
    lineHeight: 1.6,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 300px))",
    gap: "24px",
    maxWidth: "1024px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "320px",
    margin: "0 auto",
    overflow: "hidden",
  },
  carouselTrack: {
    display: "flex",
    transition: "transform 0.3s ease-out",
    cursor: "grab",
  },
  slide: {
    flex: "0 0 100%",
    width: "100%",
    transition: "transform 0.3s ease-out",
    padding: "0 0.5rem",
  },
  dotsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "24px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    transition: "all 0.2s",
  },
  cardContainer: {
    width: "100%",
    height: "260px",
    perspective: "1000px",
    cursor: "pointer",
  },
  flipper: {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
    transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #c6e2d0",
  },
  cardFront: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "1.4rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  cardBack: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    backgroundColor: "#132d1e",
    borderRadius: "14px",
    padding: "1.3rem 1.2rem",
    transform: "rotateY(180deg)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  backHeader: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "12px",
  },
  backTitle: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#d6f0e0",
    margin: 0,
  },
  statsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
    justifyContent: "center",
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },
  statText: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#a8d9be",
  },
  metricBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(184,213,46,0.1)",
    padding: "6px 10px",
    borderRadius: "8px",
    justifyContent: "center",
    marginTop: "12px",
    border: "1px solid rgba(184,213,46,0.2)",
  },
  metricText: {
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#c8e87a",
    letterSpacing: "0.02em",
  },
  iconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#e8f5ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.75rem",
  },
  cardTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#1a2e1f",
    margin: "0 0 0.35rem 0",
  },
  cardDesc: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#556b5e",
    lineHeight: 1.5,
    margin: "0 0 0.4rem 0",
  },
  cardMiniText: {
    fontSize: "0.7rem",
    fontWeight: 400,
    color: "#7a9585",
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
};