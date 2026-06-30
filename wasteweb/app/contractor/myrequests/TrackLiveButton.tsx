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
      onClick={() => router.push(`/contractor/tracking/${requestId}`)}
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


// ─────────────────────────────────────────────────────────────────────────────
// PATCH 1: app/operator/requests/page.tsx
//
// Add these two things to RequestsPage:
//
// 1. Import the hook at the top:
//    import { useLiveLocationBroadcaster } from "@/hooks/useLiveLocationBroadcaster";
//
// 2. Add this ONE line inside the RequestsPage component body,
//    right after the line:  const { user } = useAuth();
//
//    useLiveLocationBroadcaster(enrichedRequests, user?.uid);
//
//    NOTE: enrichedRequests is computed lower in the file, so move the hook
//    call to AFTER the enrichedRequests declaration, or pass `requests`
//    directly (the hook only needs status + operatorId fields which exist on
//    both).  Easiest placement:
//
//    -- FIND this block (near the bottom of RequestsPage, before `filtered`):
//
//      const enrichedRequests = requests.map((r) => ({
//        ...r,
//        contractorName: r.contractorName || contractorNames[r.contractorId || ""] || "",
//      }));
//
//    -- ADD immediately after it:
//
//      useLiveLocationBroadcaster(enrichedRequests, user?.uid);
//
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// PATCH 2: RequestItem type in page.tsx
//
// The broadcaster needs to know which requests belong to THIS operator.
// The Firestore doc stores `operatorId` (written during the Scheduled step).
// We need to surface it through the RequestItem type and mapDoc.
//
// 1. In the `FirestoreRequest` type, the field already exists in Firestore —
//    add it if not already there:
//
//      operatorId?: string;        // ← add this line
//
// 2. In the `RequestItem` type, add:
//
//      operatorId?: string;        // ← add this line
//
// 3. In `mapDoc`, add:
//
//      operatorId: d.operatorId,   // ← add to the returned object
//
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// PATCH 3: Contractor request card / detail modal
//
// Wherever you show a contractor's pickup card (e.g. MyRequestsPage or a
// detail modal), import and render TrackLiveButton:
//
//   import { TrackLiveButton } from "@/app/contractor/requests/components/TrackLiveButton";
//
//   // Inside the card/modal JSX, after your existing action buttons:
//   <TrackLiveButton requestId={req.id} status={req.status} />
//
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// PATCH 4: next.config.js  — allow Leaflet tile images and OSM/OSRM domains
//
// Add these to your Content-Security-Policy / next/image domains if applicable.
// Most projects just need this in next.config.js:
//
//   /** @type {import('next').NextConfig} */
//   const nextConfig = {
//     images: {
//       domains: ["unpkg.com", "tile.openstreetmap.org"],
//     },
//   };
//   module.exports = nextConfig;
//
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE RULES — paste into your firestore.rules file
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     match /wasteRequests/{requestId} {
//
//       // ... your existing rules ...
//
//       // Allow the assigned operator to write liveLocation (and only liveLocation)
//       allow update: if request.auth != null
//         && request.auth.uid == resource.data.operatorId
//         && request.resource.data.diff(resource.data).affectedKeys()
//              .hasOnly(['liveLocation', 'destinationLat', 'destinationLng', 'updatedAt']);
//
//       // Allow the assigned contractor to read the doc (for the tracking page)
//       allow read: if request.auth != null
//         && (request.auth.uid == resource.data.contractorId
//             || request.auth.uid == resource.data.operatorId);
//     }
//   }
// }
//
// ─────────────────────────────────────────────────────────────────────────────