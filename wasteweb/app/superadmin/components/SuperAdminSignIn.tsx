"use client";

import { useState } from "react";
import Image from "next/image";
import { signInWithEmail, signOut as firebaseSignOut } from "@/lib/auth";

interface SuperAdminSignInProps {
  /** Set when a signed-in user's role turned out not to be superadmin. */
  wrongRoleError?: boolean;
}

export default function SuperAdminSignIn({ wrongRoleError }: SuperAdminSignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signInWithEmail(email, password);

    if (!result.success) {
      setError(result.error || "Sign in failed.");
      setLoading(false);
      return;
    }

    // Leave `loading` true — the layout's auth guard will swap this form
    // out for the dashboard once the profile confirms role === 'superadmin',
    // or re-render this form with wrongRoleError if it doesn't.
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
          Super Admin Sign In
        </h1>

        {(error || wrongRoleError) && (
          <div style={{
            background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10,
            padding: "10px 14px", marginBottom: 16,
          }}>
            <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, margin: 0 }}>
              {wrongRoleError
                ? "This account doesn't have super admin access."
                : error}
            </p>
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
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#3d6b4d",
                  padding: 0, display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: "12px 16px", borderRadius: 10, border: "none",
              background: "#1a4d2e", color: "#e8f5ee", fontSize: "0.9rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
