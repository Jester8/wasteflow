"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

const REQUEST_STATUS_CONFIG: { key: string; label: string; bg: string; color: string }[] = [
  { key: "pending",             label: "Pending",     bg: "rgba(251,191,36,0.12)", color: "#b45309" },
  { key: "scheduled",           label: "Scheduled",   bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
  { key: "arriving",            label: "Arriving",    bg: "rgba(34,211,238,0.10)", color: "#0e7490" },
  { key: "in_transit",          label: "In Transit",  bg: "rgba(168,85,247,0.10)", color: "#7c3aed" },
  { key: "completed",           label: "Completed",   bg: "rgba(184,213,46,0.14)", color: "#3a6b00" },
  { key: "declined",            label: "Declined",    bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
  { key: "awaiting_reschedule", label: "Rescheduled",  bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
];

const LOG_TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  user_signup:   { bg: "rgba(59,130,246,0.10)", color: "#1d4ed8" },
  login:         { bg: "rgba(100,116,139,0.10)", color: "#475569" },
  status_change: { bg: "rgba(184,213,46,0.14)", color: "#3a6b00" },
  admin_action:  { bg: "rgba(168,85,247,0.10)", color: "#7c3aed" },
};

interface LogEntry {
  id: string;
  type: string;
  message: string;
  actorEmail: string | null;
  createdAt: any;
}

function formatDateTime(ts: any): string {
  if (!ts?.seconds) return "—";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

function StatCard({ label, value, href, loading }: { label: string; value: number; href: string; loading: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 16,
        padding: 24, minWidth: 200, boxShadow: SHADOW_SM, transition: "box-shadow 0.15s",
      }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a2e1f", margin: "6px 0 0" }}>
          {loading ? "—" : value.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

function RequestStatusCard({ label, value, bg, color, loading }: { label: string; value: number; bg: string; color: string; loading: boolean }) {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
      padding: "16px 18px", minWidth: 140, flex: "1 1 140px", boxShadow: SHADOW_SM,
    }}>
      <span style={{
        display: "inline-block", fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px",
        borderRadius: 999, background: bg, color, textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        {label}
      </span>
      <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: "8px 0 0" }}>
        {loading ? "—" : value.toLocaleString()}
      </p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [accountCounts, setAccountCounts] = useState({ operators: 0, contractors: 0 });
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    async function loadAccountCounts() {
      try {
        const [operatorsSnap, contractorsSnap] = await Promise.all([
          getCountFromServer(query(collection(db, "users"), where("role", "==", "operator"))),
          getCountFromServer(query(collection(db, "users"), where("role", "==", "contractor"))),
        ]);
        setAccountCounts({
          operators: operatorsSnap.data().count,
          contractors: contractorsSnap.data().count,
        });
      } catch (err) {
        console.error("[SuperAdminDashboard] Failed to load account counts:", err);
      } finally {
        setAccountsLoading(false);
      }
    }
    loadAccountCounts();
  }, []);

  useEffect(() => {
    async function loadRequestCounts() {
      try {
        const entries = await Promise.all(
          REQUEST_STATUS_CONFIG.map(async ({ key }) => {
            const snap = await getCountFromServer(
              query(collection(db, "wasteRequests"), where("status", "==", key))
            );
            return [key, snap.data().count] as const;
          })
        );
        setRequestCounts(Object.fromEntries(entries));
      } catch (err) {
        console.error("[SuperAdminDashboard] Failed to load request counts:", err);
      } finally {
        setRequestsLoading(false);
      }
    }
    loadRequestCounts();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "adminLogs"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRecentLogs(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              type: data.type || "—",
              message: data.message || "—",
              actorEmail: data.actorEmail || null,
              createdAt: data.createdAt,
            };
          })
        );
        setLogsLoading(false);
      },
      (err) => {
        console.error("[SuperAdminDashboard] Failed to load recent activity:", err);
        setLogsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Overview</h1>
      <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 28px" }}>
        Platform-wide account and pickup totals.
      </p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Operators" value={accountCounts.operators} href="/superadmin/operators" loading={accountsLoading} />
        <StatCard label="Contractors" value={accountCounts.contractors} href="/superadmin/contractors" loading={accountsLoading} />
      </div>

      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
        Pickup Requests by Status
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
        {REQUEST_STATUS_CONFIG.map((s) => (
          <RequestStatusCard
            key={s.key}
            label={s.label}
            value={requestCounts[s.key] || 0}
            bg={s.bg}
            color={s.color}
            loading={requestsLoading}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          Recent Activity
        </p>
        <Link href="/superadmin/logs" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a4d2e", textDecoration: "none" }}>
          View full log →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recentLogs.map((log) => {
          const style = LOG_TYPE_COLOR[log.type] || { bg: "#f0f7f2", color: "#4a7a5a" };
          return (
            <div key={log.id} style={{
              background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 12,
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
              boxShadow: SHADOW_SM,
            }}>
              <span style={{
                fontSize: "0.62rem", fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                background: style.bg, color: style.color, textTransform: "uppercase",
                letterSpacing: "0.04em", flexShrink: 0,
              }}>
                {log.type.replace("_", " ")}
              </span>
              <p style={{ flex: 1, minWidth: 0, fontSize: "0.82rem", fontWeight: 600, color: "#1a2e1f", margin: 0 }}>
                {log.message}
              </p>
              <span style={{ fontSize: "0.7rem", color: "#9ab8a5", flexShrink: 0, whiteSpace: "nowrap" }}>
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          );
        })}
        {!logsLoading && recentLogs.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "#9ab8a5", fontSize: "0.85rem" }}>
            No activity yet.
          </div>
        )}
      </div>
    </div>
  );
}
