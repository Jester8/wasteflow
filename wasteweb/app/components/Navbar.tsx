"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import "./navbar.css";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Header */}
      <header className={`wf-header ${scrolled ? "scrolled" : ""}`}>
        <div className="wf-inner">
          {/* Logo */}
          <a href="/">
            <img src="/logo.png" alt="WasteFlow" className="wf-logo" />
          </a>

          {/* Desktop Navigation */}
          <div className="wf-desktop-nav">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="wf-desktop-cta">
            <a href="/signup" className="wf-cta-btn">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="wf-mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="wf-mobile-menu">
          <div className="wf-mobile-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="wf-mobile-panel">
            <div className="wf-mobile-nav">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="wf-mobile-link"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {link.label}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="wf-mobile-buttons">
              <a
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="wf-mobile-btn-primary"
              >
                Get Started
              </a>
              <a
                href="#demo"
                onClick={() => setMobileOpen(false)}
                className="wf-mobile-btn-secondary"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}