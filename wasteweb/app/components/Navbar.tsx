"use client";

import { useEffect, useState } from "react";

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
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes menuSlideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes linkFadeIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes hamburgerSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(90deg);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.5s ease forwards;
        }

        .animate-menu-down {
          animation: menuSlideDown 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.25s ease forwards;
        }

        .hamburger-line {
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down
          ${scrolled ? "bg-[#002F27]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent"}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <img
              src="/logo.png"
              alt="WasteFlow"
              className="h-14 md:h-[75px] w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-white/75 text-sm font-semibold hover:text-white transition-colors duration-200"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B8D52E] rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href="#demo"
              className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-bold bg-[#B8D52E] text-[#002F27] hover:bg-[#DDE11A] transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`hamburger-line block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`hamburger-line block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`hamburger-line block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-[#002F27] pt-20 pb-8 px-6 animate-menu-down">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="group relative py-4 text-white/80 text-lg font-semibold hover:text-white transition-colors duration-200 border-b border-white/10"
                  style={{
                    animation: `linkFadeIn 0.3s ease forwards ${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  <span className="flex items-center justify-between">
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
                      className="text-[#B8D52E] opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#B8D52E] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Mobile CTA Buttons */}
            <div className="mt-8 space-y-3">
              <a
                href="#demo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-bold bg-[#B8D52E] text-[#002F27] hover:bg-[#DDE11A] transition-all duration-200 active:scale-95"
              >
                Get Started
                <svg
                  width="14"
                  height="14"
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
              <a
                href="#demo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-4 rounded-xl text-sm font-semibold bg-transparent text-white/70 border border-white/20 hover:text-white hover:border-[#B8D52E]/40 transition-all duration-200 active:scale-95"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}