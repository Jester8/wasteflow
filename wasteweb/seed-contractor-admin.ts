/**
 * WasteFlow — Contractor Admin Seed Script
 *
 * Creates a single Firebase Auth account (email/password) plus its matching
 * Firestore `users/{uid}` profile with role 'contractorAdmin'. This role can
 * never be created through the app's normal signup flow (the Firestore rules
 * only allow self-serve signup with role 'operator' or 'contractor'), so this
 * script is the only way to provision one.
 *
 * Usage:
 *   1. Edit CONTRACTOR_ADMIN_EMAIL / CONTRACTOR_ADMIN_PASSWORD / CONTRACTOR_ADMIN_NAME below.
 *   2. Make sure ServiceAccountKey.json exists at the project root.
 *   3. Run:
 *        npx tsx seed-contractor-admin.ts
 *
 * ⚠️  Change the password immediately after first login, and never commit
 *     ServiceAccountKey.json.
 */

import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import serviceAccount from "./ServiceAccountKey.json";

const CONTRACTOR_ADMIN_EMAIL = "contractoradmin@wasteflow.co.uk";
const CONTRACTOR_ADMIN_PASSWORD = "ChangeMe123!";
const CONTRACTOR_ADMIN_NAME = "WasteFlow Contractor Admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const auth = admin.auth();
const db = getFirestore();

async function seedContractorAdmin() {
  let uid: string;

  try {
    const existing = await auth.getUserByEmail(CONTRACTOR_ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Auth account already exists for ${CONTRACTOR_ADMIN_EMAIL} (uid: ${uid}) — reusing it.`);
  } catch {
    const created = await auth.createUser({
      email: CONTRACTOR_ADMIN_EMAIL,
      password: CONTRACTOR_ADMIN_PASSWORD,
      displayName: CONTRACTOR_ADMIN_NAME,
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created Auth account for ${CONTRACTOR_ADMIN_EMAIL} (uid: ${uid}).`);
  }

  await db.doc(`users/${uid}`).set(
    {
      uid,
      fullName: CONTRACTOR_ADMIN_NAME,
      email: CONTRACTOR_ADMIN_EMAIL,
      role: "contractorAdmin",
      accountStatus: "active",
      provider: "email",
      emailVerified: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("Firestore profile written with role 'contractorAdmin'.");
  console.log(`\nSign in at /contractor-admin with:\n  email: ${CONTRACTOR_ADMIN_EMAIL}\n  password: ${CONTRACTOR_ADMIN_PASSWORD}`);
}

seedContractorAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed contractor admin:", err);
    process.exit(1);
  });
