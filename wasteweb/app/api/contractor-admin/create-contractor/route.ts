import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, fullName, email, password } = await req.json();

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

    if (!fullName || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Missing required fields, or password under 8 characters" }, { status: 400 });
    }

    const created = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: true,
    });

    await adminDb.doc(`users/${created.uid}`).set({
      uid: created.uid,
      fullName,
      email,
      role: "contractor",
      contractorAdminId: decoded.uid,
      kycStatus: "approved",
      accountStatus: "active",
      provider: "email",
      emailVerified: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, uid: created.uid });
  } catch (err: any) {
    console.error("[contractor-admin/create-contractor]", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
