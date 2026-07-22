"use client";

import LiveTrackingMap from "../../components/LiveTrackingMap";
import type { RequestRow } from "../lib/useOperatorAdminData";

export default function LiveMapModal({
  request, onClose,
}: {
  request: RequestRow;
  onClose: () => void;
}) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 700, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 560, background: "#ffffff", borderRadius: 16,
        padding: 20, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>{request.title}</p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 16px" }}>
          {request.contractorName} · {request.location}
        </p>

        <LiveTrackingMap
          requestId={request.id}
          location={request.location}
          destinationLat={request.destinationLat}
          destinationLng={request.destinationLng}
          liveLocation={request.liveLocation}
          operatorName={request.operatorName}
          rawStatus={request.status}
          height={320}
        />

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 16, padding: "10px 14px", borderRadius: 10,
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
