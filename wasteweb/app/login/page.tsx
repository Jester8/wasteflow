"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

function useTypewriter(text: string, speed = 45) {
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

function Input({ label, type = "text", placeholder, error, leftIcon, required: req, ...props }: {
  label?: string; type?: string; placeholder?: string; error?: string;
  leftIcon?: React.ReactNode; required?: boolean; [k: string]: any;
}) {
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

function PasswordInput({ label, placeholder, error, ...props }: {
  label?: string; placeholder?: string; error?: string; [k: string]: any;
}) {
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

function Button({ children, type = "button", loading, fullWidth, onClick }: {
  children: React.ReactNode; type?: "button" | "submit";
  loading?: boolean; fullWidth?: boolean; onClick?: () => void;
}) {
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
        children
      )}
    </button>
  );
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1.5px solid #c6e2d0",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: "0.875rem",
        fontWeight: 700,
        fontFamily: "'Quicksand',sans-serif",
        color: "#1a2e1f",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        opacity: loading ? 0.65 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.borderColor = "#1a4d2e";
          e.currentTarget.style.background = "#f5faf6";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#c6e2d0";
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.transform = "none";
      }}
    >
      {loading ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      Continue with Google
    </button>
  );
}

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

type Role = "operator" | "contractor";

const ROLE_CONFIG: Record<Role, {
  label: string;
  emoji: string;
  placeholder: string;
}> = {
  operator: {
    label: "Operator",
    emoji: "",
    placeholder: "you@company.co.uk",
  },
  contractor: {
    label: "Contractor",
    emoji: "",
    placeholder: "you@haulage.co.uk",
  },
};

/**
 * Routes a signed-in user to the correct place based on their KYC status.
 * - no profile / no kycStatus  -> /kyc
 * - kycStatus "submitted" or "approved" -> role-specific dashboard
 */
function routeAfterAuth(router: ReturnType<typeof useRouter>, profile: any) {
  if (profile?.kycStatus === "submitted" || profile?.kycStatus === "approved") {
    router.push(profile.role === "operator" ? "/operators/" : "/contractor/");
  } else {
    router.push("/kyc");
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role>("operator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [postSignInPending, setPostSignInPending] = useState(false);

  const config = ROLE_CONFIG[role];

  // Single source of truth: AuthContext's `profile`. We only redirect once
  // AuthContext has finished loading AND we know a sign-in just happened
  // (postSignInPending) or a user was already present on mount (e.g. refresh).
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    routeAfterAuth(router, profile);
  }, [authLoading, user, profile, router, postSignInPending]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email address";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setGlobalError("");
    setLoading(true);

    const result = await signInWithEmail(email, password);

    if (!result.success) {
      setGlobalError(result.error || "Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    // Don't fetch the profile ourselves and don't push a route here.
    // AuthContext's onAuthStateChanged listener will pick up the new user,
    // fetch the profile, and the effect above will redirect once it's ready.
    setPostSignInPending(true);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGlobalError("");
    setGoogleLoading(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      setGlobalError(result.error || "Google sign in failed. Please try again.");
      setGoogleLoading(false);
      return;
    }

    setPostSignInPending(true);
    setGoogleLoading(false);
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
          justify-content: flex-end;
          border-bottom: 1px solid #f0f7f2;
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
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
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
          margin-top: 6px;
        }
        .wf-forgot a {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1a4d2e;
          text-decoration: none;
          transition: color 0.18s;
          font-family: 'Quicksand', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .wf-forgot a:hover { color: #B8D52E; }

        .wf-google-btn {
          width: 100%;
          margin-bottom: 16px;
        }

        .wf-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
        }
        .wf-divider-line {
          flex: 1;
          height: 1px;
          background: #e8f2eb;
        }
        .wf-divider-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: #9ab8a5;
          font-family: 'Quicksand', sans-serif;
          white-space: nowrap;
        }

        .wf-operator-note {
          text-align: center;
          font-size: 0.72rem;
          color: #9ab8a5;
          margin-top: 18px;
          line-height: 1.6;
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
        }

        .wf-signup-nudge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b8f7a;
          font-family: 'Quicksand', sans-serif;
          margin-top: 16px;
        }
        .wf-signup-nudge a {
          color: #1a4d2e;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.18s;
        }
        .wf-signup-nudge a:hover { color: #B8D52E; }

        .wf-error-banner {
          background: #fff5f5;
          border: 1px solid #f5c6c6;
          border-radius: 10px;
          padding: 11px 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 16px;
        }
        .wf-error-banner p {
          font-size: 0.78rem;
          color: #c0392b;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          line-height: 1.5;
          margin: 0;
        }

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

        <div className="wf-form-panel">
          <div className="wf-form-header">
            <div style={{ width: 1 }} />
          </div>

          <div className="wf-form-scroll">
            <div className="wf-form-inner">
              <h1 className="wf-heading">Welcome back</h1>
              <p className="wf-sub">Sign in to your WasteFlow account to continue.</p>

              <div className="wf-toggle">
                {(["operator", "contractor"] as Role[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`wf-toggle-btn${role === r ? " active" : ""}`}
                    onClick={() => { setRole(r); setErrors({}); setGlobalError(""); }}
                  >
                    {ROLE_CONFIG[r].emoji} {ROLE_CONFIG[r].label}
                  </button>
                ))}
              </div>

              {globalError && (
                <div className="wf-error-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{globalError}</p>
                </div>
              )}

              <div className="wf-google-btn">
                <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />
              </div>

              <div className="wf-divider">
                <div className="wf-divider-line" />
                <span className="wf-divider-text">or continue with email</span>
                <div className="wf-divider-line" />
              </div>

              <form onSubmit={handleEmailSignIn}>
                <div className="wf-form-fields">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder={config.placeholder}
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      error={errors.password}
                    />
                    <div className="wf-forgot">
                      <Link href={`/reset?role=${role}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </div>

                <Button type="submit" fullWidth loading={loading}>
                  Sign in as {config.label}
                </Button>
              </form>

              <p className="wf-signup-nudge">
                Don't have an account?{" "}
                <Link href={`/signup?role=${role}`}>Sign up</Link>
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