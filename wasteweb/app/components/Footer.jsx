"use client";

import { Mail, MapPin, Phone, ChevronUp, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const footerLinks = {
    Company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Press", href: "#press" },
      { name: "Blog", href: "#blog" },
    ],
    Solutions: [
      { name: "Skip Tracking", href: "#tracking" },
      { name: "Fleet Management", href: "#fleet" },
      { name: "Site Analytics", href: "#analytics" },
      { name: "API Access", href: "#api" },
    ],
    Support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "Documentation", href: "#docs" },
      { name: "Status", href: "#status" },
    ],
  };

  const socialLinks = [
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
    },
  ];

  const linkColStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  const headingStyle = {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "1.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const linkStyle = {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    display: "inline-block",
    transition: "color 0.2s, transform 0.2s",
  };

  return (
    <footer style={{
      position: "relative",
      background: "#002F27",
      borderTop: "1px solid rgba(184,213,46,0.12)",
      fontFamily: "'Quicksand', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(184,213,46,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, #B8D52E, #B8D52E, transparent)",
      }} />

      {/* Bottom-right glow */}
      <div style={{
        position: "absolute", bottom: "-100px", right: "-100px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,213,46,0.06) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: "80rem", margin: "0 auto",
        padding: "3rem 1.5rem 1.5rem",
      }}>

        {/* ── LOGO ROW — standalone at the top ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <Image
            src="/logo.png"
            alt="WasteFlow Logo"
            width={140}
            height={42}
            style={{ height: "auto", width: "auto", maxWidth: "140px" }}
            priority
          />
        </motion.div>

        {/* ── MAIN GRID — description/contact/social + 3 link columns ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3rem",
          alignItems: "start",
        }}>

          {/* ── Column 1: Description + Contact + Social ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.65,
              margin: 0,
            }}>
              Streamlining construction waste logistics with skip tracking and fleet management.
            </p>

            {/* Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                { Icon: MapPin, text: "Wasteflow Ventures Limited | 854 Bristol Road Selly Oak Birmingham B29 6HW | Registered in England and Wales" },
                { Icon: Phone, text: "+447867386257" },
                { Icon: Mail, text: "info@wasteflow.org" },
                { Icon: Building2, text: "Company No: 17247994" }
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <Icon size={15} color="#B8D52E" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "2rem", height: "2rem", borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "border-color 0.2s",
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── Column 2: Company ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <h4 style={headingStyle}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...linkColStyle }}>
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Column 3: Solutions ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 style={headingStyle}>Solutions</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...linkColStyle }}>
              {footerLinks.Solutions.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Column 4: Support ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <h4 style={headingStyle}>Support</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...linkColStyle }}>
              {footerLinks.Support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} WasteFlow. All rights reserved.
          </p>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms", "Cookies"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#B8D52E"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "fixed", bottom: "2rem", right: "2rem",
            width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem",
            background: "#B8D52E", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(184,213,46,0.3)", zIndex: 100,
          }}
        >
          <ChevronUp size={18} color="#002F27" />
        </motion.button>
      )}
    </footer>
  );
}