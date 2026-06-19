"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthGuard } from "../../hooks/Useauthguard ";
import Sidebar from "../sidebar";

const WASTE_TYPES = ["General", "Mixed", "Metal", "Concrete", "Green", "Hazardous"];

export default function CreateRequestPage() {
  const { user, profile, loading: guardLoading } = useAuthGuard("kyc-complete");

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    wasteType: "General",
    location: "",
    dateFrom: "",
    dateTo: "",
    weight: "",
    weightUnit: "kg",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.title.trim()) {
      setSubmitError("Please enter a title for your request");
      return;
    }
    if (!formData.location.trim()) {
      setSubmitError("Please enter a location");
      return;
    }
    if (!formData.dateFrom) {
      setSubmitError("Please select a pickup date");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await addDoc(collection(db, "wasteRequests"), {
        title: formData.title.trim(),
        wasteType: formData.wasteType,
        status: "pending",
        location: formData.location.trim(),
        windowStart: formData.dateFrom || null,
        windowEnd: formData.dateTo || null,
        quantity: formData.weight ? `${formData.weight} ${formData.weightUnit}` : "",
        notes: formData.notes.trim() || "",
        contractorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitSuccess(true);
      setFormData({
        title: "",
        wasteType: "General",
        location: "",
        dateFrom: "",
        dateTo: "",
        weight: "",
        weightUnit: "kg",
        notes: "",
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to create request:", err);
      setSubmitError("Couldn't submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (guardLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5faf6" }}>
        <style>{`@keyframes wfSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2.5" style={{ width: 28, height: 28, animation: "wfSpin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cr-root {
          display: flex; min-height: 100vh;
          background: #f5faf6;
          font-family: 'Quicksand', sans-serif;
        }

        .cr-main {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          height: 100vh; overflow-y: auto;
        }

        .cr-topbar {
          position: sticky; top: 0; z-index: 10;
          background: rgba(245,250,246,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e8f2eb;
          padding: 0 28px; height: 60px;
          display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }
        .cr-topbar-left { display: flex; align-items: center; gap: 14px; }
        .cr-topbar-title {
          font-size: 1rem; font-weight: 700;
          color: #1a2e1f; font-family: 'Quicksand', sans-serif;
        }
        .cr-topbar-right { display: flex; align-items: center; gap: 10px; }

        .cr-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: #1a4d2e; padding: 6px; border-radius: 8px;
          align-items: center; justify-content: center;
          transition: background 0.18s;
        }
        .cr-hamburger:hover { background: rgba(184,213,46,0.12); }

        .cr-content {
          padding: 28px;
          display: flex; flex-direction: column; gap: 24px;
          max-width: 800px; width: 100%;
          margin: 0 auto;
        }

        .cr-page-header h1 {
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          font-weight: 800; color: #1a2e1f;
          letter-spacing: -0.02em;
          font-family: 'Quicksand', sans-serif;
          margin-bottom: 4px;
        }
        .cr-page-header p {
          font-size: 0.875rem; color: #6b8f7a;
          font-weight: 600; font-family: 'Quicksand', sans-serif;
        }

        .cr-form-card {
          background: #ffffff;
          border: 1px solid #e8f2eb;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }

        .cr-form-group {
          margin-bottom: 20px;
        }
        .cr-form-group:last-of-type {
          margin-bottom: 28px;
        }

        .cr-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
          margin-bottom: 6px;
        }
        .cr-label-required {
          color: #ef4444;
          margin-left: 2px;
        }

        .cr-input,
        .cr-select,
        .cr-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e8f2eb;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a2e1f;
          font-family: 'Quicksand', sans-serif;
          background: #ffffff;
          outline: none;
          transition: border 0.18s, box-shadow 0.18s;
        }
        .cr-input:focus,
        .cr-select:focus,
        .cr-textarea:focus {
          border-color: #B8D52E;
          box-shadow: 0 0 0 3px rgba(184,213,46,0.12);
        }
        .cr-input::placeholder,
        .cr-textarea::placeholder {
          color: #9ab8a5;
          font-weight: 500;
        }
        .cr-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .cr-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .cr-weight-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: start;
        }
        .cr-weight-input {
          flex: 1;
        }
        .cr-weight-unit {
          width: 100px;
          flex-shrink: 0;
        }

        .cr-error {
          background: #fff5f5;
          border: 1px solid #f5c6c6;
          border-radius: 10px;
          padding: 11px 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 16px;
        }
        .cr-error p {
          font-size: 0.78rem;
          color: #c0392b;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          margin: 0;
          line-height: 1.5;
        }

        .cr-success {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 10px;
          padding: 11px 14px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 16px;
        }
        .cr-success p {
          font-size: 0.78rem;
          color: #166534;
          font-weight: 600;
          font-family: 'Quicksand', sans-serif;
          margin: 0;
          line-height: 1.5;
        }

        .cr-submit-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: #1a4d2e;
          border: none;
          cursor: pointer;
          color: #B8D52E;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          transition: background 0.18s, transform 0.15s;
        }
        .cr-submit-btn:hover:not(:disabled) {
          background: #B8D52E;
          color: #0d2416;
          transform: translateY(-1px);
        }
        .cr-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cr-notif-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: #ffffff; border: 1px solid #e8f2eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4a7a5a; position: relative;
          transition: border 0.18s, color 0.18s;
        }
        .cr-notif-btn:hover { border-color: #B8D52E; color: #1a4d2e; }
        .cr-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #B8D52E; border: 1.5px solid #f5faf6;
        }

        @media (max-width: 768px) {
          .cr-hamburger { display: flex; }
          .cr-topbar { padding: 0 16px; }
          .cr-content { padding: 16px; }
          .cr-form-card { padding: 20px; }
          .cr-row { grid-template-columns: 1fr; }
          .cr-weight-row { grid-template-columns: 1fr; }
          .cr-weight-unit { width: 100%; }
        }
        @media (max-width: 480px) {
          .cr-topbar-date { display: none; }
        }
      `}</style>

      <div className="cr-root">
        <Sidebar
          adminEmail={profile?.email || ""}
          adminName={profile?.fullName || "User"}
          onSignOut={() => { window.location.href = "/login"; }}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="cr-main">
          <div className="cr-topbar">
            <div className="cr-topbar-left">
              <button
                className="cr-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="cr-topbar-title">Create Request</span>
            </div>
            <div className="cr-topbar-right">
              <span
                className="cr-topbar-date"
                style={{
                  fontSize: "0.75rem", color: "#8aab97",
                  fontWeight: 600, fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "short", day: "numeric",
                  month: "short", year: "numeric",
                })}
              </span>
              <button className="cr-notif-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="cr-notif-dot" />
              </button>
            </div>
          </div>

          <div className="cr-content">
            <div className="cr-page-header">
              <h1>Create New Request</h1>
              <p>Submit a new waste pickup request</p>
            </div>

            <div className="cr-form-card">
              <form onSubmit={handleSubmit}>
                {submitError && (
                  <div className="cr-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>{submitError}</p>
                  </div>
                )}

                {submitSuccess && (
                  <div className="cr-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p>Request submitted successfully!</p>
                  </div>
                )}

                <div className="cr-form-group">
                  <label className="cr-label">
                    Request Title <span className="cr-label-required">*</span>
                  </label>
                  <input
                    className="cr-input"
                    type="text"
                    name="title"
                    placeholder="e.g., Office Waste Collection"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cr-form-group">
                  <label className="cr-label">
                    Waste Type <span className="cr-label-required">*</span>
                  </label>
                  <select
                    className="cr-select"
                    name="wasteType"
                    value={formData.wasteType}
                    onChange={handleChange}
                    required
                  >
                    {WASTE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="cr-form-group">
                  <label className="cr-label">
                    Location <span className="cr-label-required">*</span>
                  </label>
                  <input
                    className="cr-input"
                    type="text"
                    name="location"
                    placeholder="e.g., 123 Main St, City"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cr-row">
                  <div className="cr-form-group">
                    <label className="cr-label">
                      Pickup Date From <span className="cr-label-required">*</span>
                    </label>
                    <input
                      className="cr-input"
                      type="date"
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="cr-form-group">
                    <label className="cr-label">Pickup Date To</label>
                    <input
                      className="cr-input"
                      type="date"
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="cr-form-group">
                  <label className="cr-label">Quantity</label>
                  <div className="cr-weight-row">
                    <div className="cr-weight-input">
                      <input
                        className="cr-input"
                        type="number"
                        name="weight"
                        placeholder="Enter amount"
                        value={formData.weight}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="cr-weight-unit">
                      <select
                        className="cr-select"
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleChange}
                      >
                        <option value="kg">kg</option>
                        <option value="tonnes">tonnes</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cr-form-group">
                  <label className="cr-label">Additional Notes</label>
                  <textarea
                    className="cr-textarea"
                    name="notes"
                    placeholder="Any special instructions or additional information..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="cr-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18, animation: "wfSpin 0.8s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                      </svg>
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}