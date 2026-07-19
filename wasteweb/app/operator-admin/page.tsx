"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logAdminEvent } from "../lib/adminLog";

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

const ACTIVE_STATUSES = ["pending", "scheduled", "arriving", "in_transit", "awaiting_reschedule"];

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
  location: string;
  status: string;
  assignedOperatorId?: string;
  createdAt: any;
}

interface OperatorRow {
  id: string;
  fullName: string;
  email: string;
  kycStatus: string;
  fleetSize?: number;
}

function AssignModal({
  request, operators, activeJobCounts, onClose,
}: {
  request: RequestRow;
  operators: OperatorRow[];
  activeJobCounts: Record<string, number>;
  onClose: () => void;
}) {
  const [assigning, setAssigning] = useState<string | null>(null);

  async function handleAssign(operatorId: string) {
    setAssigning(operatorId);
    try {
      await updateDoc(doc(db, "wasteRequests", request.id), {
        assignedOperatorId: operatorId,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      logAdminEvent({
        type: "admin_action",
        message: `Assigned request "${request.title}" to operator ${operatorId}`,
        targetId: request.id,
      });
      onClose();
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !assigning) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,22,13,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 480, background: "#ffffff", borderRadius: 16,
        padding: 24, fontFamily: "'Quicksand', sans-serif", boxShadow: "0 16px 48px rgba(0,0,0,0.24)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Assign Operator</p>
        <p style={{ fontSize: "0.8rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
          {request.title} · {request.contractorName} · {request.wasteType}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {operators.map((op) => (
            <div key={op.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "12px 16px", borderRadius: 12, border: "1px solid #e8f2eb",
            }}>
              <div>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{op.fullName}</p>
                <p style={{ fontSize: "0.76rem", color: "#8aab97", margin: "2px 0 0" }}>
                  Fleet size: {op.fleetSize ?? "—"} · Active jobs: {activeJobCounts[op.id] || 0}
                </p>
              </div>
              <button
                onClick={() => handleAssign(op.id)}
                disabled={assigning === op.id}
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "none",
                  background: "#1a4d2e", color: "#B8D52E", fontSize: "0.76rem", fontWeight: 700,
                  cursor: assigning === op.id ? "not-allowed" : "pointer", fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {assigning === op.id ? "Assigning…" : "Assign"}
              </button>
            </div>
          ))}
          {operators.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "#9ab8a5", textAlign: "center", padding: "20px 0" }}>
              No operator accounts yet.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          disabled={!!assigning}
          style={{
            width: "100%", marginTop: 20, padding: "10px 14px", borderRadius: 10,
            border: "1px solid #e8f2eb", background: "#fff", color: "#4a7a5a",
            fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Quicksand', sans-serif",
            cursor: assigning ? "not-allowed" : "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ManageOperatorsPanel({ operators, activeJobCounts }: { operators: OperatorRow[]; activeJobCounts: Record<string, number> }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSave(operatorId: string) {
    const raw = drafts[operatorId];
    const value = Number(raw);
    if (isNaN(value) || value < 0) return;
    setSaving(operatorId);
    try {
      await updateDoc(doc(db, "users", operatorId), { fleetSize: value });
      setDrafts((prev) => { const next = { ...prev }; delete next[operatorId]; return next; });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
      boxShadow: SHADOW_SM, overflowX: "auto", WebkitOverflowScrolling: "touch",
    }}>
      <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr style={{ background: "#f8fbf9", textAlign: "left" }}>
            {["Operator", "Active Jobs", "Fleet Size", ""].map((h, i) => (
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
          {operators.map((op) => {
            const draft = drafts[op.id];
            return (
              <tr key={op.id} style={{ borderBottom: "1px solid #f0f7f2" }}>
                <td style={{ padding: "10px 16px" }}>
                  <p style={{ fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{op.fullName}</p>
                  <p style={{ fontSize: "0.72rem", color: "#8aab97", margin: 0 }}>{op.email}</p>
                </td>
                <td style={{ padding: "10px 16px", color: "#4a7a5a" }}>{activeJobCounts[op.id] || 0}</td>
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="number"
                    min={0}
                    value={draft !== undefined ? draft : (op.fleetSize ?? "")}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [op.id]: e.target.value }))}
                    style={{
                      width: 90, padding: "6px 10px", borderRadius: 8,
                      border: "1px solid #e8f2eb", fontSize: "0.8rem", fontWeight: 600,
                      color: "#1a2e1f", fontFamily: "'Quicksand', sans-serif", outline: "none",
                    }}
                  />
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <button
                    onClick={() => handleSave(op.id)}
                    disabled={draft === undefined || saving === op.id}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: draft === undefined ? "#f0f7f2" : "#1a4d2e",
                      color: draft === undefined ? "#9ab8a5" : "#B8D52E",
                      fontSize: "0.76rem", fontWeight: 700, cursor: draft === undefined ? "default" : "pointer",
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  >
                    {saving === op.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            );
          })}
          {operators.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#9ab8a5" }}>
                No operator accounts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function OperatorAdminDashboard() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [operators, setOperators] = useState<OperatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"unassigned" | "all" | "operators">("unassigned");
  const [assigning, setAssigning] = useState<RequestRow | null>(null);

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
          location: data.location || "—",
          status: data.status || "pending",
          assignedOperatorId: data.assignedOperatorId,
          createdAt: data.createdAt,
        } as RequestRow;
      }));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "operator"));
    const unsub = onSnapshot(q, (snap) => {
      setOperators(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.fullName || "—",
          email: data.email || "—",
          kycStatus: data.kycStatus || "pending",
          fleetSize: data.fleetSize,
        } as OperatorRow;
      }));
    });
    return () => unsub();
  }, []);

  const activeJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      if (r.assignedOperatorId && ACTIVE_STATUSES.includes(r.status)) {
        counts[r.assignedOperatorId] = (counts[r.assignedOperatorId] || 0) + 1;
      }
    });
    return counts;
  }, [requests]);

  const unassigned = requests.filter((r) => r.status === "pending" && !r.assignedOperatorId);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Dispatch</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Assign incoming requests to a matching operator and track everything live.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "unassigned", label: `Unassigned (${unassigned.length})` },
          { key: "all", label: "All Requests" },
          { key: "operators", label: "Manage Operators" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding: "8px 16px", borderRadius: 99, fontSize: "0.82rem", fontWeight: 700,
              background: tab === t.key ? "#1a4d2e" : "#ffffff",
              color: tab === t.key ? "#B8D52E" : "#4a7a5a",
              border: tab === t.key ? "1px solid #1a4d2e" : "1px solid #e8f2eb",
              cursor: "pointer", fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading…</p>
      ) : tab === "operators" ? (
        <ManageOperatorsPanel operators={operators} activeJobCounts={activeJobCounts} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(tab === "unassigned" ? unassigned : requests).length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              background: "#ffffff", border: "1px dashed #c6e2d0", borderRadius: 16,
              color: "#9ab8a5", fontSize: "0.85rem",
            }}>
              {tab === "unassigned" ? "Nothing waiting on assignment." : "No requests yet."}
            </div>
          ) : (tab === "unassigned" ? unassigned : requests).map((r) => {
            const style = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} style={{
                background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
                padding: 16, boxShadow: SHADOW_SM,
                display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10,
              }}>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{r.title}</p>
                  <p style={{ fontSize: "0.76rem", color: "#6b8f7a", margin: "2px 0 0" }}>
                    {r.contractorName} · {r.wasteType} · {r.location} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    {style.label}
                  </span>
                  {r.status === "pending" && !r.assignedOperatorId && (
                    <button
                      onClick={() => setAssigning(r)}
                      style={{
                        padding: "7px 14px", borderRadius: 9, border: "none",
                        background: "#1a4d2e", color: "#B8D52E", fontSize: "0.76rem", fontWeight: 700,
                        cursor: "pointer", fontFamily: "'Quicksand', sans-serif",
                      }}
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assigning && (
        <AssignModal
          request={assigning}
          operators={operators}
          activeJobCounts={activeJobCounts}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  );
}
