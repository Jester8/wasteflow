"use client";

import { useState } from "react";
import { useOperatorAdminData, RequestRow } from "../lib/useOperatorAdminData";
import { STATUS_STYLE, formatDate } from "../lib/constants";
import AssignModal from "../components/AssignModal";

export default function DispatchPage() {
  const { drivers, unassigned, myFleetFeed, myRegions, loading } = useOperatorAdminData();
  const [assigning, setAssigning] = useState<RequestRow | null>(null);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Dispatch</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Covering: {myRegions.length > 0 ? myRegions.join(", ") : "No regions set"}
      </p>

      {loading ? (
        <p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
              Unassigned — matching your regions ({unassigned.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {unassigned.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 24px", background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 14, color: "#9ab8a5", fontSize: "0.85rem" }}>
                  Nothing waiting on assignment.
                </div>
              ) : unassigned.map((r) => (
                <div key={r.id} style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>
                      {r.contractorName} · {r.wasteType} · {r.location} · {r.region || "Unknown region"} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setAssigning(r)}
                    style={{ padding: "7px 14px", borderRadius: 9, border: "none", background: "#1a4d2e", color: "#B8D52E", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Quicksand', sans-serif" }}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
              Your fleet's activity
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myFleetFeed.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 24px", background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 14, color: "#9ab8a5", fontSize: "0.85rem" }}>
                  No jobs assigned to your fleet yet.
                </div>
              ) : myFleetFeed.map((r) => {
                const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                const driver = drivers.find((d) => d.id === r.assignedOperatorId);
                return (
                  <div key={r.id} style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                      <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>
                        {r.contractorName} · Driver: {driver?.fullName || "—"} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {assigning && (
        <AssignModal request={assigning} drivers={drivers} onClose={() => setAssigning(null)} />
      )}
    </div>
  );
}
