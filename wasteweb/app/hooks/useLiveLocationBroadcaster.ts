"use client";

import { useEffect, useRef } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequestItem } from "@/app/types/request";

// Only broadcast for these statuses
const ACTIVE_STATUSES = new Set(["Arriving", "In Transit"]);

// Throttle: only write to Firestore if moved >= MIN_DISTANCE_METRES OR >= MIN_INTERVAL_MS has passed
const MIN_DISTANCE_METRES = 20;
const MIN_INTERVAL_MS = 10_000; // 10 seconds

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000; // earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Watches the operator's GPS position and writes it to Firestore
 * for every request that is currently "Arriving" or "In Transit"
 * and belongs to this operator (matched by operatorId).
 *
 * Usage: call at the top of RequestsPage, pass enrichedRequests + user.uid
 */
export function useLiveLocationBroadcaster(
  requests: RequestItem[],
  operatorId: string | undefined
) {
  // Map of requestId → { lastLat, lastLng, lastWrittenAt }
  const lastWriteRef = useRef<
    Record<string, { lat: number; lng: number; writtenAt: number }>
  >({});
  const watchIdRef = useRef<number | null>(null);

  // The set of request IDs we should be broadcasting for right now
  const activeRequestIds = requests
    .filter(
      (r) =>
        ACTIVE_STATUSES.has(r.status) &&
        // Only broadcast for requests this operator scheduled
        // (operatorId stored on the doc as operatorId field — we pass it through RequestItem)
        (r as any).operatorId === operatorId
    )
    .map((r) => r.id);

  useEffect(() => {
    if (!operatorId) return;
    if (activeRequestIds.length === 0) {
      // Nothing to track — clear any existing watcher
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      console.warn("[LiveBroadcaster] Geolocation not available in this browser.");
      return;
    }

    // Start (or keep) a single watchPosition for all active requests
    if (watchIdRef.current !== null) {
      // Already watching — effect deps changed (e.g. a new request went active)
      // Clear and restart so the closure captures fresh activeRequestIds
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const activeIds = [...activeRequestIds]; // snapshot for closure

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, heading, speed } = position.coords;
        const now = Date.now();

        activeIds.forEach(async (requestId) => {
          const last = lastWriteRef.current[requestId];

          const movedEnough =
            !last ||
            haversineDistance(last.lat, last.lng, lat, lng) >= MIN_DISTANCE_METRES;
          const timeEnough =
            !last || now - last.writtenAt >= MIN_INTERVAL_MS;

          if (!movedEnough && !timeEnough) return;

          // Update throttle record optimistically
          lastWriteRef.current[requestId] = { lat, lng, writtenAt: now };

          try {
            await updateDoc(doc(db, "wasteRequests", requestId), {
              liveLocation: {
                lat,
                lng,
                heading: heading ?? null,
                speed: speed ?? null,
                updatedAt: serverTimestamp(),
              },
            });
          } catch (err) {
            console.error(
              `[LiveBroadcaster] Failed to write location for ${requestId}:`,
              err
            );
          }
        });
      },
      (err) => {
        console.error("[LiveBroadcaster] watchPosition error:", err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,   // accept cached positions up to 5s old
        timeout: 15_000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorId, activeRequestIds.join(",")]);
}