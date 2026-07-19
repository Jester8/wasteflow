"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/auth";

export default function ContractorAdminSignIn({ wrongRoleError }: { wrongRoleError?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f4f9f5", fontFamily: "'Quicksand', sans-serif", padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, background: "#ffffff", borderRadius: 16,
        padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
      }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3a6b00", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          WasteFlow
        </p>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a2e1f", margin: "4px 0 24px" }}>
          Contractor Admin Sign In
        </h1>

        {(error || wrongRoleError) && (
          <div style={{ background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, margin: 0 }}>
              {wrongRoleError ? "This account doesn't have contractor admin access." : error}
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: "1px solid #c6e2d0", background: "#f5faf6",
                fontSize: "0.875rem", fontWeight: 600, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", outline: "none", boxSizing: "border-box",
              }}
            />
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
