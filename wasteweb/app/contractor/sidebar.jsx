"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Adjust path as needed

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/contractor",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Create Requests",
    href: "/contractor/requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    label: "My Requests",
    href: "/contractor/myrequests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8l5 3-5 3V8z" />
        <path d="M5 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" />
        <path d="M13 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/contractor/histories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
];

export default function Sidebar({
  onSignOut,
  collapsed,
  onCollapse,
  onExpand,
  isOpen,
  onClose,
}) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  // Get real user data from auth context
  const adminEmail = profile?.email || user?.email || "Operator@wasteflow.org";
  const adminName = profile?.fullName || user?.email?.split("@")[0] || "Operator";

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initial = adminName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#0d2416",
      fontFamily: "'Quicksand', sans-serif",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      width: "100%",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Glows */}
      <div style={{
        position: "absolute", top: -60, left: -60,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,213,46,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", bottom: 80, right: -80,
        width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,213,46,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Logo row ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex",
        alignItems: "center",
        height: 64,
        padding: collapsed ? "0" : "0 16px",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        {/* Logo */}
        {!collapsed ? (
          <Link href="/contractor" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/logo.png"
              alt="WasteFlow"
              width={120}
              height={36}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        ) : (
          <Link href="/contractor" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/logo.png"
              alt="WasteFlow"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        )}

        {/* Desktop: collapse/expand toggle */}
        <button
          onClick={collapsed ? onExpand : onCollapse}
          className="wf-icon-btn wf-desktop-toggle"
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

        {/* Mobile: close X */}
        <button
          onClick={onClose}
          className="wf-icon-btn wf-mobile-close"
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: "relative", zIndex: 1,
        flex: 1,
        padding: "12px",
        display: "flex", flexDirection: "column", gap: 2,
        overflowY: "auto", overflowX: "hidden",
      }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`wf-nav-link${active ? " wf-nav-active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                fontFamily: "'Quicksand', sans-serif",
                whiteSpace: "nowrap",
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? "#0d2416" : "#6aaa7a",
                background: active ? "#B8D52E" : "transparent",
                boxShadow: active ? "0 2px 10px rgba(184,213,46,0.25)" : "none",
                transition: "background 0.15s, color 0.15s",
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ color: "inherit", display: "flex", flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: collapsed ? 12 : "12px",
        display: "flex",
        justifyContent: collapsed ? "center" : "stretch",
        flexShrink: 0,
      }}>
        {!collapsed ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "8px",
            width: "100%",
          }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #4a9a5a, #B8D52E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0d2416" }}>
                {initial}
              </span>
            </div>
            {/* Name / email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "0.8rem", fontWeight: 700,
                color: "#e8f5ee", margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                fontFamily: "'Quicksand', sans-serif",
              }}>{adminName}</p>
              <p style={{
                fontSize: "0.68rem", color: "#4a7a5a", margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                fontFamily: "'Quicksand', sans-serif",
              }}>{adminEmail}</p>
            </div>
            {/* Sign out */}
            <button
              onClick={onSignOut}
              className="wf-signout-btn"
              title="Sign out"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 6, borderRadius: 8,
                color: "#4a7a5a", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "color 0.15s, background 0.15s",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onSignOut}
            className="wf-signout-btn"
            title="Sign out"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 8, borderRadius: 8,
              color: "#4a7a5a", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');

        .wf-icon-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px; color: #4a7a5a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: color 0.15s, background 0.15s;
        }
        .wf-icon-btn:hover { color: #B8D52E; background: rgba(184,213,46,0.08); }

        .wf-nav-link:hover {
          background: rgba(184,213,46,0.08) !important;
          color: #c8e860 !important;
        }
        .wf-nav-active:hover {
          background: #B8D52E !important;
          color: #0d2416 !important;
        }
        .wf-signout-btn:hover {
          color: #e05c5c !important;
          background: rgba(224,92,92,0.08) !important;
        }

        /* ── Desktop sidebar ── */
        .wf-desktop-sidebar {
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: visible;
        }

        /* ── Backdrop ── */
        .wf-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
          z-index: 299;
          transition: opacity 0.28s;
        }

        /* ── Mobile drawer ── */
        .wf-mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 256px; z-index: 300;
          border-right: 1px solid rgba(184,213,46,0.1);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        /* Breakpoint rules */
        @media (min-width: 1024px) {
          .wf-desktop-sidebar  { display: block; }
          .wf-mobile-drawer    { display: none !important; }
          .wf-backdrop         { display: none !important; }
          .wf-mobile-close     { display: none !important; }
          .wf-desktop-toggle   { display: flex !important; }
        }

        @media (max-width: 1023px) {
          .wf-desktop-sidebar  { display: none !important; }
          .wf-mobile-drawer    { display: block; }
          .wf-backdrop         { display: block; }
          .wf-desktop-toggle   { display: none !important; }
          .wf-mobile-close     { display: flex !important; }
        }
      `}</style>

      {/* Desktop sticky sidebar */}
      <div className="wf-desktop-sidebar" style={{ width: collapsed ? 64 : 256 }}>
        {sidebarContent}
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="wf-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className="wf-mobile-drawer"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {sidebarContent}
      </div>
    </>
  );
}