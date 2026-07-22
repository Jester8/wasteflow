"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth";
import { useAuth } from "../../context/AuthContext";

export default function SiteContractorLoginPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postSignInPending, setPostSignInPending] = useState(false);

  useEffect(() => {
    if (!postSignInPending) return;
    if (authLoading) return;
    if (!user) return;
    if (!profile) return;

    if (profile.role !== "contractor") {
      setError("This account isn't registered as a site contractor.");
      setPostSignInPending(false);
      return;
    }

    if (!profile.kycStatus) {
      router.push("/kyc");
    } else {
      router.push("/contractor");
    }
    setPostSignInPending(false);
  }, [postSignInPending, authLoading, user, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const result = await signInWithEmail(email, password);
    if (!result.success) {
      setError(result.error || "Sign in failed. Please try again.");
      setLoading(false);
      return;
    }
    setPostSignInPending(true);
    setLoading(false);
  }

  return (
    <div style={{
      position: "relative", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Quicksand', sans-serif", padding: 16, overflow: "hidden",
    }}>
      <Image
        src="/truck2.png"
        alt=""
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "center" }}
        sizes="100vw"
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(5,15,8,0.88) 0%, rgba(5,15,8,0.68) 45%, rgba(5,15,8,0.5) 100%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 380, background: "#ffffff", borderRadius: 16,
        padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
      }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#B8D52E", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          WasteFlow
        </p>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a2e1f", margin: "4px 0 24px" }}>
          Site Contractor Sign In
        </h1>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: "1px solid #c6e2d0", background: "#f5faf6",
                fontSize: "0.875rem", fontWeight: 600, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
                  border: "1px solid #c6e2d0", background: "#f5faf6",
                  fontSize: "0.875rem", fontWeight: 600, color: "#1a2e1f",
                  fontFamily: "'Quicksand', sans-serif", outline: "none", boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: "#6b8f7a", display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotMessage((v) => !v)}
              style={{
                marginTop: 8, background: "none", border: "none", padding: 0,
                fontSize: "0.76rem", fontWeight: 700, color: "#4a7a5a", cursor: "pointer",
                fontFamily: "'Quicksand', sans-serif", textDecoration: "underline",
              }}
            >
              Forgot password?
            </button>
            {showForgotMessage && (
              <p style={{ fontSize: "0.76rem", color: "#6b8f7a", fontWeight: 600, margin: "6px 0 0" }}>
                Please contact your administrator to reset your password.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: "12px 16px", borderRadius: 10, border: "none",
              background: "#1a4d2e", color: "#B8D52E", fontSize: "0.9rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 600, color: "#6b8f7a", marginTop: 16 }}>
          Not a site contractor? <Link href="/login" style={{ color: "#1a4d2e", fontWeight: 700, textDecoration: "none" }}>Go to main sign in</Link>
        </p>
      </div>
    </div>
  );
}
