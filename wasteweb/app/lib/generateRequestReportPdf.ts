import jsPDF from "jspdf";
import type { WasteTransferRecord } from "./wasteTransferReference";

export interface CompletedRequestReportData {
  id: string;
  wasteType: string;
  location: string;
  dates: string;
  availability: string;
  volume: string;
  note?: string;
  operatorName?: string;
  driverName?: string;
  createdAt?: string | null;
  scheduledAt?: string | null;
  arrivingAt?: string | null;
  inTransitAt?: string | null;
  completedAt?: string | null;
  proofPhotoUrl?: string;
  signatureUrl?: string;
  wasteTransferRecord?: WasteTransferRecord | null;
  defraSubmission?: {
    status: "submitted" | "skipped" | "failed";
    globalMovementId?: string;
    reason?: string;
    error?: string;
  } | null;
}

const BRAND_GREEN: [number, number, number] = [26, 77, 46];
const TEXT_DARK: [number, number, number] = [26, 46, 31];
const TEXT_MUTED: [number, number, number] = [120, 140, 130];
const LINE_COLOR: [number, number, number] = [232, 242, 235];

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function imageFormatFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);base64,/);
  const ext = (match?.[1] || "png").toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "JPEG";
  if (ext === "webp") return "WEBP";
  return "PNG";
}

export async function downloadCompletedRequestReport(item: CompletedRequestReportData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // Big letterhead-style logo at the top, its own line — sized off the
  // image's real aspect ratio so it never looks stretched, capped so an
  // unusually tall/square logo file can't blow out the page.
  const logoDataUrl = await loadImageAsDataUrl("/logo.png");
  if (logoDataUrl) {
    const props = doc.getImageProperties(logoDataUrl);
    const maxLogoWidth = 300;
    const maxLogoHeight = 110;
    let logoWidth = maxLogoWidth;
    let logoHeight = (props.height / props.width) * logoWidth;
    if (logoHeight > maxLogoHeight) {
      logoHeight = maxLogoHeight;
      logoWidth = (props.width / props.height) * logoHeight;
    }
    doc.addImage(logoDataUrl, imageFormatFromDataUrl(logoDataUrl), margin, y, logoWidth, logoHeight);
    y += logoHeight + 14;
  } else {
    // Fallback if the logo can't be fetched for any reason — never let a
    // missing asset block the report itself.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...BRAND_GREEN);
    doc.text("WasteFlow", margin, y + 10);
    y += 34;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Completed Pickup Report", margin, y);
  doc.setFontSize(9);
  doc.text(`Request #${item.id.slice(-6).toUpperCase()}`, pageWidth - margin, y, { align: "right" });
  y += 24;
  doc.setDrawColor(...LINE_COLOR);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  const detailRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label.toUpperCase(), margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_DARK);
    const lines = doc.splitTextToSize(value || "—", pageWidth - margin * 2);
    doc.text(lines, margin, y + 14);
    y += 20 + lines.length * 13;
  };

  detailRow("Waste Type", item.wasteType);
  detailRow("Pickup Location", item.location);
  detailRow("Pickup Window", `${item.dates} (${item.availability})`);
  detailRow("Estimated Volume", item.volume);
  if (item.note && item.note !== "—") detailRow("Notes", item.note);
  detailRow("Site Manager", item.operatorName || "N/A");
  detailRow("Operator", item.driverName || "N/A");

  y += 6;
  doc.setDrawColor(...LINE_COLOR);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Request Timeline", margin, y);
  y += 20;

  const timelineSteps = [
    { label: "Request submitted", ts: item.createdAt },
    { label: "Accepted by operator", ts: item.scheduledAt },
    { label: "Arriving at site", ts: item.arrivingAt },
    { label: "In transit", ts: item.inTransitAt },
    { label: "Completed by Operator", ts: item.completedAt },
  ];

  timelineSteps.forEach((step) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DARK);
    doc.text(step.label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(step.ts || "Not recorded", pageWidth - margin, y, { align: "right" });
    y += 18;
  });

  y += 16;

  if (item.proofPhotoUrl || item.signatureUrl) {
    doc.setDrawColor(...LINE_COLOR);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Completion Proof", margin, y);
    y += 16;

    const imgW = (pageWidth - margin * 2 - 20) / 2;
    const imgH = imgW * 0.75;
    let maxImgH = 0;

    const [photoData, signatureData] = await Promise.all([
      item.proofPhotoUrl ? loadImageAsDataUrl(item.proofPhotoUrl) : Promise.resolve(null),
      item.signatureUrl ? loadImageAsDataUrl(item.signatureUrl) : Promise.resolve(null),
    ]);

    if (photoData) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text("Photo Evidence", margin, y + 12);
      doc.addImage(photoData, imageFormatFromDataUrl(photoData), margin, y + 16, imgW, imgH);
      maxImgH = Math.max(maxImgH, imgH);
    }
    if (signatureData) {
      const sigX = margin + imgW + 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text("Manager's Signature", sigX, y + 12);
      doc.addImage(signatureData, imageFormatFromDataUrl(signatureData), sigX, y + 16, imgW, imgH);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`Operator: ${item.driverName || "N/A"}`, sigX, y + 16 + imgH + 12);
      maxImgH = Math.max(maxImgH, imgH + 14);
    }
    y += maxImgH + 30;
  }

  const wt = item.wasteTransferRecord;
  if (wt) {
    if (y > doc.internal.pageSize.getHeight() - 160) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(...LINE_COLOR);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Waste Transfer Details", margin, y);
    y += 20;

    detailRow("EWC Code", wt.ewcCode || "N/A");
    if (wt.wasteDescription) detailRow("Waste Description", wt.wasteDescription);
    detailRow("Physical Form", wt.physicalForm || "N/A");
    detailRow("Hazardous", wt.isHazardous ? "Yes" : "No");
    detailRow("Weight", `${wt.weightAmount || "N/A"} ${wt.weightUnit || ""}${wt.weightEstimated ? " (estimated)" : ""}`.trim());
    detailRow("Carrier", `${wt.carrierName || "N/A"}${wt.vehicleRegistration ? ` (${wt.vehicleRegistration})` : ""}`);
    if (wt.receivingSiteName || wt.receivingSiteAddress) {
      detailRow("Receiving Site", [wt.receivingSiteName, wt.receivingSiteAddress, wt.receivingSitePostcode].filter(Boolean).join(", ") || "N/A");
    }
    if (wt.receivingSiteAuthNumber) detailRow("Site Authorisation Number", wt.receivingSiteAuthNumber);

    const defra = item.defraSubmission;
    if (defra) {
      const defraValue =
        defra.status === "submitted" ? `Reported (Movement ID: ${defra.globalMovementId})`
        : defra.status === "failed" ? `Failed — ${defra.error}`
        : `Not reported — ${defra.reason}`;
      detailRow("DEFRA Digital Waste Tracking", defraValue);
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-GB")}`,
    margin,
    doc.internal.pageSize.getHeight() - 24
  );

  doc.save(`wasteflow-report-${item.id.slice(-6).toUpperCase()}.pdf`);
}
