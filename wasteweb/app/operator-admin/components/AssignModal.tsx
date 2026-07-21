"use client";

import { useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Driver, RequestRow } from "../lib/useOperatorAdminData";

export default function AssignModal({
  request, drivers, onClose,
}: {
  request: RequestRow;
  drivers: Driver[];
  onClose: () => void;
}) {
  const [assigning, setAssigning] = useState<string | null>(null);

  async function handleAssign(driverId: string) {
    setAssigning(driverId);
    try {
      await updateDoc(doc(db, "wasteRequests", request.id), {
        assignedOperatorId: driverId,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !assigning) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440, background: "#ffffff", borderRadius: 16,
        padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Assign to Fleet Operator</p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
          {request.title} · {request.contractorName}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {drivers.map((d) => (
            <div key={d.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "12px 16px", borderRadius: 12, border: "1px solid #e8f2eb",
            }}>
              <div>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{d.fullName}</p>
                <p style={{ fontSize: "0.76rem", color: "#8aab97", margin: "2px 0 0" }}>{d.vehicleRegistration || "—"}</p>
              </div>
              <button
                onClick={() => handleAssign(d.id)}
                disabled={assigning === d.id}
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "none",
                  background: "#1a4d2e", color: "#B8D52E", fontSize: "0.76rem", fontWeight: 700,
                  cursor: assigning === d.id ? "not-allowed" : "pointer", fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {assigning === d.id ? "Assigning…" : "Assign"}
              </button>
            </div>
          ))}
          {drivers.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "#9ab8a5", textAlign: "center", padding: "20px 0" }}>
              Add a fleet operator first.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          disabled={!!assigning}
          style={{
            width: "100%", marginTop: 20, padding: "10px 14px", borderRadius: 10,
            border: "1px solid #e8f2eb", background: "#fff", color: "#4a7a5a",
            fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
            cursor: assigning ? "not-allowed" : "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
