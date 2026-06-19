import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { uid, kycData } = await req.json();

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Invalid uid" }, { status: 400 });
    }

    // 1. Verify the user document actually exists
    const userRef = adminDb.doc(`users/${uid}`);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check KYC hasn't already been submitted
    const kycRef = adminDb.doc(`kyc/${uid}`);
    const kycSnap = await kycRef.get();

    if (kycSnap.exists) {
      return NextResponse.json({ error: "KYC already submitted" }, { status: 409 });
    }

    // 3. Write KYC document
    await kycRef.set({
      ...kycData,
      uid,
      submittedAt: FieldValue.serverTimestamp(),
    });

    // 4. Update user's kycStatus to "pending" (awaiting admin review)
    // IMPORTANT: must be "pending" — that's what the frontend routing checks for
    await userRef.update({
      kycStatus: "pending",
      kycSubmittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[kyc/submit]", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}