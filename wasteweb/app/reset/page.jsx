"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

function Button({ children, type = "button", loading, fullWidth, onClick, loadingText }) {
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
          {loadingText || "Loading…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

const ROLE_CONFIG = {
  operator: { label: "Operator", placeholder: "you@company.co.uk" },
  contractor: { label: "Contractor", placeholder: "you@haulage.co.uk" },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "contractor" ? "contractor" : "operator";
  const oobCode = searchParams.get("oobCode");

  const [mode, setMode] = useState("request");
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const config = ROLE_CONFIG[role];

  useEffect(() => {
    if (oobCode) {
      setMode("reset");
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
        })
        .catch(() => {
          setError("The password reset link is invalid or has expired. Please request a new one.");
        });
    }
  }, [oobCode]);

  const validateRequest = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateReset = () => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const err = validateRequest();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      if (err?.code === "auth/user-not-found") {
        setSent(true);
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection and try again.");
      } else {
        console.error("Password reset error:", err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const err = validateReset();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setResetSuccess(true);
    } catch (err) {
      if (err?.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection and try again.");
      } else {
        console.error("Password reset error:", err);
        setError("The reset link has expired or is invalid. Please request a new one.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push(`/login?role=${role}&reset=success`);
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

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-reset-root {
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

        .wf-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #3d6b4d;
          text-decoration: none;
          margin-bottom: 22px;
          transition: color 0.18s;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-back-link:hover { color: #1a4d2e; }

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
        }
        .wf-toggle-btn.active {
          background: #ffffff;
          color: #1a2e1f;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

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

        .wf-success-card {
          background: #ffffff;
          border: 1px solid #e8f2eb;
          border-radius: 16px;
          padding: 36px 28px;
          text-align: center;
        }
        .wf-success-card h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a2e1f;
          margin-bottom: 8px;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-success-card p {
          font-size: 0.9rem;
          color: #6b8f7a;
          font-weight: 600;
          line-height: 1.6;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-success-card .wf-success-email {
          color: #1a4d2e;
          font-weight: 700;
        }
        .wf-success-card .wf-success-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(184,213,46,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .wf-success-card .wf-resend-row {
          margin-top: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b8f7a;
          font-family: 'Quicksand', sans-serif;
        }
        .wf-success-card .wf-resend-btn {
          background: none;
          border: none;
          color: #1a4d2e;
          font-weight: 700;
          font-size: 0.8rem;
          font-family: 'Quicksand', sans-serif;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .wf-success-card .wf-resend-btn:hover { color: #B8D52E; }
        .wf-success-card .wf-resend-btn:disabled { color: #9ab8a5; cursor: not-allowed; text-decoration: none; }
        .wf-success-card .wf-divider {
          height: 1px;
          background: #e8f2eb;
          margin: 20px 0;
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

      <div className="wf-reset-root">
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
            <div>
              <p style={{
                fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
                fontWeight: 700,
                color: "#e8f5ee",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                fontFamily: "'Quicksand',sans-serif",
                marginBottom: 12,
              }}>
                {mode === "reset" ? "Create new password" : "Reset your password"}
              </p>
              <p style={{
                fontSize: "0.875rem",
                color: "#5a8a6a",
                fontWeight: 600,
                lineHeight: 1.65,
                maxWidth: 340,
                fontFamily: "'Quicksand',sans-serif",
              }}>
                {mode === "reset" 
                  ? "Enter your new password below to regain access to your account."
                  : "We'll send you a link to create a new password and get back to managing your waste operations."
                }
              </p>
            </div>
          </div>
        </div>

        <div className="wf-form-panel">
          <div className="wf-form-header">
            <div style={{ width: 1 }} />
          </div>

          <div className="wf-form-scroll">
            <div className="wf-form-inner">
              {mode === "request" ? (
                <>
                  <Link href={`/login?role=${role}`} className="wf-back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to login
                  </Link>

                  {!sent ? (
                    <>
                      <h1 className="wf-heading">Reset your password</h1>
                      <p className="wf-sub">
                        Enter your email and we'll send you a link to reset your password.
                      </p>

                      <div className="wf-toggle">
                        {["operator", "contractor"].map(r => (
                          <button
                            key={r}
                            type="button"
                            className={`wf-toggle-btn${role === r ? " active" : ""}`}
                            onClick={() => { setRole(r); setError(""); }}
                          >
                            {ROLE_CONFIG[r].label}
                          </button>
                        ))}
                      </div>

                      {error && (
                        <div className="wf-error-banner">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <p>{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleRequestSubmit}>
                        <div style={{ marginBottom: 20 }}>
                          <Input
                            label="Email Address"
                            type="email"
                            placeholder={config.placeholder}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            }
                          />
                        </div>

                        <Button type="submit" fullWidth loading={loading}>
                          Send reset link
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="wf-success-card">
                      <div className="wf-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <h2>Check your email</h2>
                      <p>
                        We've sent a password reset link to<br />
                        <span className="wf-success-email">{email}</span>
                      </p>
                      <p style={{ marginTop: 12, fontSize: "0.8rem" }}>
                        If you don't see it, check your spam folder. The link will expire after a while, so use it soon.
                      </p>

                      <div className="wf-divider" />

                      <div className="wf-resend-row">
                        Didn't get it?{" "}
                        <button
                          type="button"
                          className="wf-resend-btn"
                          disabled={loading}
                          onClick={async () => {
                            setLoading(true);
                            try {
                              await sendPasswordResetEmail(auth, email);
                            } catch (err) {
                              console.error("Resend failed:", err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Resend email
                        </button>
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <Button type="button" fullWidth onClick={handleGoToLogin}>
                          Password changed? Go to login
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {resetSuccess ? (
                    <div className="wf-success-card">
                      <div className="wf-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                      <h2>Password reset successful!</h2>
                      <p>Your password has been updated. You can now log in with your new password.</p>
                      <div style={{ marginTop: 20 }}>
                        <Button type="button" fullWidth onClick={handleGoToLogin}>
                          Go to login
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="wf-heading">Create new password</h1>
                      <p className="wf-sub">
                        Enter your new password below. It must be at least 6 characters long.
                      </p>

                      {error && (
                        <div className="wf-error-banner">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <p>{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleResetSubmit}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                          <PasswordInput
                            label="New Password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                          />
                          <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={error}
                          />
                        </div>

                        <Button type="submit" fullWidth loading={loading} loadingText="Resetting…">
                          Reset password
                        </Button>
                      </form>
                    </>
                  )}
                </>
              )}
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