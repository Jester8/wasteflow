"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOperatorAdminData } from "../lib/useOperatorAdminData";
import { SKIP_SIZES } from "../lib/constants";

export default function PricingPage() {
  const { uid } = useOperatorAdminData();
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    if (!uid) return;
    const priceRef = collection(db, "users", uid, "priceList");
    const unsub = onSnapshot(priceRef, (snap) => {
      const map: Record<number, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[data.size] = data.price;
      });
      setPrices(map);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  async function handleSave(size: number) {
    const raw = drafts[size];
    const value = Number(raw);
    if (isNaN(value) || value < 0) return;
    setSaving(size);
    try {
      await setDoc(doc(db, "users", uid, "priceList", String(size)), {
        size, price: value, updatedAt: serverTimestamp(),
      }, { merge: true });
      setDrafts((prev) => { const next = { ...prev }; delete next[size]; return next; });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Price List</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Your GBP price per skip size — visible to sites requesting a pickup.
      </p>

      <div style={{
        background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
        overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        <table style={{ width: "100%", minWidth: 380, borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "#f8fbf9", textAlign: "left" }}>
              {["Skip Size", "Price (GBP)", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "12px 16px", fontSize: "0.66rem", fontWeight: 700, color: "#6b8f7a",
                  textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e8f2eb",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 32, textAlign: "center", color: "#9ab8a5" }}>Loading…</td></tr>
            ) : SKIP_SIZES.map((size) => {
              const current = prices[size];
              const draft = drafts[size];
              return (
                <tr key={size} style={{ borderBottom: "1px solid #f0f7f2" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "#1a2e1f" }}>{size} yd</td>
                  <td style={{ padding: "10px 16px" }}>
                    <input
                      type="number"
                      min={0}
                      value={draft !== undefined ? draft : (current ?? "")}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [size]: e.target.value }))}
                      placeholder="—"
                      style={{
                        width: 110, padding: "7px 10px", borderRadius: 8,
                        border: "1px solid #e8f2eb", fontSize: "0.82rem", fontWeight: 600,
                        color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none",
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button
                      onClick={() => handleSave(size)}
                      disabled={draft === undefined || saving === size}
                      style={{
                        padding: "6px 14px", borderRadius: 8, border: "none",
                        background: draft === undefined ? "#f0f7f2" : "#1a4d2e",
                        color: draft === undefined ? "#9ab8a5" : "#B8D52E",
                        fontSize: "0.76rem", fontWeight: 700, cursor: draft === undefined ? "default" : "pointer",
                        fontFamily: "'Quicksand', sans-serif",
                      }}
                    >
                      {saving === size ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
