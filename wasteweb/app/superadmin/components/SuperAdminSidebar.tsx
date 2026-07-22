"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/superadmin", exact: true },
  { label: "Operator Admins", href: "/superadmin/operator-admins" },
  { label: "Fleet Drivers", href: "/superadmin/operators" },
  { label: "Contractor Admins", href: "/superadmin/contractor-admins" },
  { label: "Site Contractors", href: "/superadmin/contractors" },
  { label: "Logs", href: "/superadmin/logs" },
];

interface SuperAdminSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminSidebar({
  collapsed,
  onCollapse,
  onExpand,
  isOpen,
  onClose,
}: SuperAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    await firebaseSignOut();
    router.replace("/superadmin");
  }

  const sidebarContent = (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "#0d2416", fontFamily: "'Quicksand', sans-serif",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", width: "100%", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", height: 64,
        padding: collapsed ? "0" : "0 16px",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        {!collapsed ? (
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#e8f5ee", margin: 0 }}>WasteFlow</p>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#B8D52E", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Super Admin
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#B8D52E", margin: 0 }}>SA</p>
        )}

        <button
          onClick={collapsed ? onExpand : onCollapse}
          className="sa-icon-btn sa-desktop-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>

        <button onClick={onClose} className="sa-icon-btn sa-mobile-close" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav style={{
        flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 2,
        overflowY: "auto", overflowX: "hidden",
      }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sa-nav-link${active ? " sa-nav-active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap",
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? "#0d2416" : "#6aaa7a",
                background: active ? "#B8D52E" : "transparent",
              }}
              title={collapsed ? item.label : undefined}
            >
              {!collapsed && <span>{item.label}</span>}
              {collapsed && <span>{item.label.charAt(0)}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: collapsed ? 12 : 16, flexShrink: 0,
      }}>
        {!collapsed ? (
          <>
            <p style={{
              fontSize: "0.72rem", fontWeight: 600, color: "#4a7a5a", margin: "0 0 8px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
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
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="sa-icon-btn"
            title="Sign out"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .sa-icon-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px; color: #4a7a5a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: color 0.15s, background 0.15s;
        }
        .sa-icon-btn:hover { color: #B8D52E; background: rgba(184,213,46,0.08); }

        .sa-nav-link:hover { background: rgba(184,213,46,0.08) !important; color: #c8e860 !important; }
        .sa-nav-active:hover { background: #B8D52E !important; color: #0d2416 !important; }

        .sa-desktop-sidebar {
          height: 100vh; position: sticky; top: 0; flex-shrink: 0;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        .sa-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px); z-index: 299; transition: opacity 0.28s;
        }

        .sa-mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 256px; z-index: 300;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        @media (min-width: 1024px) {
          .sa-desktop-sidebar { display: block; }
          .sa-mobile-drawer   { display: none !important; }
          .sa-backdrop        { display: none !important; }
          .sa-mobile-close    { display: none !important; }
          .sa-desktop-toggle  { display: flex !important; }
        }

        @media (max-width: 1023px) {
          .sa-desktop-sidebar { display: none !important; }
          .sa-mobile-drawer   { display: block; }
          .sa-backdrop        { display: block; }
          .sa-desktop-toggle  { display: none !important; }
          .sa-mobile-close    { display: flex !important; }
        }
      `}</style>

      <div className="sa-desktop-sidebar" style={{ width: collapsed ? 64 : 240 }}>
        {sidebarContent}
      </div>

      {isOpen && <div className="sa-backdrop" onClick={onClose} aria-hidden="true" />}

      <div
        className="sa-mobile-drawer"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
