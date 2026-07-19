"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.12)", color: "#b45309", label: "Pending" },
  scheduled: { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8", label: "Scheduled" },
  arriving: { bg: "rgba(34,211,238,0.10)", color: "#0e7490", label: "Arriving" },
  in_transit: { bg: "rgba(168,85,247,0.10)", color: "#7c3aed", label: "In Transit" },
  completed: { bg: "rgba(184,213,46,0.14)", color: "#3a6b00", label: "Completed" },
  declined: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", label: "Declined" },
  cancelled: { bg: "rgba(239,68,68,0.10)", color: "#b91c1c", label: "Cancelled" },
  awaiting_reschedule: { bg: "rgba(139,92,246,0.12)", color: "#7c3aed", label: "Rescheduled" },
};

const TABS = ["All", "pending", "scheduled", "arriving", "in_transit", "completed", "declined"];

function formatDate(ts: any): string {
  if (!ts?.seconds) return "—";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

interface RequestRow {
  id: string;
  title: string;
  wasteType: string;
  contractorName: string;
  status: string;
  assignedOperatorId?: string;
  operatorName?: string;
  createdAt: any;
}

export default function ContractorAdminDashboard() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [operatorNames, setOperatorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, "wasteRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "Untitled",
          wasteType: data.wasteType || "General",
          contractorName: data.contractorName || "—",
          status: data.status || "pending",
          assignedOperatorId: data.assignedOperatorId,
          operatorName: data.operatorName,
          createdAt: data.createdAt,
        } as RequestRow;
      }));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const missing = Array.from(new Set(
      requests
        .filter((r) => r.assignedOperatorId && !r.operatorName && !operatorNames[r.assignedOperatorId])
        .map((r) => r.assignedOperatorId!)
    ));
    if (missing.length === 0) return;
    missing.forEach(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setOperatorNames((prev) => ({ ...prev, [uid]: snap.data().fullName || "Operator" }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const filtered = tab === "All" ? requests : requests.filter((r) => r.status === tab);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Live Feed</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Every pickup request across every contractor, in real time.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 14px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700,
              background: tab === t ? "#1a4d2e" : "#ffffff",
              color: tab === t ? "#B8D52E" : "#4a7a5a",
              border: tab === t ? "1px solid #1a4d2e" : "1px solid #e8f2eb",
              cursor: "pointer", fontFamily: "'Quicksand', sans-serif", whiteSpace: "nowrap",
            }}
          >
            {t === "All" ? "All" : (STATUS_STYLE[t]?.label || t)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 16,
            color: "#9ab8a5", fontSize: "0.85rem",
          }}>
            No requests here yet.
          </div>
        ) : filtered.map((r) => {
          const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
          const operatorLabel = r.operatorName || (r.assignedOperatorId ? operatorNames[r.assignedOperatorId] : null);
          return (
            <div key={r.id} style={{
              background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
              padding: 16, boxShadow: SHADOW_SM,
              display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>
                  {r.contractorName} · {r.wasteType} · {formatDate(r.createdAt)}
                </p>
                <p style={{ fontSize: "0.74rem", color: "#8aab97", margin: "2px 0 0" }}>
                  {operatorLabel ? `Assigned to ${operatorLabel}` : "Awaiting operator assignment"}
                </p>
              </div>
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {style.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
