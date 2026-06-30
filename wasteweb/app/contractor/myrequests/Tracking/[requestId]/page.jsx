"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { geocodeAddress } from "../../../../lib/geocode";
import { fetchOSRMRoute, formatDistance, formatDuration } from "../../../../lib/osrm";

const STALE_THRESHOLD_MS = 2 * 60 * 1000;
const TRACKING_STATUSES = new Set(["arriving", "in_transit"]);

function secondsAgo(updatedAt) {
  if (!updatedAt) return null;
  return Math.floor(Date.now() / 1000 - updatedAt.seconds);
}

function formatSecondsAgo(secs) {
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const PULSE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
  @keyframes wfPulse {
    0%   { box-shadow: 0 0 0 0 rgba(184,213,46,0.6); }
    70%  { box-shadow: 0 0 0 12px rgba(184,213,46,0); }
    100% { box-shadow: 0 0 0 0 rgba(184,213,46,0); }
  }
  @keyframes wfSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes wfFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wf-track-pulse { animation: wfPulse 1.8s ease-out infinite; }
  .leaflet-container { font-family: 'Quicksand', sans-serif !important; }
`;

export default function LiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.requestId;

  const [requestDoc, setRequestDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(true);

  const [destCoords, setDestCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);

  const [ticker, setTicker] = useState(0);

  const mapRef = useRef(null);
  const operatorMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const leafletLoadedRef = useRef(false);
  const mapInitialisedRef = useRef(false);

  const prevLiveRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTicker((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!requestId) return;
    const unsub = onSnapshot(doc(db, "wasteRequests", requestId), (snap) => {
      if (snap.exists()) {
        setRequestDoc(snap.data());
      }
      setDocLoading(false);
    });
    return () => unsub();
  }, [requestId]);

  useEffect(() => {
    if (!requestDoc?.location) return;
    if (destCoords) return;

    if (
      typeof requestDoc.destinationLat === "number" &&
      typeof requestDoc.destinationLng === "number"
    ) {
      setDestCoords({ lat: requestDoc.destinationLat, lng: requestDoc.destinationLng });
      return;
    }

    geocodeAddress(requestDoc.location, requestId).then((pt) => {
      if (pt) setDestCoords(pt);
      else setGeocodeError(true);
    });
  }, [requestDoc?.location, requestDoc?.destinationLat, requestDoc?.destinationLng]);

  const refreshRoute = useCallback(
    async (opLat, opLng) => {
      if (!destCoords) return;
      setRouteLoading(true);
      const result = await fetchOSRMRoute(opLat, opLng, destCoords.lat, destCoords.lng);
      setRoute(result);
      setRouteLoading(false);
    },
    [destCoords]
  );

  useEffect(() => {
    if (leafletLoadedRef.current) return;
    leafletLoadedRef.current = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (mapInitialisedRef.current) return;
    if (!mapContainerRef.current) return;
    if (typeof window === "undefined") return;

    import("leaflet").then((L) => {
      if (mapInitialisedRef.current) return;
      mapInitialisedRef.current = true;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
        .addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      map.setView([9.082, 8.6753], 6);

      const destIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:#1a4d2e;border:3px solid #fff;
            transform:rotate(-45deg);
            box-shadow:0 3px 10px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="
              transform:rotate(45deg);
              font-size:14px;line-height:1;
            ">📍</div>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const operatorIcon = L.divIcon({
        className: "",
        html: `
          <div class="wf-track-pulse" style="
            width:40px;height:40px;border-radius:50%;
            background:#B8D52E;border:3px solid #1a4d2e;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;
          ">🚛</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      mapRef.current = map;

      destMarkerRef.current = L.marker([0, 0], { icon: destIcon, zIndexOffset: 100 })
        .bindPopup("<b style='font-family:Quicksand,sans-serif'>Pickup destination</b>");

      operatorMarkerRef.current = L.marker([0, 0], { icon: operatorIcon, zIndexOffset: 200 })
        .bindPopup("<b style='font-family:Quicksand,sans-serif'>Operator location</b>");
    });
  }, []);

  useEffect(() => {
    if (!destCoords || !mapRef.current || !destMarkerRef.current) return;
    import("leaflet").then((L) => {
      const marker = destMarkerRef.current;
      if (!mapRef.current.hasLayer(marker)) marker.addTo(mapRef.current);
      marker.setLatLng([destCoords.lat, destCoords.lng]);
    });
  }, [destCoords]);

  useEffect(() => {
    const live = requestDoc?.liveLocation;
    if (!live || !mapRef.current || !operatorMarkerRef.current) return;

    const hasMoved =
      !prevLiveRef.current ||
      prevLiveRef.current.lat !== live.lat ||
      prevLiveRef.current.lng !== live.lng;

    if (!hasMoved) return;
    prevLiveRef.current = { lat: live.lat, lng: live.lng };

    import("leaflet").then((L) => {
      const marker = operatorMarkerRef.current;
      const map = mapRef.current;
      if (!map.hasLayer(marker)) marker.addTo(map);
      marker.setLatLng([live.lat, live.lng]);

      if (destCoords) {
        const bounds = L.latLngBounds(
          [live.lat, live.lng],
          [destCoords.lat, destCoords.lng]
        );
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      } else {
        map.setView([live.lat, live.lng], 14);
      }

      refreshRoute(live.lat, live.lng);
    });
  }, [requestDoc?.liveLocation, destCoords, refreshRoute]);

  useEffect(() => {
    if (!route || !mapRef.current) return;
    import("leaflet").then((L) => {
      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
      }
      routeLayerRef.current = L.polyline(route.coordinates, {
        color: "#1a4d2e",
        weight: 5,
        opacity: 0.75,
        lineCap: "round",
        lineJoin: "round",
        dashArray: undefined,
      }).addTo(mapRef.current);
    });
  }, [route]);

  const live = requestDoc?.liveLocation;
  const updatedSecsAgo = live?.updatedAt ? secondsAgo(live.updatedAt) : null;
  const isStale =
    updatedSecsAgo !== null && updatedSecsAgo * 1000 > STALE_THRESHOLD_MS;
  const isTrackingActive =
    requestDoc && TRACKING_STATUSES.has(requestDoc.status);

  const statusLabel =
    requestDoc?.status === "in_transit" ? "In Transit" :
    requestDoc?.status === "arriving"   ? "Arriving"   :
    requestDoc?.status ?? "—";

  if (docLoading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f5faf6",
      }}>
        <style>{PULSE_CSS}</style>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5"
          style={{ width: 30, height: 30, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    );
  }

  if (!requestDoc) {
    return (
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#f5faf6",
        gap: 12, fontFamily: "'Quicksand', sans-serif",
      }}>
        <style>{PULSE_CSS}</style>
        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2e1f" }}>
          Request not found
        </p>
        <button onClick={() => router.back()} style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: "#1a4d2e", color: "#B8D52E",
          fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
        }}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#f5faf6", fontFamily: "'Quicksand', sans-serif",
      overflow: "hidden",
    }}>
      <style>{PULSE_CSS}</style>

      <div style={{
        flexShrink: 0, background: "#ffffff", borderBottom: "1px solid #e8f2eb",
        padding: "0 20px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{
            width: 34, height: 34, borderRadius: 9,
            background: "#f0f7f2", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4a7a5a", flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 15, height: 15 }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <p style={{
              fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 1,
            }}>Live Tracking</p>
            <h1 style={{
              fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1f",
              margin: 0, lineHeight: 1.2,
              maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{requestDoc.title}</h1>
          </div>
        </div>

        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
          background: isTrackingActive
            ? "rgba(184,213,46,0.12)" : "rgba(100,116,139,0.10)",
          color: isTrackingActive ? "#3a6b00" : "#475569",
          border: `1px solid ${isTrackingActive
            ? "rgba(184,213,46,0.35)" : "rgba(100,116,139,0.25)"}`,
          flexShrink: 0,
        }}>
          {isTrackingActive && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#B8D52E",
              boxShadow: "0 0 0 2px rgba(184,213,46,0.3)",
            }}/>
          )}
          {statusLabel}
        </span>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        <div style={{
          position: "absolute", bottom: 20, left: 16, right: 16,
          zIndex: 900, animation: "wfFadeIn 0.3s ease",
        }}>
          {isStale && (
            <div style={{
              background: "rgba(251,191,36,0.95)",
              border: "1px solid rgba(217,119,6,0.4)",
              borderRadius: 10, padding: "8px 14px", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 8,
              backdropFilter: "blur(8px)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#92400e"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 15, height: 15, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{
                fontSize: "0.75rem", fontWeight: 700, color: "#92400e",
              }}>
                Location hasn't updated in {formatSecondsAgo(updatedSecsAgo)} — operator may be offline
              </span>
            </div>
          )}

          {!isTrackingActive && (
            <div style={{
              background: "rgba(255,255,255,0.95)", borderRadius: 14,
              padding: "14px 16px", border: "1px solid #e8f2eb",
              backdropFilter: "blur(10px)", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#8aab97"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 20, height: 20, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#3a5a45", margin: 0 }}>
                  Tracking will begin soon
                </p>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#8aab97", margin: "2px 0 0" }}>
                  Live location activates once the operator marks this job as Arriving or In Transit
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: "rgba(255,255,255,0.97)",
            borderRadius: 16, border: "1px solid #e8f2eb",
            boxShadow: "0 8px 32px rgba(26,46,31,0.12)",
            padding: "16px 18px",
            backdropFilter: "blur(10px)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {route && (
              <div style={{
                display: "flex", gap: 10,
                borderBottom: "1px solid #f0f7f2", paddingBottom: 12,
                position: "relative",
              }}>
                <div style={{
                  flex: 1, background: "#f5faf6", borderRadius: 10,
                  padding: "10px 14px", display: "flex", flexDirection: "column", gap: 3,
                }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Distance
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e1f" }}>
                    {formatDistance(route.distanceM)}
                  </span>
                </div>
                <div style={{
                  flex: 1, background: "#f5faf6", borderRadius: 10,
                  padding: "10px 14px", display: "flex", flexDirection: "column", gap: 3,
                }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    ETA
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e1f" }}>
                    {formatDuration(route.durationS)}
                  </span>
                </div>
                {routeLoading && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#B8D52E"
                      strokeWidth="2.5" style={{ width: 12, height: 12, animation: "wfSpin 0.8s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(184,213,46,0.12)",
                border: "1px solid rgba(184,213,46,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 16,
              }}>🚛</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>
                  {requestDoc.operatorName ?? "Operator"}
                </p>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#8aab97", margin: "2px 0 0" }}>
                  {live
                    ? updatedSecsAgo !== null
                      ? `Last seen ${formatSecondsAgo(updatedSecsAgo)}`
                      : "Location received"
                    : isTrackingActive
                    ? "Waiting for first location…"
                    : "Not yet broadcasting"}
                </p>
              </div>
              {live && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "0.65rem", fontWeight: 700,
                  color: isStale ? "#b45309" : "#3a6b00",
                  background: isStale ? "rgba(251,191,36,0.12)" : "rgba(184,213,46,0.12)",
                  border: `1px solid ${isStale ? "rgba(251,191,36,0.3)" : "rgba(184,213,46,0.3)"}`,
                  padding: "3px 8px", borderRadius: 999,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: isStale ? "#f59e0b" : "#B8D52E",
                  }}/>
                  {isStale ? "Stale" : "Live"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(26,77,46,0.08)",
                border: "1px solid rgba(26,77,46,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 16,
              }}>📍</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>
                  Pickup destination
                </p>
                <p style={{
                  fontSize: "0.72rem", fontWeight: 600, color: "#8aab97",
                  margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {requestDoc.location}
                </p>
                {geocodeError && (
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#b91c1c", margin: "2px 0 0" }}>
                    Couldn't place pin — address may be too vague
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}