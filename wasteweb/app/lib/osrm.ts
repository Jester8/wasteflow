export interface RouteResult {
  /** Array of [lat, lng] pairs for the Leaflet polyline */
  coordinates: [number, number][];
  /** Distance in metres */
  distanceM: number;
  /** Duration in seconds */
  durationS: number;
}

/**
 * Fetches a road route between two points using the public OSRM demo server.
 * Free, no API key required.
 *
 * OSRM demo server fair-use note: suitable for development and low-traffic
 * production. For high traffic, self-host or use a commercial OSRM provider.
 *
 * Returns null if routing fails (e.g. unreachable area, network error).
 */
export async function fetchOSRMRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<RouteResult | null> {
  // OSRM expects coordinates as lng,lat (longitude first)
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originLng},${originLat};${destLng},${destLat}` +
    `?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      console.warn("[OSRM] No route found:", data.code);
      return null;
    }

    const route = data.routes[0];
    // GeoJSON geometry coords are [lng, lat] — flip to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    return {
      coordinates,
      distanceM: route.distance,
      durationS: route.duration,
    };
  } catch (err) {
    console.error("[OSRM] Route fetch error:", err);
    return null;
  }
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}