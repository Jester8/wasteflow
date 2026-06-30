import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface GeoPoint {
  lat: number;
  lng: number;
}

// In-memory cache so we never hit Nominatim twice in the same session
const memCache = new Map<string, GeoPoint | null>();

/**
 * Geocodes a free-text address using Nominatim (OpenStreetMap).
 * Results are cached:
 *   1. In-memory for the session lifetime
 *   2. Written back to the wasteRequests/{requestId} doc as
 *      destinationLat / destinationLng so future visits skip the API call
 *
 * Nominatim usage policy: max 1 req/sec, must send a real User-Agent.
 * We satisfy both by only calling once (cached) and setting the header.
 */
export async function geocodeAddress(
  address: string,
  requestId?: string
): Promise<GeoPoint | null> {
  const cacheKey = address.trim().toLowerCase();

  // 1. Memory cache
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)!;

  // 2. Firestore cache (if we have a requestId)
  if (requestId) {
    try {
      const snap = await getDoc(doc(db, "wasteRequests", requestId));
      if (snap.exists()) {
        const d = snap.data();
        if (typeof d.destinationLat === "number" && typeof d.destinationLng === "number") {
          const cached: GeoPoint = { lat: d.destinationLat, lng: d.destinationLng };
          memCache.set(cacheKey, cached);
          return cached;
        }
      }
    } catch {
      // non-fatal — fall through to Nominatim
    }
  }

  // 3. Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim policy requires a real User-Agent identifying your app
        "User-Agent": "WasteFlow/1.0 (wasteflow-app)",
      },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();

    if (!data.length) {
      console.warn("[geocode] No result for:", address);
      memCache.set(cacheKey, null);
      return null;
    }

    const point: GeoPoint = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    memCache.set(cacheKey, point);

    // Write back to Firestore so the next visit is instant
    if (requestId) {
      try {
        await updateDoc(doc(db, "wasteRequests", requestId), {
          destinationLat: point.lat,
          destinationLng: point.lng,
        });
      } catch {
        // non-fatal
      }
    }

    return point;
  } catch (err) {
    console.error("[geocode] Error:", err);
    memCache.set(cacheKey, null);
    return null;
  }
}