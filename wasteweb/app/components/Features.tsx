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
    <section className="relative flex flex-col items-center bg-[#f5faf6] py-20 px-6 font-quicksand">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_0%_0%,rgba(20,60,35,0.09)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(20,60,35,0.07)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,213,46,0.04)_0%,transparent_60%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-[560px] w-full text-center mb-10">
        <motion.h2 
          className="font-quicksand text-[clamp(1.8rem,4vw,2.4rem)] font-bold text-[#1a2e1f] leading-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Everything you need on site
        </motion.h2>

        <motion.p 
          className="text-[#556b5e] text-base font-medium leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          Manage your fleet, approvals, and compliance from one clean interface
          built for the field.
        </motion.p>
      </div>

      {/* DESKTOP: Grid Layout */}
      {!isMobile && (
        <div className="relative z-10 grid grid-cols-[repeat(auto-fit,minmax(260px,300px))] gap-6 max-w-[1024px] w-full justify-center items-center">
          {features.map((feature, i) => (
            <div key={feature.title} className="w-full">
              <FeatureCard feature={feature} index={i} />
            </div>
          ))}
        </div>
      )}

      {/* MOBILE: Swipe-only Carousel */}
      {isMobile && (
        <div className="relative z-10 w-full max-w-[320px] mx-auto overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out cursor-grab"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="flex-shrink-0 w-full transition-transform duration-300 ease-out px-2"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                <FeatureCard feature={feature} index={i} />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? "bg-[#2e7d52] w-3" : "bg-[#c6e2d0]"
                }`}
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
      className="feature-card-container w-full h-[260px] [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.11 }}
    >
      <div
        className="relative w-full h-full [transform-style:preserve-3d] transition-all duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] rounded-2xl shadow-sm border border-[#c6e2d0]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-2xl p-6 flex flex-col box-border">
          <div className="feature-icon w-[38px] h-[38px] rounded-xl bg-[#e8f5ee] flex items-center justify-center mb-3">
            <Icon size={20} color="#2e7d52" strokeWidth={1.8} />
          </div>
          <p className="text-[#1a2e1f] text-sm font-bold mb-1">
            {feature.title}
          </p>
          <p className="text-[#556b5e] text-sm font-medium leading-relaxed mb-1">
            {feature.description}
          </p>
          <p className="text-[#7a9585] text-xs leading-relaxed flex-1 overflow-hidden line-clamp-3">
            {feature.shortDetail}
          </p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-[#132d1e] rounded-2xl p-6 [transform:rotateY(180deg)] flex flex-col justify-between box-border">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} color="#2e7d52" strokeWidth={1.8} />
              <p className="text-[#d6f0e0] text-sm font-bold m-0">
                {feature.title}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} color="#2e7d52" />
                <span className="text-[#a8d9be] text-xs font-semibold">{feature.stat}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} color="#2e7d52" />
                <span className="text-[#a8d9be] text-xs font-semibold">{feature.metric}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={13} color="#2e7d52" />
                <span className="text-[#a8d9be] text-xs font-semibold">{feature.extraMetric}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-[#B8D52E]/10 py-1.5 px-2.5 rounded-lg border border-[#B8D52E]/20 mt-3">
            <Shield size={12} color="#B8D52E" />
            <span className="text-[#c8e87a] text-xs font-semibold tracking-wide">Enterprise grade security</span>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
}