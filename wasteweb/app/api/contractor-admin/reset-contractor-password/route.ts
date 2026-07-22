import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, contractorId, newPassword } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const adminAuth = getAuth();
    const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const callerSnap = await adminDb.doc(`users/${decoded.uid}`).get();
    const callerRole = callerSnap.exists ? callerSnap.data()?.role : null;
    if (callerRole !== "contractorAdmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!contractorId || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Missing contractor, or password under 8 characters" }, { status: 400 });
    }

    const contractorSnap = await adminDb.doc(`users/${contractorId}`).get();
    const contractorData = contractorSnap.data();
    if (!contractorSnap.exists || contractorData?.role !== "contractor" || contractorData?.contractorAdminId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminAuth.updateUser(contractorId, { password: newPassword });

    await adminDb.doc(`users/${contractorId}/private/creds`).set({
      password: newPassword,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[contractor-admin/reset-contractor-password]", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
