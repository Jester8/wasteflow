"use client";

import { useMemo } from "react";
import { useOperatorAdminData } from "./lib/useOperatorAdminData";
import { STATUS_STYLE, ACTIVE_STATUSES } from "./lib/constants";

const SHADOW_SM = "0 1px 2px rgba(16,24,18,0.06)";

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e8f2eb", borderRadius: 14,
      padding: "18px 20px", boxShadow: SHADOW_SM, minWidth: 0,
    }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ab8a5", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "1.9rem", fontWeight: 800, color: "#1a2e1f", margin: "6px 0 0", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "0.72rem", color: "#6b8f7a", fontWeight: 600, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#3a5a45" }}>{r.label}</span>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#1a2e1f" }}>{r.value}</span>
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
      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2e1f", margin: "0 0 16px" }}>Requests — last 7 days</p>
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

export default function OperatorAdminOverview() {
  const { drivers, myFleetFeed, unassigned, activeJobCounts, myRegions, loading } = useOperatorAdminData();

  const statusRows = useMemo(() => {
    const counts: Record<string, number> = {};
    myFleetFeed.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      label: STATUS_STYLE[status]?.label || status,
      value,
      color: STATUS_STYLE[status]?.color,
    }));
  }, [myFleetFeed]);

  const driverLeaderboard = useMemo(() => {
    const completedCounts: Record<string, number> = {};
    myFleetFeed.forEach((r) => {
      if (r.status === "completed" && r.assignedOperatorId) {
        completedCounts[r.assignedOperatorId] = (completedCounts[r.assignedOperatorId] || 0) + 1;
      }
    });
    return drivers
      .map((d) => ({ label: d.fullName, value: completedCounts[d.id] || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [drivers, myFleetFeed]);

  const regionRows = useMemo(() => {
    const counts: Record<string, number> = {};
    [...myFleetFeed, ...unassigned].forEach((r) => {
      const region = r.region || "Unknown";
      counts[region] = (counts[region] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [myFleetFeed, unassigned]);

  const trendDays = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = myFleetFeed.filter((r) => {
        const ts = r.createdAt?.seconds ? r.createdAt.seconds * 1000 : null;
        return ts && ts >= d.getTime() && ts < next.getTime();
      }).length;
      days.push({ label: d.toLocaleDateString("en-GB", { weekday: "short" }), count });
    }
    return days;
  }, [myFleetFeed]);

  const completedCount = myFleetFeed.filter((r) => r.status === "completed").length;
  const activeCount = myFleetFeed.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const avgActivePerDriver = drivers.length > 0 ? (activeCount / drivers.length).toFixed(1) : "0";

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a2e1f", margin: 0 }}>Overview</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b8f7a", margin: "4px 0 20px" }}>
        Covering: {myRegions.length > 0 ? myRegions.join(", ") : "No regions set"}
      </p>

      {loading ? (
        <p style={{ color: "#9ab8a5", fontSize: "0.85rem" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            <KpiCard label="Fleet Size" value={drivers.length} sub={`Avg ${avgActivePerDriver} active jobs each`} />
            <KpiCard label="Unassigned" value={unassigned.length} sub="Matching your regions" />
            <KpiCard label="Active Jobs" value={activeCount} sub="Across your fleet" />
            <KpiCard label="Completed" value={completedCount} sub="All time" />
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <TrendChart days={trendDays} />
            <BarList title="Requests by status" rows={statusRows} emptyLabel="No requests assigned to your fleet yet." />
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <BarList title="Top drivers by completed jobs" rows={driverLeaderboard} emptyLabel="No completed jobs yet." />
            <BarList title="Requests by region" rows={regionRows} emptyLabel="No requests to show yet." />
          </div>
        </div>
      )}
    </div>
  );
}
