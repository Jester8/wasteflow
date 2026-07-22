import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, driverId, newPassword } = await req.json();

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
    if (callerRole !== "operatorAdmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!driverId || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Missing driver, or password under 8 characters" }, { status: 400 });
    }

    const driverSnap = await adminDb.doc(`users/${driverId}`).get();
    const driverData = driverSnap.data();
    if (!driverSnap.exists || driverData?.role !== "operator" || driverData?.operatorAdminId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminAuth.updateUser(driverId, { password: newPassword });

    await adminDb.doc(`users/${driverId}/private/creds`).set({
      password: newPassword,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[operator-admin/reset-driver-password]", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
