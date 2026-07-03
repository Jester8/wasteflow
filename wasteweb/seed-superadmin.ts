/**
 * WasteFlow — Super Admin Seed Script
 *
 * Creates a single Firebase Auth account (email/password) plus its matching
 * Firestore `users/{uid}` profile with role 'superadmin'. Super admin
 * accounts can never be created through the app's normal signup flow (the
 * Firestore rules only allow self-serve signup with role 'operator' or
 * 'contractor'), so this script is the only way to provision one.
 *
 * Usage:
 *   1. Edit SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD / SUPERADMIN_NAME below.
 *   2. Make sure ServiceAccountKey.json exists at the project root.
 *   3. Run:
 *        npx tsx seed-superadmin.ts
 *
 * ⚠️  Change the password immediately after first login, and never commit
 *     ServiceAccountKey.json.
 */

import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import serviceAccount from "./ServiceAccountKey.json";

const SUPERADMIN_EMAIL = "superadmin@wasteflow.co.uk";
const SUPERADMIN_PASSWORD = "ChangeMe123!";
const SUPERADMIN_NAME = "WasteFlow Super Admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const auth = admin.auth();
const db = getFirestore();

async function seedSuperAdmin() {
  let uid: string;

  try {
    const existing = await auth.getUserByEmail(SUPERADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Auth account already exists for ${SUPERADMIN_EMAIL} (uid: ${uid}) — reusing it.`);
  } catch {
    const created = await auth.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      displayName: SUPERADMIN_NAME,
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created Auth account for ${SUPERADMIN_EMAIL} (uid: ${uid}).`);
  }

  await db.doc(`users/${uid}`).set(
    {
      uid,
      fullName: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      role: "superadmin",
      accountStatus: "active",
      provider: "email",
      emailVerified: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("Firestore profile written with role 'superadmin'.");
  console.log(`\nSign in at /superadmin with:\n  email: ${SUPERADMIN_EMAIL}\n  password: ${SUPERADMIN_PASSWORD}`);
}

seedSuperAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed super admin:", err);
    process.exit(1);
  });
