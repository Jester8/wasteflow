"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveJob } from "../lib/useSuperAdminData";

function buildTruckIcon(L: any, active: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:34px;height:34px;">
        <div style="
          position:absolute;inset:1px;border-radius:50%;
          background:${active ? "#B8D52E" : "#c6e2d0"};border:3px solid #1a4d2e;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
        ">🚛</div>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export default function FleetLiveMap({
  jobs, focusId, height = 420,
}: {
  jobs: LiveJob[];
  focusId?: string | null;
  height?: number;
}) {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletLoadedRef = useRef(false);
  const mapInitialisedRef = useRef(false);
  const markersRef = useRef<Record<string, any>>({});

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

    import("leaflet").then((L: any) => {
      if (mapInitialisedRef.current) return;
      mapInitialisedRef.current = true;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
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

      map.setView([54.5, -3], 5.3);

      mapRef.current = map;
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    import("leaflet").then((L: any) => {
      const map = mapRef.current;
      const seen = new Set<string>();

      jobs.forEach((job) => {
        if (!job.liveLocation) return;
        seen.add(job.id);
        const active = job.status === "in_transit" || job.status === "arriving";
        let marker = markersRef.current[job.id];
        const popupHtml = `
          <div style="font-family:'Quicksand',sans-serif;min-width:150px;">
            <b>${job.operatorName || "Operator"}</b><br/>
            ${job.contractorName} · ${job.title}<br/>
            <span style="color:#6b8f7a;">${job.location}</span>
          </div>`;

        if (!marker) {
          marker = L.marker([job.liveLocation.lat, job.liveLocation.lng], {
            icon: buildTruckIcon(L, active),
          }).bindPopup(popupHtml);
          marker.addTo(map);
          markersRef.current[job.id] = marker;
        } else {
          marker.setLatLng([job.liveLocation.lat, job.liveLocation.lng]);
          marker.setPopupContent(popupHtml);
        }
      });

      Object.keys(markersRef.current).forEach((id) => {
        if (!seen.has(id)) {
          map.removeLayer(markersRef.current[id]);
          delete markersRef.current[id];
        }
      });

      const points = jobs
        .filter((j) => j.liveLocation)
        .map((j) => [j.liveLocation!.lat, j.liveLocation!.lng] as [number, number]);

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    });
  }, [jobs, mapReady]);

  useEffect(() => {
    if (!focusId || !mapReady || !mapRef.current) return;
    const marker = markersRef.current[focusId];
    if (marker) {
      mapRef.current.setView(marker.getLatLng(), 14);
      marker.openPopup();
    }
  }, [focusId, mapReady]);

  return (
    <div style={{
      width: "100%", height, borderRadius: 14, overflow: "hidden",
      border: "1px solid #e8f2eb", position: "relative", background: "#f5faf6",
    }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {jobs.length === 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(245,250,246,0.85)", zIndex: 500,
        }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9ab8a5", fontFamily: "'Quicksand', sans-serif" }}>
            No jobs currently in transit.
          </p>
        </div>
      )}
    </div>
  );
}
