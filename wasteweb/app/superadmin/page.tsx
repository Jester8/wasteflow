"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSuperAdminData } from "./lib/useSuperAdminData";
import { STATUS_STYLE, formatDate } from "./lib/constants";
import FleetLiveMap from "./components/FleetLiveMap";

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

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

function KpiCard({ label, value, sub, href }: { label: string; value: string | number; sub?: string; href?: string }) {
  const content = (
    <div style={{
      background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
      padding: "18px 20px", boxShadow: SHADOW_SM, minWidth: 0, height: "100%", boxSizing: "border-box",
    }}>
      <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a2e1f", margin: "6px 0 0", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "0.7rem", color: "#6b8f7a", fontWeight: 600, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}

function BarList({ title, rows, emptyLabel }: { title: string; rows: { label: string; value: number; color?: string }[]; emptyLabel: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 20, boxShadow: SHADOW_SM }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", margin: "0 0 16px" }}>{title}</p>
      {rows.length === 0 ? (
        <p style={{ fontSize: "0.8rem", color: "#9ab8a5", margin: 0 }}>{emptyLabel}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r) => (
            <div key={r.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#3a5a45", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1a2e1f", flexShrink: 0 }}>{r.value}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#f0f7f2", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${(r.value / max) * 100}%`,
                  background: r.color || "#1a4d2e", borderRadius: 999,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendChart({ days }: { days: { label: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14, padding: 20, boxShadow: SHADOW_SM }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", margin: "0 0 16px" }}>Platform requests — last 7 days</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {days.map((d) => (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{
              width: "100%", maxWidth: 28, height: `${(d.count / max) * 90}px`, minHeight: d.count > 0 ? 4 : 0,
              background: "#B8D52E", borderRadius: "4px 4px 0 0",
            }} />
            <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#9ab8a5" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
      {children}
    </p>
  );
}

export default function SuperAdminDashboard() {
  const {
    operatorAdmins, contractorAdmins, drivers, contractors,
    fleetSizeByAdmin, contractorCountByAdmin,
    statusCounts, trendDays, liveJobs, loading,
  } = useSuperAdminData();

  const [focusId, setFocusId] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

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
              type: data.type || "N/A",
              message: data.message || "N/A",
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

  const statusRows = useMemo(() =>
    Object.entries(statusCounts).map(([status, value]) => ({
      label: STATUS_STYLE[status]?.label || status,
      value,
      color: STATUS_STYLE[status]?.color,
    })),
  [statusCounts]);

  const topOperatorAdmins = useMemo(() =>
    operatorAdmins
      .map((a) => ({ label: a.fullName, value: fleetSizeByAdmin[a.id] || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
  [operatorAdmins, fleetSizeByAdmin]);

  const topContractorAdmins = useMemo(() =>
    contractorAdmins
      .map((a) => ({ label: a.fullName, value: contractorCountByAdmin[a.id] || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
  [contractorAdmins, contractorCountByAdmin]);

  const activeCount = (statusCounts.pending || 0) + (statusCounts.scheduled || 0) +
    (statusCounts.arriving || 0) + (statusCounts.in_transit || 0) + (statusCounts.awaiting_reschedule || 0);
  const completedCount = statusCounts.completed || 0;

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Platform Overview</h1>
      <p style={{ fontSize: "0.88rem", color: "#6b8f7a", margin: "4px 0 24px" }}>
        Live, platform-wide view across every operator company, contractor company, and their teams.
      </p>

      <div style={{
        display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 28,
      }}>
        <KpiCard label="Operator Admins" value={loading ? "—" : operatorAdmins.length} href="/superadmin/operator-admins" sub="Companies" />
        <KpiCard label="Fleet Drivers" value={loading ? "—" : drivers.length} href="/superadmin/operators" sub="Under all operators" />
        <KpiCard label="Contractor Admins" value={loading ? "—" : contractorAdmins.length} href="/superadmin/contractor-admins" sub="Companies" />
        <KpiCard label="Site Contractors" value={loading ? "—" : contractors.length} href="/superadmin/contractors" sub="Under all contractors" />
        <KpiCard label="Active Jobs" value={loading ? "—" : activeCount} sub="Pending through in transit" />
        <KpiCard label="Completed" value={loading ? "—" : completedCount} sub="All time" />
      </div>

      <SectionLabel>Live Fleet Map</SectionLabel>
      <div className="sa-live-grid" style={{
        display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 2fr) minmax(220px, 1fr)", marginBottom: 28,
      }}>
        <FleetLiveMap jobs={liveJobs} focusId={focusId} height={420} />
        <div style={{
          background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
          boxShadow: SHADOW_SM, padding: 14, maxHeight: 420, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
            {liveJobs.length} job{liveJobs.length === 1 ? "" : "s"} in transit
          </p>
          {liveJobs.length === 0 && (
            <p style={{ fontSize: "0.8rem", color: "#9ab8a5", margin: 0 }}>Nothing moving right now.</p>
          )}
          {liveJobs.map((job) => {
            const style = STATUS_STYLE[job.status] || STATUS_STYLE.pending;
            return (
              <button
                key={job.id}
                onClick={() => setFocusId(job.id)}
                style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: focusId === job.id ? "1.5px solid #1a4d2e" : "1px solid #e8f2eb",
                  background: focusId === job.id ? "#f0f7f2" : "#fff",
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a2e1f", margin: 0 }}>{job.operatorName}</p>
                <p style={{ fontSize: "0.72rem", color: "#8aab97", margin: "2px 0 6px" }}>{job.contractorName} · {job.title}</p>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                  background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 20 }}>
        <TrendChart days={trendDays} />
        <BarList title="Requests by status" rows={statusRows} emptyLabel="No requests yet." />
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 28 }}>
        <BarList title="Top Operator Admins by fleet size" rows={topOperatorAdmins} emptyLabel="No operator admins yet." />
        <BarList title="Top Contractor Admins by contractor count" rows={topContractorAdmins} emptyLabel="No contractor admins yet." />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <SectionLabel>Recent Activity</SectionLabel>
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
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
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
                {formatDate(log.createdAt)}
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

      <style>{`
        @media (max-width: 900px) {
          .sa-live-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
