"use client";

import { Mail, MapPin, Phone, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Simple SVG icons for social media
  const SocialIcons = {
    Facebook: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    Twitter: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    ),
    Linkedin: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    Instagram: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  };

  return (
    <footer style={{
      position: "relative",
      background: "#002F27",
      borderTop: "1px solid rgba(184,213,46,0.12)",
      fontFamily: "'Quicksand', sans-serif",
      overflow: "hidden",
    }}>
      
      {/* Background decorative elements */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(184,213,46,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      
      {/* Top accent line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, #B8D52E, #B8D52E, transparent)",
      }} />

      {/* Subtle lime glow at bottom right */}
      <div style={{
        position: "absolute",
        bottom: "-100px",
        right: "-100px",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,213,46,0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "3rem 1.5rem 1.5rem",
      }}>
        
        {/* Main Footer Content */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}>
          
          {/* Brand Column */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem",
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <Image
                  src="/logo.png"
                  alt="WasteFlow Logo"
                  width={140}
                  height={42}
                  style={{
                    height: "auto",
                    width: "auto",
                    maxWidth: "140px",
                  }}
                  priority
                />
              </div>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.55)",
                marginTop: "0.75rem",
                lineHeight: 1.6,
              }}>
                Streamlining construction waste logistics with real-time skip tracking and fleet management.
              </p>
            </motion.div>

            {/* Contact Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <MapPin size={16} color="#B8D52E" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                  123 Construction Way, London SE1 9SG
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Phone size={16} color="#B8D52E" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                  +44 (0) 20 1234 5678
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Mail size={16} color="#B8D52E" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                  hello@wasteflow.org
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <motion.a
                href="#"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
              >
                <SocialIcons.Facebook />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
              >
                <SocialIcons.Twitter />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
              >
                <SocialIcons.Linkedin />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
              >
                <SocialIcons.Instagram />
              </motion.a>
            </div>
          </div>

          {/* Links Columns - Company, Solutions, Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Company
            </h4>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Solutions
            </h4>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              {footerLinks.Solutions.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Support
            </h4>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              {footerLinks.Support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#B8D52E";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
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

        {/* Bottom Bar */}
        <div style={{
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}>
          <p style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}>
            © {new Date().getFullYear()} WasteFlow. All rights reserved.
          </p>
          
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a
              href="#privacy"
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#B8D52E"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              Privacy
            </a>
            <a
              href="#terms"
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#B8D52E"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              Terms
            </a>
            <a
              href="#cookies"
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#B8D52E"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              Cookies
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Shows after scrolling */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.75rem",
            background: "#B8D52E",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(184,213,46,0.3)",
            zIndex: 100,
          }}
        >
          <ChevronUp size={18} color="#002F27" />
        </motion.button>
      )}
    </footer>
  );
}