'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

export default function Newsletter() {
  const ref = useRef(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <>
      <style>{`
        @keyframes nlFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nlCheckPop {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }

        .nl-section {
          position: relative;
          padding: 80px 24px 96px;
          overflow: hidden;
          background: #f5faf6;
          font-family: 'DM Sans', sans-serif;
        }

        .nl-section::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 15% 50%, rgba(184,213,46,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, rgba(26,77,46,0.06) 0%, transparent 50%);
        }

        .nl-separator {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 24px;
        }
        .nl-separator-line {
          width: 100%;
          max-width: 1200px;
          height: 1px;
          background: linear-gradient(to right, transparent, #B8D52E, transparent);
          opacity: 0.35;
        }

        .nl-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(26,77,46,0.12);
          background: linear-gradient(135deg, #0d2416 0%, #0f2d1a 60%, #091a0f 100%);
          box-shadow: 0 4px 48px rgba(26,77,46,0.18), 0 1px 0 rgba(184,213,46,0.08) inset;
          animation: nlFadeUp 0.6s ease both;
        }

        /* subtle dot grid */
        .nl-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.025;
          background-image:
            radial-gradient(circle, #B8D52E 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .nl-inner {
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .nl-inner { flex-direction: row; }
        }

        /* ── IMAGE SIDE ── */
        .nl-image-wrap {
          position: relative;
          width: 100%;
          min-height: 220px;
          flex-shrink: 0;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .nl-image-wrap {
            width: 42%;
            min-height: 0;
          }
        }

        /* lime tint overlay on image */
        .nl-image-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            transparent 50%,
            rgba(9,26,15,0.85) 100%
          );
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .nl-image-wrap::after {
            background: linear-gradient(
              to bottom,
              transparent 40%,
              rgba(9,26,15,0.9) 100%
            );
          }
        }

        /* ── CONTENT SIDE ── */
        .nl-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 36px 32px 40px;
        }

        @media (min-width: 768px) {
          .nl-content { padding: 48px 48px 52px; }
        }

        .nl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid rgba(184,213,46,0.3);
          background: rgba(184,213,46,0.08);
          color: #B8D52E;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 18px;
          width: fit-content;
          font-family: 'DM Sans', sans-serif;
        }

        .nl-heading {
          font-size: clamp(1.5rem, 3.5vw, 2.2rem);
          font-weight: 700;
          color: #e8f5ee;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .nl-heading span {
          color: #B8D52E;
        }

        .nl-sub {
          color: #5a8a6a;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1.65;
          margin-bottom: 28px;
          max-width: 400px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── FORM ── */
        .nl-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 500px) {
          .nl-form { flex-direction: row; }
        }

        .nl-input-wrap {
          position: relative;
          flex: 1;
        }

        .nl-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #3d6b4d;
          pointer-events: none;
        }

        .nl-input {
          width: 100%;
          padding: 13px 14px 13px 38px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8f5ee;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .nl-input::placeholder { color: #3d6b4d; }

        .nl-input:focus {
          border-color: rgba(184,213,46,0.45);
          background: rgba(184,213,46,0.05);
          box-shadow: 0 0 0 3px rgba(184,213,46,0.1);
        }

        .nl-btn {
          flex-shrink: 0;
          padding: 13px 24px;
          border-radius: 12px;
          background: #B8D52E;
          color: #0d2416;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          justify-content: center;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: -0.01em;
        }

        .nl-btn:hover {
          background: #cbe83a;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(184,213,46,0.35);
        }

        .nl-btn:active { transform: scale(0.97); }

        .nl-privacy {
          margin-top: 12px;
          font-size: 0.68rem;
          color: #2e5c3e;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        .nl-privacy a {
          color: #4a8a5a;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nl-privacy a:hover { color: #B8D52E; }

        /* ── SUCCESS STATE ── */
        .nl-success {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid rgba(184,213,46,0.2);
          background: rgba(184,213,46,0.06);
          animation: nlCheckPop 0.4s ease both;
        }

        .nl-success-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(184,213,46,0.12);
          border: 1px solid rgba(184,213,46,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nl-success-title {
          color: #e8f5ee;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .nl-success-sub {
          color: #4a8a5a;
          font-size: 0.72rem;
          margin-top: 2px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        @media (max-width: 639px) {
          .nl-section { padding: 60px 20px 72px; }
        }
      `}</style>

      <div className="nl-separator">
        <div className="nl-separator-line" />
      </div>

      <section className="nl-section">
        <div className="nl-wrapper" ref={ref}>
          <div className="nl-inner">

            {/* ── IMAGE ── */}
            <div className="nl-image-wrap">
              <Image
                src="/truck2.png"
                alt="WasteFlow construction truck"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>

            {/* ── CONTENT ── */}
            <div className="nl-content">
              <div className="nl-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Stay Updated
              </div>

              <h2 className="nl-heading">
                Get waste logistics<br />
                <span>news that matters.</span>
              </h2>

              <p className="nl-sub">
                Industry updates, platform news, and smarter ways to manage construction waste — delivered straight to your inbox. No spam, ever.
              </p>

              {submitted ? (
                <div className="nl-success">
                  <div className="nl-success-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B8D52E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="nl-success-title">You're on the list!</div>
                    <div className="nl-success-sub">We'll keep you in the loop on everything WasteFlow.</div>
                  </div>
                </div>
              ) : (
                <>
                  <form className="nl-form" onSubmit={handleSubmit}>
                    <div className="nl-input-wrap">
                      <span className="nl-input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                        </svg>
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="nl-input"
                      />
                    </div>
                    <button type="submit" className="nl-btn">
                      Subscribe
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                      </svg>
                    </button>
                  </form>

                  <p className="nl-privacy">
                    By subscribing you agree to our{' '}
                    <a href="#">Privacy Policy</a>.{' '}
                    Unsubscribe anytime.
                  </p>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}