"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function ResetPasswordModal({
  contractorId, contractorName, onClose, onReset,
}: {
  contractorId: string;
  contractorName: string;
  onClose: () => void;
  onReset: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/contractor-admin/reset-contractor-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, contractorId, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to reset password.");
        return;
      }
      onReset();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 600, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%", maxWidth: 380, background: "#ffffff", borderRadius: 16,
          padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Reset Password</p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: 0 }}>{contractorName}</p>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, margin: 0 }}>{error}</p>
          </div>
        )}

        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", display: "block", marginBottom: 6 }}>
            New password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={{
                width: "100%", padding: "10px 40px 10px 12px", borderRadius: 9,
                border: "1px solid #c6e2d0", background: "#f5faf6",
                fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "#6b8f7a", display: "flex", alignItems: "center",
              }}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                  <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #e8f2eb",
              background: "#fff", color: "#4a7a5a", fontSize: "0.82rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif", cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
              background: "#1a4d2e", color: "#B8D52E", fontSize: "0.82rem", fontWeight: 700,
              fontFamily: "'Quicksand', sans-serif",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Resetting…" : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
