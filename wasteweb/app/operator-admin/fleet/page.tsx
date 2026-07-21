"use client";

import { useState } from "react";
import { useOperatorAdminData } from "../lib/useOperatorAdminData";
import AddDriverModal from "../components/AddDriverModal";

export default function FleetPage() {
  const { drivers, activeJobCounts, loading } = useOperatorAdminData();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>My Fleet</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Drivers onboarded under your company, and their current workload.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>
          {loading ? "Loading…" : `${drivers.length} fleet operator${drivers.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "#1a4d2e", color: "#B8D52E", fontSize: "0.8rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          + Add Fleet Operator
        </button>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {drivers.map((d) => (
          <div key={d.id} style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 18 }}>
            <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{d.fullName}</p>
            <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "4px 0 0" }}>{d.email}</p>
            {d.mobileNumber && <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>{d.mobileNumber}</p>}
            {d.vehicleRegistration && <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>{d.vehicleRegistration}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {d.skipCapacity?.map((c) => (
                <span key={c} style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "rgba(184,213,46,0.14)", color: "#3a6b00" }}>
                  {c} yd
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.7rem", color: "#9ab8a5", margin: "8px 0 0" }}>
              Active jobs: {activeJobCounts[d.id] || 0}
            </p>
          </div>
        ))}
        {!loading && drivers.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center", padding: "40px 24px",
            background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 14,
            color: "#9ab8a5", fontSize: "0.85rem",
          }}>
            No fleet operators yet.
          </div>
        )}
      </div>

      {showAdd && <AddDriverModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
