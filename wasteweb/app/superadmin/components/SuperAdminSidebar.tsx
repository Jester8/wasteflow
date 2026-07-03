"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/superadmin", exact: true },
  { label: "Operators", href: "/superadmin/operators" },
  { label: "Contractors", href: "/superadmin/contractors" },
  { label: "Logs", href: "/superadmin/logs" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    await firebaseSignOut();
    router.replace("/superadmin");
  }

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#0d2416",
        boxShadow: "1px 0 2px rgba(16,24,18,0.06)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "#e8f5ee", margin: 0 }}>WasteFlow</p>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#B8D52E", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Super Admin
        </p>
      </div>

      <nav style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                color: active ? "#0d2416" : "#6aaa7a",
                background: active ? "#B8D52E" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4a7a5a", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile?.email}
        </p>
        <button
          onClick={handleSignOut}
          style={{
            width: "100%", padding: "9px 12px", borderRadius: 8,
            background: "none", border: "1px solid rgba(255,255,255,0.12)",
            color: "#e8f5ee", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif", cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
