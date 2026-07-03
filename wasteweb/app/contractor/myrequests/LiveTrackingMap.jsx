"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { geocodeAddress } from "../../lib/geocode";
import { fetchOSRMRoute, formatDistance, formatDuration } from "../../lib/osrm";

const STALE_THRESHOLD_MS = 2 * 60 * 1000;
const TRACKING_STATUSES = new Set(["arriving", "in_transit"]);

function haversineDistanceM(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function secondsAgo(updatedAt) {
  if (!updatedAt) return null;
  if (typeof updatedAt.seconds === "number") {
    return Math.floor(Date.now() / 1000 - updatedAt.seconds);
  }
  return null;
}

function formatSecondsAgo(secs) {
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

/**
 * Embeddable live map — driven entirely by props so it can ride on whatever
 * real-time subscription the parent already has (no Firestore listener here).
 */
export default function LiveTrackingMap({
  requestId,
  location,
  destinationLat,
  destinationLng,
  liveLocation,
  operatorName,
  rawStatus,
  height = 300,
}) {
  const [destCoords, setDestCoords] = useState(
    typeof destinationLat === "number" && typeof destinationLng === "number"
      ? { lat: destinationLat, lng: destinationLng }
      : null
  );
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const [, setTicker] = useState(0);

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
    if (destCoords || !location) return;
    geocodeAddress(location, requestId).then((pt) => {
      if (pt) setDestCoords(pt);
      else setGeocodeError(true);
    });
  }, [location, requestId, destCoords]);

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
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:#1a4d2e;border:3px solid #fff;
            transform:rotate(-45deg);
            box-shadow:0 3px 10px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="transform:rotate(45deg);font-size:12px;line-height:1;">📍</div>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const operatorIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:#B8D52E;border:3px solid #1a4d2e;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;
          ">🚛</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
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
      if (!liveLocation) mapRef.current.setView([destCoords.lat, destCoords.lng], 13);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destCoords]);

  useEffect(() => {
    if (!liveLocation || !mapRef.current || !operatorMarkerRef.current) return;

    const hasMoved =
      !prevLiveRef.current ||
      prevLiveRef.current.lat !== liveLocation.lat ||
      prevLiveRef.current.lng !== liveLocation.lng;
    if (!hasMoved) return;
    prevLiveRef.current = { lat: liveLocation.lat, lng: liveLocation.lng };

    import("leaflet").then((L) => {
      const marker = operatorMarkerRef.current;
      const map = mapRef.current;
      if (!map.hasLayer(marker)) marker.addTo(map);
      marker.setLatLng([liveLocation.lat, liveLocation.lng]);

      if (destCoords) {
        const bounds = L.latLngBounds(
          [liveLocation.lat, liveLocation.lng],
          [destCoords.lat, destCoords.lng]
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else {
        map.setView([liveLocation.lat, liveLocation.lng], 14);
      }

      refreshRoute(liveLocation.lat, liveLocation.lng);
    });
  }, [liveLocation, destCoords, refreshRoute]);

  useEffect(() => {
    if (!route || !mapRef.current) return;
    import("leaflet").then((L) => {
      if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = L.polyline(route.coordinates, {
        color: "#1a4d2e",
        weight: 4,
        opacity: 0.75,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(mapRef.current);
    });
  }, [route]);

  const updatedSecsAgo = liveLocation?.updatedAt ? secondsAgo(liveLocation.updatedAt) : null;
  const isStale = updatedSecsAgo !== null && updatedSecsAgo * 1000 > STALE_THRESHOLD_MS;
  const isTrackingActive = TRACKING_STATUSES.has(rawStatus);

  // Instant straight-line distance so the card isn't blank while OSRM resolves
  const straightLineM =
    liveLocation && destCoords
      ? haversineDistanceM(liveLocation.lat, liveLocation.lng, destCoords.lat, destCoords.lng)
      : null;
  const showDistanceCard = route || straightLineM !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        width: "100%", height, borderRadius: 14, overflow: "hidden",
        border: "1px solid #e8f2eb", position: "relative", background: "#f5faf6",
      }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        <span style={{
          position: "absolute", top: 10, left: 10, zIndex: 500,
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
          background: isTrackingActive ? "rgba(184,213,46,0.92)" : "rgba(255,255,255,0.92)",
          color: isTrackingActive ? "#0d2416" : "#475569",
          border: "1px solid rgba(255,255,255,0.6)",
          fontFamily: "'Quicksand', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          {isTrackingActive && liveLocation && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d2416" }} />
          )}
          {isTrackingActive ? (liveLocation ? "Live" : "Waiting for signal…") : "Not tracking"}
        </span>

        {showDistanceCard && (
          <div style={{
            position: "absolute", bottom: 10, left: 10, right: 10, zIndex: 500,
            display: "flex", gap: 8,
          }}>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.95)", borderRadius: 10,
              padding: "8px 12px", fontFamily: "'Quicksand', sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase" }}>
                Distance to pickup
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1f" }}>
                {route ? formatDistance(route.distanceM) : `~${formatDistance(straightLineM)}`}
              </div>
            </div>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.95)", borderRadius: 10,
              padding: "8px 12px", fontFamily: "'Quicksand', sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase" }}>ETA</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e1f" }}>
                {route ? formatDuration(route.durationS) : "Calculating…"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b8f7a", fontFamily: "'Quicksand', sans-serif" }}>
          {liveLocation
            ? updatedSecsAgo !== null
              ? `${operatorName || "Operator"} · last seen ${formatSecondsAgo(updatedSecsAgo)}`
              : `${operatorName || "Operator"} · location received`
            : isTrackingActive
            ? "Waiting for the operator's first location update…"
            : "Live tracking activates once the job is Arriving or In Transit"}
        </span>
        {liveLocation && (
          <span style={{
            fontSize: "0.65rem", fontWeight: 700,
            color: isStale ? "#b45309" : "#3a6b00",
            fontFamily: "'Quicksand', sans-serif",
          }}>
            {isStale ? "Stale" : "Live"}
          </span>
        )}
      </div>

      {geocodeError && (
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b91c1c", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
          Couldn't place the pickup address on the map — it may be too vague.
        </p>
      )}
      {routeLoading && !route && (
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand', sans-serif", margin: 0 }}>
          Calculating route…
        </p>
      )}
    </div>
  );
}
