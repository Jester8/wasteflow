"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "All Requests",
    href: "/admin/requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    label: "My Pickups",
    href: "/admin/pickups",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8l5 3-5 3V8z" />
        <path d="M5 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" />
        <path d="M13 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/admin/history",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
];

export default function Sidebar({ adminEmail = "admin@wasteflow.org", onSignOut }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');

        .wf-sidebar {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: ${collapsed ? "72px" : "240px"};
          flex-shrink: 0;
          background: #0d2416;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          font-family: 'Quicksand', sans-serif;
          border-right: 1px solid rgba(184,213,46,0.1);
        }

        /* soft radial lime glow */
        .wf-sidebar::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -60px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,213,46,0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* secondary glow bottom right */
        .wf-sidebar::after {
          content: '';
          position: absolute;
          bottom: 80px;
          right: -80px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,213,46,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .wf-sidebar-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${collapsed ? "14px 0" : "16px 18px"};
          border-bottom: 1px solid rgba(255,255,255,0.05);
          min-height: ${collapsed ? "76px" : "110px"};
          transition: padding 0.28s, min-height 0.28s;
        }

        .wf-logo-wrap {
          display: flex;
          align-items: center;
          overflow: hidden;
          flex-shrink: 0;
          ${collapsed ? "width: 100%; justify-content: center;" : ""}
        }

        .wf-logo-img {
          width: ${collapsed ? "44px" : "192px"};
          height: ${collapsed ? "44px" : "78px"};
          object-fit: contain;
          flex-shrink: 0;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1), height 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        .wf-collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #4a7a5a;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.18s, background 0.18s;
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          pointer-events: ${collapsed ? "none" : "auto"};
        }
        .wf-collapse-btn:hover { color: #B8D52E; background: rgba(184,213,46,0.08); }

        /* nav */
        .wf-nav {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .wf-nav-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px ${collapsed ? "0" : "12px"};
          border-radius: 10px;
          text-decoration: none;
          color: #6aaa7a;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          white-space: nowrap;
          transition: background 0.18s, color 0.18s, padding 0.28s;
          position: relative;
          justify-content: ${collapsed ? "center" : "flex-start"};
        }

        .wf-nav-link:hover {
          background: rgba(184,213,46,0.08);
          color: #c8e860;
        }

        .wf-nav-link.active {
          background: #B8D52E;
          color: #0d2416;
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(184,213,46,0.3);
        }

        .wf-nav-link.active svg {
          stroke: #0d2416;
        }

        .wf-nav-label {
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          transition: opacity 0.18s, width 0.28s;
        }

        /* active indicator dot when collapsed */
        .wf-nav-link.active .wf-active-dot {
          display: ${collapsed ? "block" : "none"};
          position: absolute;
          top: 6px;
          right: 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #B8D52E;
        }

        /* footer */
        .wf-sidebar-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: ${collapsed ? "16px 0" : "16px 14px"};
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: padding 0.28s;
        }

        .wf-footer-user {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          ${collapsed ? "justify-content: center;" : ""}
        }

        .wf-footer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(184,213,46,0.12);
          border: 1.5px solid rgba(184,213,46,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #B8D52E;
        }

        .wf-footer-email {
          font-size: 0.72rem;
          font-weight: 600;
          color: #4a7a5a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          transition: opacity 0.18s, width 0.28s;
          font-family: 'Quicksand', sans-serif;
        }

        .wf-signout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px ${collapsed ? "0" : "12px"};
          border-radius: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #4a6655;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          width: 100%;
          transition: background 0.18s, color 0.18s;
          white-space: nowrap;
          justify-content: ${collapsed ? "center" : "flex-start"};
        }
        .wf-signout-btn:hover {
          background: rgba(224,92,92,0.08);
          color: #e05c5c;
        }

        .wf-signout-label {
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          transition: opacity 0.18s, width 0.28s;
        }

        /* collapsed expand trigger */
        .wf-expand-btn {
          position: absolute;
          bottom: 50%;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1a4d2e;
          border: 1.5px solid rgba(184,213,46,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #B8D52E;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: background 0.18s;
          opacity: ${collapsed ? 1 : 0};
          pointer-events: ${collapsed ? "auto" : "none"};
          transition: opacity 0.2s, background 0.18s;
        }
        .wf-expand-btn:hover { background: #B8D52E; color: #0d2416; }
      `}</style>

      <aside className="wf-sidebar">

        {/* Expand button (visible when collapsed) */}
        <button className="wf-expand-btn" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Top: logo + collapse */}
        <div className="wf-sidebar-top">
          <div className="wf-logo-wrap">
            <Image
              src="/logo.png"
              alt="WasteFlow"
              width={192}
              height={78}
              className="wf-logo-img"
              style={{ objectFit: "contain" }}
            />
          </div>
          <button
            className="wf-collapse-btn"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="wf-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`wf-nav-link${isActive ? " active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                <span className="wf-nav-label">{item.label}</span>
                <span className="wf-active-dot" />
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="wf-sidebar-footer">
          <div className="wf-footer-user">
            <div className="wf-footer-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="wf-footer-email" title={adminEmail}>{adminEmail}</span>
          </div>

          <button
            className="wf-signout-btn"
            onClick={onSignOut}
            title={collapsed ? "Sign out" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="wf-signout-label">Sign out</span>
          </button>
        </div>

      </aside>
    </>
  );
}