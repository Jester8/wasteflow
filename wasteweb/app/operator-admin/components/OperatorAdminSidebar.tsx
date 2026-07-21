"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "@/lib/auth";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Overview", href: "/operator-admin", exact: true, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
  ) },
  { label: "Dispatch", href: "/operator-admin/dispatch", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="1" y="3" width="15" height="13" rx="1" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
  ) },
  { label: "My Fleet", href: "/operator-admin/fleet", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ) },
  { label: "Price List", href: "/operator-admin/pricing", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  ) },
];

interface OperatorAdminSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function OperatorAdminSidebar({
  collapsed,
  onCollapse,
  onExpand,
  isOpen,
  onClose,
}: OperatorAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    await firebaseSignOut();
    router.replace("/login");
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
              Operator Admin
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#B8D52E", margin: 0 }}>OA</p>
        )}

        <button
          onClick={collapsed ? onExpand : onCollapse}
          className="oa-icon-btn oa-desktop-toggle"
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

        <button onClick={onClose} className="oa-icon-btn oa-mobile-close" aria-label="Close menu">
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
              className={`oa-nav-link${active ? " oa-nav-active" : ""}`}
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
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
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
            className="oa-icon-btn"
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
        .oa-icon-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px; color: #4a7a5a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: color 0.15s, background 0.15s;
        }
        .oa-icon-btn:hover { color: #B8D52E; background: rgba(184,213,46,0.08); }

        .oa-nav-link:hover { background: rgba(184,213,46,0.08) !important; color: #c8e860 !important; }
        .oa-nav-active:hover { background: #B8D52E !important; color: #0d2416 !important; }

        .oa-desktop-sidebar {
          height: 100vh; position: sticky; top: 0; flex-shrink: 0;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        .oa-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px); z-index: 299; transition: opacity 0.28s;
        }

        .oa-mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; width: 256px; z-index: 300;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        @media (min-width: 1024px) {
          .oa-desktop-sidebar { display: block; }
          .oa-mobile-drawer   { display: none !important; }
          .oa-backdrop        { display: none !important; }
          .oa-mobile-close    { display: none !important; }
          .oa-desktop-toggle  { display: flex !important; }
        }

        @media (max-width: 1023px) {
          .oa-desktop-sidebar { display: none !important; }
          .oa-mobile-drawer   { display: block; }
          .oa-backdrop        { display: block; }
          .oa-desktop-toggle  { display: none !important; }
          .oa-mobile-close    { display: flex !important; }
        }
      `}</style>

      <div className="oa-desktop-sidebar" style={{ width: collapsed ? 64 : 240 }}>
        {sidebarContent}
      </div>

      {isOpen && <div className="oa-backdrop" onClick={onClose} aria-hidden="true" />}

      <div
        className="oa-mobile-drawer"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
