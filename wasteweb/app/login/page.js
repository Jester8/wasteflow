"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 45) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ label, type = "text", placeholder, error, leftIcon, required: req, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: "0.78rem", fontWeight: 600,
          color: "#2a5c38", fontFamily: "'Quicksand',sans-serif",
          letterSpacing: "0.01em",
        }}>
          {label}{req && <span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)",
            color: "#3d6b4d", pointerEvents: "none",
            display: "flex", alignItems: "center",
          }}>
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: leftIcon ? "11px 14px 11px 38px" : "11px 14px",
            borderRadius: 10,
            border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0",
            background: "#f5faf6",
            color: "#1a2e1f",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "'Quicksand',sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.18s, box-shadow 0.18s",
          }}
          onFocus={e => {
            e.currentTarget.style.border = "1px solid #B8D52E";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)";
          }}
          onBlur={e => {
            e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0";
            e.currentTarget.style.boxShadow = "none";
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({ label, placeholder, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: "0.78rem", fontWeight: 600,
          color: "#2a5c38", fontFamily: "'Quicksand',sans-serif",
        }}>
          {label}<span style={{ color: "#B8D52E", marginLeft: 2 }}>*</span>
        </label>
      )}
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 13, top: "50%",
          transform: "translateY(-50%)",
          color: "#3d6b4d", pointerEvents: "none",
          display: "flex", alignItems: "center",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "11px 40px 11px 38px",
            borderRadius: 10,
            border: error ? "1px solid #e05c5c" : "1px solid #c6e2d0",
            background: "#f5faf6",
            color: "#1a2e1f",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "'Quicksand',sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.18s, box-shadow 0.18s",
          }}
          onFocus={e => {
            e.currentTarget.style.border = "1px solid #B8D52E";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,213,46,0.15)";
          }}
          onBlur={e => {
            e.currentTarget.style.border = error ? "1px solid #e05c5c" : "1px solid #c6e2d0";
            e.currentTarget.style.boxShadow = "none";
          }}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#3d6b4d", padding: 0, display: "flex", alignItems: "center",
          }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: "0.72rem", color: "#e05c5c", fontFamily: "'Quicksand',sans-serif", fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Button({ children, type = "button", loading, fullWidth, onClick }) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "13px 24px",
        borderRadius: 10,
        background: loading ? "#2a5c38" : "#1a4d2e",
        color: "#e8f5ee",
        fontSize: "0.9rem",
        fontWeight: 700,
        fontFamily: "'Quicksand',sans-serif",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        transition: "background 0.18s, transform 0.15s, box-shadow 0.18s",
        letterSpacing: "0.01em",
        opacity: loading ? 0.75 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background = "#0f2d1a";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,77,46,0.25)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = loading ? "#2a5c38" : "#1a4d2e";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)";
      }}
    >
      {loading ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15, animation: "wfSpin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Signing in…
        </>
      ) : (
        <>
          {children}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </>
      )}
    </button>
  );
}

// ─── Hero text with typewriter ────────────────────────────────────────────────
function HeroText() {
  const line1 = "Smarter waste logistics";
  const line2 = "for construction sites.";
  const { displayed: d1, done: done1 } = useTypewriter(line1, 48);
  const { displayed: d2 } = useTypewriter(done1 ? line2 : "", 48);

  return (
    <div>
      <p style={{
        fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
        fontWeight: 700,
        color: "#e8f5ee",
        lineHeight: 1.3,
        letterSpacing: "-0.02em",
        fontFamily: "'Quicksand',sans-serif",
        marginBottom: 12,
        minHeight: "4.5em",
      }}>
        {d1}
        {!done1 && <span style={{ borderRight: "2px solid #B8D52E", marginLeft: 1, animation: "wfBlink 0.75s step-end infinite" }} />}
        {done1 && (
          <>
            <br />
            <span style={{ color: "#B8D52E" }}>
              {d2}
              {d2.length < line2.length && (
                <span style={{ borderRight: "2px solid #B8D52E", marginLeft: 1, animation: "wfBlink 0.75s step-end infinite" }} />
              )}
            </span>
          </>
        )}
      </p>
      <p style={{
        fontSize: "0.875rem",
        color: "#5a8a6a",
        fontWeight: 600,
        lineHeight: 1.65,
        maxWidth: 340,
        fontFamily: "'Quicksand',sans-serif",
        opacity: done1 ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        Manage skip orders, track pickups in real time, and keep your site compliant — all from one platform.
      </p>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
const ROLES = ["admin", "superadmin"];

export default function LoginPage() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email address";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // TODO: wire up Firebase auth
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    if (role === "superadmin") {
      window.location.href = "/superadmin";
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

        @keyframes wfSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes wfFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wfBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-login-root {
          height: 100vh;
          display: flex;
          overflow: hidden;
          font-family: 'Quicksand', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .wf-hero {
          display: none;
          position: relative;
          flex-direction: column;
          justify-content: flex-end;
        }
        @media (min-width: 1024px) {
          .wf-hero { display: flex; width: 50%; }
        }

        .wf-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(5,15,8,0.82) 0%,
            rgba(5,15,8,0.55) 40%,
            rgba(5,15,8,0.38) 100%
          );
          z-index: 1;
        }

        /* lime accent stripe on right edge */
        .wf-hero::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 3px; height: 100%;
          background: linear-gradient(to bottom, transparent, #B8D52E, transparent);
          opacity: 0.55;
          z-index: 10;
        }

        .wf-hero-content {
          position: relative;
          z-index: 2;
          padding: 48px;
        }

        /* ── RIGHT PANEL ── */
        .wf-form-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .wf-form-panel { width: 50%; }
        }

        .wf-form-header {
          flex-shrink: 0;
          padding: 22px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0f7f2;
        }

        .wf-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: "#4a7a5a";
          text-decoration: none;
          transition: color 0.18s;
          font-family: 'Quicksand', sans-serif;
          color: #4a7a5a;
        }
        .wf-back-link:hover { color: #1a4d2e; }

        .wf-mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wf-mobile-logo-mark {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: #1a4d2e;
          display: flex; align-items: center; justify-content: center;
        }
        .wf-mobile-logo-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
        }
        @media (min-width: 1024px) {
          .wf-mobile-logo { display: none; }
        }

        .wf-form-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          align-items: center;
          padding: 32px;
        }

        .wf-form-inner {
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
          animation: wfFadeUp 0.45s ease both;
        }

        .wf-heading {
          font-size: 1.7rem;
          font-weight: 700;
          color: #1a2e1f;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 6px;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-sub {
          font-size: 0.875rem;
          color: #6b8f7a;
          font-weight: 600;
          margin-bottom: 26px;
          line-height: 1.55;
          font-family: 'Quicksand', sans-serif;
        }

        /* role toggle */
        .wf-toggle {
          display: flex;
          background: #f0f7f2;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 22px;
          gap: 2px;
        }
        .wf-toggle-btn {
          flex: 1;
          padding: 9px 8px;
          border-radius: 7px;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
          background: transparent;
          color: #6b8f7a;
          white-space: nowrap;
        }
        .wf-toggle-btn.active {
          background: #ffffff;
          color: #1a2e1f;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .wf-form-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }

        .wf-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: 5px;
        }
        .wf-forgot a {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1a4d2e;
          text-decoration: none;
          transition: color 0.18s;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-forgot a:hover { color: #B8D52E; }

        .wf-operator-note {
          text-align: center;
          font-size: 0.72rem;
          color: #9ab8a5;
          margin-top: 18px;
          line-height: 1.6;
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
        }

        .wf-divider {
          height: 1px;
          background: #f0f7f2;
          margin: 20px 0;
        }

        /* footer */
        .wf-footer {
          flex-shrink: 0;
          border-top: 1px solid #f0f7f2;
          padding: 14px 32px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: space-between;
        }
        @media (min-width: 500px) {
          .wf-footer { flex-direction: row; }
        }
        .wf-footer-copy {
          font-size: 0.72rem;
          color: #9ab8a5;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-footer-links {
          display: flex;
          gap: 16px;
        }
        .wf-footer-links a {
          font-size: 0.72rem;
          color: #9ab8a5;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.18s;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-footer-links a:hover { color: #1a4d2e; }
      `}</style>

      <div className="wf-login-root">

        {/* ── LEFT: Hero ── */}
        <div className="wf-hero">
          <Image
            src="/truck2.png"
            alt="WasteFlow construction truck"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            sizes="50vw"
          />
          <div className="wf-hero-scrim" />
          <div className="wf-hero-content">
            <HeroText />
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="wf-form-panel">
          <div className="wf-form-header">
            <Link href="/" className="wf-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
            <div className="wf-mobile-logo">
              <div className="wf-mobile-logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span className="wf-mobile-logo-text">WasteFlow</span>
            </div>
          </div>

          <div className="wf-form-scroll">
            <div className="wf-form-inner">

              <h1 className="wf-heading">Welcome back</h1>
              <p className="wf-sub">Sign in to your WasteFlow account to continue.</p>

              {/* Role toggle */}
              <div className="wf-toggle">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`wf-toggle-btn${role === r ? " active" : ""}`}
                    onClick={() => { setRole(r); setErrors({}); }}
                  >
                    {r === "superadmin" ? "Super Admin" : "Admin"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="wf-form-fields">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@wasteflow.org"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={errors.email}
                    leftIcon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    }
                  />
                  <div>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      error={errors.password}
                    />
                    <div className="wf-forgot">
                      <Link href="/forgot-password">Forgot password?</Link>
                    </div>
                  </div>
                </div>

                <Button type="submit" fullWidth loading={loading}>
                  Sign in as {role === "superadmin" ? "Super Admin" : "Admin"}
                </Button>
              </form>

              <div className="wf-divider" />

              <p className="wf-operator-note">
                {role === "superadmin"
                  ? "Super Admin access is by invitation only. Contact your system administrator if you need access."
                  : "Admin accounts are created by your Super Admin. Contact your Super Admin if you need access."}
              </p>

            </div>
          </div>

          <footer className="wf-footer">
            <span className="wf-footer-copy">© {new Date().getFullYear()} WasteFlow. All rights reserved.</span>
            <div className="wf-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </footer>
        </div>

      </div>
    </>
  );
}