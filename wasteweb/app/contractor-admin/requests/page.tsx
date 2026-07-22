"use client";

import { useState } from "react";
import { useContractorAdminData } from "../lib/useContractorAdminData";
import { STATUS_STYLE, formatDate } from "../lib/constants";
import LiveMapModal from "../components/LiveMapModal";

const TRACKABLE_STATUSES = new Set(["arriving", "in_transit"]);

export default function ContractorAdminRequestsPage() {
  const { myRequests, loading } = useContractorAdminData();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const tracking = trackingId ? myRequests.find((r) => r.id === trackingId) : null;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Requests</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Every request from every contractor you have onboarded, live.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading...</p>
        ) : myRequests.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 14,
            color: "#9ab8a5", fontSize: "0.85rem",
          }}>
            No requests yet.
          </div>
        ) : myRequests.map((r) => {
          const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
          return (
            <div key={r.id} style={{
              background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
              padding: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>
                  {r.contractorName} · {r.wasteType} · {r.location} · {formatDate(r.createdAt)}
                </p>
                <p style={{ fontSize: "0.74rem", color: "#8aab97", margin: "2px 0 0" }}>
                  {r.targetOperatorAdminName ? `Operator: ${r.targetOperatorAdminName}` : "No operator chosen"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                  background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {style.label}
                </span>
                {TRACKABLE_STATUSES.has(r.status) && (
                  <button
                    onClick={() => setTrackingId(r.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: "#1a4d2e", color: "#B8D52E", fontSize: "0.72rem", fontWeight: 700,
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  >
                    Track Live
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tracking && (
        <LiveMapModal request={tracking} onClose={() => setTrackingId(null)} />
      )}
    </div>
  );
}
