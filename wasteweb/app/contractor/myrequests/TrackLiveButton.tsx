"use client";

import { useRouter } from "next/navigation";

const TRACKABLE_STATUSES = new Set(["arriving", "in_transit", "Arriving", "In Transit"]);

interface TrackLiveButtonProps {
  requestId: string;
  status: string;
  /** optional: style override for the container */
  style?: React.CSSProperties;
}

export function TrackLiveButton({ requestId, status, style }: TrackLiveButtonProps) {
  const router = useRouter();
  const canTrack = TRACKABLE_STATUSES.has(status);

  if (!canTrack) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "11px 16px", borderRadius: 10,
        background: "#f5faf6", border: "1px solid #e8f2eb",
        fontFamily: "'Quicksand', sans-serif",
        ...style,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9ab8a5"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 15, height: 15, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#9ab8a5" }}>
          Live tracking not yet available
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push(`/contractor/myrequests/Tracking/${requestId}`)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px 16px", borderRadius: 10, border: "none", cursor: "pointer",
        background: "#1a4d2e", color: "#B8D52E",
        fontSize: "0.82rem", fontWeight: 700,
        fontFamily: "'Quicksand', sans-serif",
        transition: "filter 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
    >
      {/* Pulsing dot */}
      <span style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "#B8D52E", opacity: 0.4,
          animation: "wfPulse 1.8s ease-out infinite",
        }}/>
        <span style={{
          position: "absolute", inset: 2, borderRadius: "50%",
          background: "#B8D52E",
        }}/>
      </span>
      Track Live
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 13, height: 13 }}>
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  );
}

// Firestore security rules must allow:
//  - the assigned operator (resource.data.operatorId) to update liveLocation
//  - the assigned contractor/operator to read the request doc
// See app/hooks/useLiveLocationBroadcaster.ts for the write path.