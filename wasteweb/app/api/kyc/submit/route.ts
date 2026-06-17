// app/api/kyc/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { uid, kycData } = await req.json();

    if (!uid || !kycData) {
      return NextResponse.json({ error: "Missing uid or kycData" }, { status: 400 });
    }

    // Write KYC payload to /kyc/{uid}
    await adminDb.doc(`kyc/${uid}`).set({
      ...kycData,
      uid,
      submittedAt: FieldValue.serverTimestamp(),
    });

    // Set kycStatus on /users/{uid} — Admin SDK bypasses Firestore rules
    await adminDb.doc(`users/${uid}`).update({
      kycStatus: "submitted",
      kycSubmittedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KYC submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}