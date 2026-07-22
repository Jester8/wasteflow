"use client";

import { useState } from "react";
import { useContractorAdminData } from "../lib/useContractorAdminData";
import { SiteContractor } from "../lib/useContractorAdminData";
import AddContractorModal from "../components/AddContractorModal";
import ContractorDetailModal from "../components/ContractorDetailModal";
import ResetPasswordModal from "../components/ResetPasswordModal";

export default function ContractorsPage() {
  const { contractors, myRequests, activeRequestCounts, loading, contractorPasswords, refreshContractorPassword } = useContractorAdminData();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<SiteContractor | null>(null);
  const [resetting, setResetting] = useState<SiteContractor | null>(null);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>My Contractors</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Site contractors onboarded under your company, and their current activity.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>
          {loading ? "Loading..." : `${contractors.length} contractor${contractors.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "#1a4d2e", color: "#B8D52E", fontSize: "0.8rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          + Add Contractor
        </button>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {contractors.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c)}
            style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 18, cursor: "pointer" }}
          >
            <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{c.fullName}</p>
            <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "4px 0 0" }}>{c.email}</p>
            <p style={{ fontSize: "0.7rem", color: "#9ab8a5", margin: "8px 0 0" }}>
              Active requests: {activeRequestCounts[c.id] || 0}
            </p>
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fbf9", border: "1px solid #edf4f0", borderRadius: 9 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Password</p>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2e1f", margin: "3px 0 0", fontFamily: "monospace" }}>
                {contractorPasswords[c.id] || "Loading…"}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setResetting(c); }}
              style={{
                marginTop: 8, width: "100%", padding: "7px 10px", borderRadius: 8,
                border: "1px solid #e8f2eb", background: "#fff", color: "#4a7a5a",
                fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Quicksand', sans-serif",
              }}
            >
              Reset Password
            </button>
          </div>
        ))}
        {!loading && contractors.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center", padding: "40px 24px",
            background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 14,
            color: "#9ab8a5", fontSize: "0.85rem",
          }}>
            No contractors yet.
          </div>
        )}
      </div>

      {showAdd && <AddContractorModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <ContractorDetailModal
          contractor={selected}
          feed={myRequests.filter((r) => r.contractorId === selected.id)}
          activeCount={activeRequestCounts[selected.id] || 0}
          password={contractorPasswords[selected.id]}
          onResetPassword={() => setResetting(selected)}
          onClose={() => setSelected(null)}
        />
      )}
      {resetting && (
        <ResetPasswordModal
          contractorId={resetting.id}
          contractorName={resetting.fullName}
          onClose={() => setResetting(null)}
          onReset={() => refreshContractorPassword(resetting.id)}
        />
      )}
    </div>
  );
}
