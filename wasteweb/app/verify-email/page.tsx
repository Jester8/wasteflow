"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { sendEmailVerification, reload, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [autoChecking, setAutoChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/signup");
      } else {
        if (user.emailVerified) {
          router.replace("/kyc");
        }
        setEmail(user.email ?? "");
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startAutoCheck = () => {
      setAutoChecking(true);
      interval = setInterval(async () => {
        const user = auth.currentUser;
        if (user) {
          await reload(user);
          const refreshed = auth.currentUser;
          if (refreshed?.emailVerified) {
            clearInterval(interval);
            router.push("/kyc");
          }
        }
      }, 3000);
    };
    
    startAutoCheck();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user || resendCooldown > 0) return;

    setResending(true);
    setResendSuccess(false);
    setError("");

    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait before requesting another email.");
      } else {
        setError("Failed to resend. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(2, b.length)) + c)
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

        @keyframes wfSpin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wfFadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wfPulse   { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
        @keyframes wfBounce  { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } 70% { transform: translateY(-3px); } }
        @keyframes wfDotFade { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wf-ve-root { height: 100vh; display: flex; overflow: hidden; font-family: 'Quicksand', sans-serif; }

        .wf-ve-hero { display: none; position: relative; flex-direction: column; justify-content: flex-end; }
        @media (min-width: 1024px) { .wf-ve-hero { display: flex; width: 42%; } }
        .wf-ve-hero-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,15,8,0.88) 0%, rgba(5,15,8,0.55) 45%, rgba(5,15,8,0.32) 100%); z-index: 1; }
        .wf-ve-hero::after { content: ''; position: absolute; top: 0; right: 0; width: 3px; height: 100%; background: linear-gradient(to bottom, transparent, #B8D52E, transparent); opacity: 0.55; z-index: 10; }
        .wf-ve-hero-content { position: relative; z-index: 2; padding: 44px; }

        .wf-ve-panel { width: 100%; display: flex; flex-direction: column; background: #fff; overflow: hidden; }
        @media (min-width: 1024px) { .wf-ve-panel { width: 58%; } }

        .wf-ve-scroll { flex: 1; overflow-y: auto; display: flex; align-items: center; justify-content: center; padding: 32px; }
        .wf-ve-inner { max-width: 400px; width: 100%; animation: wfFadeUp 0.4s ease both; }

        .wf-ve-steps { display: flex; flex-direction: column; gap: 12px; margin: 28px 0; }
        .wf-ve-step { display: flex; align-items: flex-start; gap: 12px; padding: 13px 15px; border-radius: 11px; background: #f5faf6; border: 1px solid #e3f0e7; }
        .wf-ve-step-num { width: 22px; height: 22px; border-radius: 50%; background: #1a4d2e; color: #B8D52E; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .wf-ve-step-text { font-size: 0.8rem; font-weight: 600; color: #3d5c47; font-family: 'Quicksand', sans-serif; line-height: 1.5; }
        .wf-ve-step-text strong { color: #1a2e1f; }

        .wf-ve-email-badge { display: inline-flex; align-items: center; gap: 7px; background: #f0f7f2; border: 1px solid #c6e2d0; border-radius: 8px; padding: 7px 12px; margin: 4px 0 0; }
        .wf-ve-email-badge span { font-size: 0.78rem; font-weight: 700; color: #1a4d2e; font-family: 'Quicksand', sans-serif; }

        .wf-ve-btn-ghost { width: 100%; padding: 12px; border-radius: 10px; background: transparent; color: #3d6b4d; font-size: 0.85rem; font-weight: 700; font-family: 'Quicksand', sans-serif; border: 1.5px solid #c6e2d0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.18s; margin-top: 10px; }
        .wf-ve-btn-ghost:hover:not(:disabled) { border-color: #1a4d2e; background: #f5faf6; }
        .wf-ve-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .wf-ve-error { background: #fff5f5; border: 1px solid #f5c6c6; border-radius: 10px; padding: 11px 14px; display: flex; align-items: flex-start; gap: 9px; margin-bottom: 14px; }
        .wf-ve-error p { font-size: 0.78rem; color: #c0392b; font-weight: 600; font-family: 'Quicksand', sans-serif; line-height: 1.5; }

        .wf-ve-success { background: #f0faf3; border: 1px solid #a8dbb8; border-radius: 10px; padding: 11px 14px; display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
        .wf-ve-success p { font-size: 0.78rem; color: #1a6b38; font-weight: 600; font-family: 'Quicksand', sans-serif; }

        .wf-ve-footer { flex-shrink: 0; border-top: 1px solid #f0f7f2; padding: 13px 32px; display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: space-between; }
        @media (min-width: 500px) { .wf-ve-footer { flex-direction: row; } }
        .wf-ve-footer-copy { font-size: 0.72rem; color: #9ab8a5; font-weight: 600; font-family: 'Quicksand', sans-serif; }
        .wf-ve-footer-links { display: flex; gap: 16px; }
        .wf-ve-footer-links a { font-size: 0.72rem; color: #9ab8a5; text-decoration: none; font-weight: 600; transition: color 0.18s; font-family: 'Quicksand', sans-serif; }
        .wf-ve-footer-links a:hover { color: #1a4d2e; }

        .wf-spin { animation: wfSpin 0.8s linear infinite; }
        .wf-pulse { animation: wfPulse 1.5s ease-in-out infinite; display: inline-block; }
      `}</style>

      <div className="wf-ve-root">
        <div className="wf-ve-hero">
          <Image src="/truck2.png" alt="WasteFlow" fill style={{ objectFit: "cover", objectPosition: "center" }} sizes="42vw" priority />
          <div className="wf-ve-hero-scrim" />
          <div className="wf-ve-hero-content">
            <p style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)", color: "#e8f5ee", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
              One last step — confirm your email to get started.
            </p>
          </div>
        </div>

        <div className="wf-ve-panel">
          <div className="wf-ve-scroll">
            <div className="wf-ve-inner">
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a2e1f", letterSpacing: "-0.02em", lineHeight: 1.2, fontFamily: "'Quicksand',sans-serif", textAlign: "center", marginBottom: 10 }}>
                Check your inbox
              </h1>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand',sans-serif", textAlign: "center", lineHeight: 1.6, marginBottom: 6 }}>
                We sent a verification link to
              </p>

              {maskedEmail && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  <div className="wf-ve-email-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>{maskedEmail}</span>
                  </div>
                </div>
              )}

              <div className="wf-ve-steps">
                {[
                  { num: 1, text: <><strong>Open the email</strong> from WasteFlow in your inbox (check spam too)</> },
                  { num: 2, text: <><strong>Click the verification link</strong> inside the email</> },
                  { num: 3, text: <>We'll automatically detect verification and redirect you <span className="wf-pulse">⟳</span></> },
                ].map(({ num, text }) => (
                  <div key={num} className="wf-ve-step">
                    <div className="wf-ve-step-num">{num}</div>
                    <p className="wf-ve-step-text">{text}</p>
                  </div>
                ))}
              </div>

              {autoChecking && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#f0f7f2", borderRadius: 20 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" className="wf-spin" style={{ width: 14, height: 14 }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a4d2e", fontFamily: "'Quicksand',sans-serif" }}>
                      Waiting for verification...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="wf-ve-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {resendSuccess && !error && (
                <div className="wf-ve-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a6b38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p>Verification email resent — check your inbox.</p>
                </div>
              )}

              <button
                type="button"
                className="wf-ve-btn-ghost"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
              >
                {resending ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="wf-spin" style={{ width: 13, height: 13 }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending…
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                    </svg>
                    Resend verification email
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand',sans-serif", marginTop: 20, lineHeight: 1.6 }}>
                Wrong email?{" "}
                <a href="/signup" style={{ color: "#1a4d2e", textDecoration: "none", fontWeight: 700 }}>
                  Back to sign up
                </a>
              </p>
            </div>
          </div>

          <footer className="wf-ve-footer">
            <span className="wf-ve-footer-copy">© {new Date().getFullYear()} WasteFlow. All rights reserved.</span>
            <div className="wf-ve-footer-links">
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