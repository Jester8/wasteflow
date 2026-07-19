/**
 * WasteFlow — Operator Admin Seed Script
 *
 * Creates a single Firebase Auth account (email/password) plus its matching
 * Firestore `users/{uid}` profile with role 'operatorAdmin'. This role can
 * never be created through the app's normal signup flow (the Firestore rules
 * only allow self-serve signup with role 'operator' or 'contractor'), so this
 * script is the only way to provision one.
 *
 * Usage:
 *   1. Edit OPERATOR_ADMIN_EMAIL / OPERATOR_ADMIN_PASSWORD / OPERATOR_ADMIN_NAME below.
 *   2. Make sure ServiceAccountKey.json exists at the project root.
 *   3. Run:
 *        npx tsx seed-operator-admin.ts
 *
 * ⚠️  Change the password immediately after first login, and never commit
 *     ServiceAccountKey.json.
 */

import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import serviceAccount from "./ServiceAccountKey.json";

const OPERATOR_ADMIN_EMAIL = "operatoradmin@wasteflow.co.uk";
const OPERATOR_ADMIN_PASSWORD = "ChangeMe123!";
const OPERATOR_ADMIN_NAME = "WasteFlow Operator Admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const auth = admin.auth();
const db = getFirestore();

async function seedOperatorAdmin() {
  let uid: string;

  try {
    const existing = await auth.getUserByEmail(OPERATOR_ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Auth account already exists for ${OPERATOR_ADMIN_EMAIL} (uid: ${uid}) — reusing it.`);
  } catch {
    const created = await auth.createUser({
      email: OPERATOR_ADMIN_EMAIL,
      password: OPERATOR_ADMIN_PASSWORD,
      displayName: OPERATOR_ADMIN_NAME,
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created Auth account for ${OPERATOR_ADMIN_EMAIL} (uid: ${uid}).`);
  }

  await db.doc(`users/${uid}`).set(
    {
      uid,
      fullName: OPERATOR_ADMIN_NAME,
      email: OPERATOR_ADMIN_EMAIL,
      role: "operatorAdmin",
      accountStatus: "active",
      provider: "email",
      emailVerified: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("Firestore profile written with role 'operatorAdmin'.");
  console.log(`\nSign in at /operator-admin with:\n  email: ${OPERATOR_ADMIN_EMAIL}\n  password: ${OPERATOR_ADMIN_PASSWORD}`);
}

seedOperatorAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed operator admin:", err);
    process.exit(1);
  });
