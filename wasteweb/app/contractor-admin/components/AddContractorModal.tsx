"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function AddContractorModal({ onClose }: { onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setError("Fill in all required fields, password needs at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/contractor-admin/create-contractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, fullName: fullName.trim(), email: email.trim(), password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to create contractor.");
        return;
      }
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
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%", maxWidth: 420, background: "#ffffff", borderRadius: 16,
          padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Add Contractor</p>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ fontSize: "0.78rem", color: "#c0392b", fontWeight: 600, margin: 0 }}>{error}</p>
          </div>
        )}

        {[
          { label: "Contractor name", value: fullName, onChange: setFullName, placeholder: "e.g. Priya Shah" },
          { label: "Email", value: email, onChange: setEmail, placeholder: "site@company.co.uk", type: "email" },
          { label: "Initial password", value: password, onChange: setPassword, placeholder: "Min 8 characters" },
        ].map((f) => (
          <div key={f.label}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2a5c38", display: "block", marginBottom: 6 }}>
              {f.label}
            </label>
            <input
              type={f.type || "text"}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 9,
                border: "1px solid #c6e2d0", background: "#f5faf6",
                fontSize: "0.84rem", fontWeight: 600, color: "#1a2e1f",
                fontFamily: "'Quicksand', sans-serif", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        ))}

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
            {submitting ? "Creating..." : "Create Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
