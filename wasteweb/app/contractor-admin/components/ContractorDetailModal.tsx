"use client";

import type { SiteContractor, RequestRow } from "../lib/useContractorAdminData";
import { STATUS_STYLE, formatDate } from "../lib/constants";

export default function ContractorDetailModal({
  contractor, feed, activeCount, onClose,
}: {
  contractor: SiteContractor;
  feed: RequestRow[];
  activeCount: number;
  onClose: () => void;
}) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 520, background: "#ffffff", borderRadius: 16,
        padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>{contractor.fullName}</p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 20px" }}>{contractor.email}</p>

        <div style={{ background: "#f8fbf9", border: "1px solid #edf4f0", borderRadius: 12, padding: "12px 14px", marginBottom: 20, display: "inline-block" }}>
          <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Active Requests</p>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: "4px 0 0" }}>{activeCount}</p>
        </div>

        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
          Live Feed
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#9ab8a5", textAlign: "center", padding: "20px 0" }}>
              No requests from this contractor yet.
            </p>
          ) : feed.map((r) => {
            const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10, border: "1px solid #e8f2eb",
              }}>
                <div>
                  <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "#8aab97", margin: "2px 0 0" }}>
                    {r.targetOperatorAdminName || "No operator yet"} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <span style={{
                  fontSize: "0.64rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                  background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em",
                  flexShrink: 0,
                }}>
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 20, padding: "10px 14px", borderRadius: 10,
            border: "1px solid #e8f2eb", background: "#fff", color: "#4a7a5a",
            fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
