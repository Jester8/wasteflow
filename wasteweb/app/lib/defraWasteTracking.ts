// Server-only. Never import this from a client component — it reads
// DEFRA_WASTE_TRACKING_* secrets from process.env that must not reach the
// browser bundle.
//
// Integrates with DEFRA's Digital Waste Tracking Service ("Receipt of
// Waste" API), currently in Public Beta ahead of the October 2026 mandate.
// Spec verified directly against the official developer guide and the
// DEFRA/waste-tracking-service Bruno example collection on GitHub (as of
// July 2026) — see:
//   https://defra.github.io/waste-tracking-service/production/api-specification/
//   https://defra.github.io/waste-tracking-service/production/api-authentication-guide/
//   https://defra.github.io/waste-tracking-service/production/receipt-data-definitions/
//   https://github.com/DEFRA/waste-tracking-service/tree/main/docs/bruno/digitalWasteTrackingExternalAPI
// This is a draft/beta government API and the schema may change — re-check
// against the live docs before relying on this for real compliance
// submissions.

const AUTH_BASE_URL = {
  test: "https://waste-movement-external-api-8ec5c.auth.eu-west-2.amazoncognito.com",
  production: "https://waste-movement-external-api-75ee2.auth.eu-west-2.amazoncognito.com",
} as const;

type DefraEnv = "test" | "production";

function getEnv(): DefraEnv {
  return process.env.DEFRA_WASTE_TRACKING_ENV === "production" ? "production" : "test";
}

function getConfig() {
  const env = getEnv();
  const prefix = env === "production" ? "DEFRA_WASTE_TRACKING_PROD" : "DEFRA_WASTE_TRACKING_TEST";
  const baseUrl = process.env[`${prefix}_BASE_URL`];
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

  if (!baseUrl || !clientId || !clientSecret) {
    return null;
  }
  return { env, baseUrl, clientId, clientSecret, authBaseUrl: AUTH_BASE_URL[env] };
}

// In-memory token cache — fine for a single Node process; Next.js API
// routes on serverless platforms may cold-start and refetch more often,
// which is harmless (just an extra token request), never incorrect.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(config: NonNullable<ReturnType<typeof getConfig>>): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 10_000) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const res = await fetch(`${config.authBaseUrl}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DEFRA token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("DEFRA token response missing access_token");
  }

  // expires_in is in seconds; Cognito client_credentials tokens are
  // typically ~1 hour. Fall back to 5 minutes if the field is absent.
  const ttlMs = (typeof data.expires_in === "number" ? data.expires_in : 300) * 1000;
  cachedToken = { value: data.access_token, expiresAt: Date.now() + ttlMs };
  return data.access_token;
}

export interface DefraWeight {
  metric: "Tonnes" | "Kilograms";
  amount: number;
  isEstimate: boolean;
}

export interface DefraReceiptPayload {
  apiCode: string;
  dateTimeReceived: string; // ISO 8601
  wasteItems: {
    ewcCodes: string[];
    wasteDescription: string;
    physicalForm: string;
    numberOfContainers: number;
    typeOfContainers: string;
    weight: DefraWeight;
    containsHazardous: boolean;
    containsPops: boolean;
    disposalOrRecoveryCodes: { code: string; weight: DefraWeight }[];
  }[];
  carrier: {
    organisationName: string;
    registrationNumber: string;
    meansOfTransport: string;
    vehicleRegistration?: string;
  };
  receiver: {
    siteName?: string;
    emailAddress?: string;
    authorisationNumber: string;
  };
  receipt: {
    address: {
      fullAddress: string;
      postcode: string;
    };
  };
}

export type DefraSubmitResult =
  | { ok: true; globalMovementId: string; env: DefraEnv }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "request_failed"; status: number; error: string };

/**
 * Submits a Receipt of Waste record to DEFRA's Digital Waste Tracking
 * Service. Returns a structured result rather than throwing, so callers
 * (a completion flow that must never fail because of this) can always
 * proceed and just record what happened.
 */
export async function submitReceiptOfWaste(payload: DefraReceiptPayload): Promise<DefraSubmitResult> {
  const config = getConfig();
  if (!config) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const token = await getAccessToken(config);
    const res = await fetch(`${config.baseUrl}/movements/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        reason: "request_failed",
        status: res.status,
        error: body?.message || body?.error || JSON.stringify(body) || `HTTP ${res.status}`,
      };
    }

    if (!body.globalMovementId) {
      return {
        ok: false,
        reason: "request_failed",
        status: res.status,
        error: "Response missing globalMovementId",
      };
    }

    return { ok: true, globalMovementId: body.globalMovementId, env: config.env };
  } catch (err: any) {
    return { ok: false, reason: "request_failed", status: 0, error: err?.message || String(err) };
  }
}
