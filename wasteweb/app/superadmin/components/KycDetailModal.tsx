"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface KycDetailModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  companyName: "Company / Organisation Name",
  phone: "Phone Number",
  regNumber: "Companies House Reg. Number",
  vatNumber: "VAT Number",
  serviceArea: "Service Area(s) / Postcodes Covered",
  wasteHandled: "Waste Types Handled",
  vehicles: "Number of Vehicles",
  tonnage: "Tonnage Capacity",
  insuranceProvider: "Public Liability Insurance Provider",
  policyNumber: "Policy Number",
  siteAddress: "Site Address",
  postcode: "Postcode",
  wasteTypes: "Waste Types Generated",
  frequency: "Estimated Disposal Frequency",
};

const DOC_FIELD_LABELS: Record<string, string> = {
  wasteCarrierDocUrl: "Waste Carrier Licence",
  businessDocUrl: "Business Registration Document",
};

function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

function formatValue(value: any): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function KycDetailModal({ userId, userName, onClose }: KycDetailModalProps) {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "kyc", userId));
        if (cancelled) return;
        if (snap.exists()) {
          setData(snap.data());
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("[KycDetailModal] Failed to load KYC doc:", err);
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const fieldEntries = data
    ? Object.entries(FIELD_LABELS).filter(([key]) => key in data)
    : [];
  const docEntries = data
    ? Object.entries(DOC_FIELD_LABELS).filter(([key]) => data[key])
    : [];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto",
        background: "#ffffff", borderRadius: 16, padding: 24, fontFamily: "'Quicksand', sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
              KYC Submission
            </p>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1a2e1f", margin: "2px 0 0" }}>{userName}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, background: "#f5faf6", border: "none",
              cursor: "pointer", color: "#4a7a5a", fontSize: "0.9rem", flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {loading && (
          <p style={{ fontSize: "0.85rem", color: "#9ab8a5", textAlign: "center", padding: "24px 0" }}>Loading…</p>
        )}

        {!loading && notFound && (
          <p style={{ fontSize: "0.85rem", color: "#9ab8a5", textAlign: "center", padding: "24px 0" }}>
            No KYC submission found for this account.
          </p>
        )}

        {!loading && data && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {fieldEntries.map(([key, label]) => (
                <div key={key} style={{ borderBottom: "1px solid #f0f7f2", paddingBottom: 10 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a2e1f", margin: "3px 0 0", wordBreak: "break-word" }}>
                    {formatValue(data[key])}
                  </p>
                </div>
              ))}
              {fieldEntries.length === 0 && (
                <p style={{ fontSize: "0.82rem", color: "#9ab8a5" }}>No form fields recorded.</p>
              )}
            </div>

            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
              Submitted Documents
            </p>
            {docEntries.length === 0 && (
              <p style={{ fontSize: "0.82rem", color: "#9ab8a5" }}>No documents attached.</p>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {docEntries.map(([key, label]) => {
                const url = data[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", flex: "1 1 200px", minWidth: 180 }}
                  >
                    <div style={{
                      border: "1px solid #e8f2eb", borderRadius: 10, overflow: "hidden", background: "#f5faf6",
                    }}>
                      {isImageUrl(url) ? (
                        <div style={{ aspectRatio: "4 / 3", background: "#eef5f0" }}>
                          <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ) : (
                        <div style={{ aspectRatio: "4 / 3", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ab8a5", fontSize: "0.75rem" }}>
                          Document (open in new tab)
                        </div>
                      )}
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a4d2e", margin: 0, padding: "8px 10px" }}>
                        {label} →
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
