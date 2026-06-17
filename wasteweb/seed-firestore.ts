/**
 * WasteFlow — Firestore Seed Script
 * Creates users and seeds KYC data for testing.
 *
 * Usage:
 *   1. Place this file at the root of your project (or /scripts/seed-firestore.ts)
 *   2. Add your Firebase service account JSON as `serviceAccountKey.json` at project root
 *   3. Run:
 *        npx tsx seed-firestore.ts
 *
 * ⚠️  Never commit serviceAccountKey.json — add it to .gitignore
 */

import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = getFirestore();

type Role = "operator" | "contractor";
type KycStatus = "pending" | "submitted" | "verified" | "rejected";
type Provider = "email" | "google";

interface KYCData {
  companyName: string;
  phone: string;
  regNumber: string;
  vatNumber?: string;
  terms: boolean;
  yearsOp?: string;
  serviceArea?: string;
  wasteHandled?: string[];
  vehicles?: string;
  tonnage?: string;
  wasteCarrierNum?: string;
  certs?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  coverage?: string;
  wasteCarrierDocUrl?: string;
  industry?: string;
  siteAddress?: string;
  postcode?: string;
  city?: string;
  wasteTypes?: string[];
  frequency?: string;
  volume?: string;
  businessDocUrl?: string;
}

interface UserSeedData {
  uid: string;
  fullName: string;
  email: string;
  role: Role;
  kycStatus: KycStatus;
  provider: Provider;
  emailVerified: boolean;
  kycData?: KYCData;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
}

const seedUsers: Omit<UserSeedData, "createdAt" | "updatedAt">[] = [
  // Verified Operator with complete KYC
  {
    uid: "seed_operator_verified_001",
    fullName: "James Hargreaves",
    email: "james.hargreaves@wasteflow-demo.co.uk",
    role: "operator",
    kycStatus: "verified",
    provider: "email",
    emailVerified: true,
    kycData: {
      companyName: "GreenHaul Services Ltd",
      phone: "+44 7700 123456",
      regNumber: "12345678",
      vatNumber: "GB 123 4567 89",
      yearsOp: "8",
      serviceArea: "EC1, EC2, EC3, WC1, WC2, N1, N7, E1, E2",
      wasteHandled: ["Recycling", "Inert Waste", "Skip Hire", "Bulk Clearance"],
      vehicles: "12",
      tonnage: "45t/day",
      wasteCarrierNum: "CBDU789012",
      certs: "ISO 14001, OHSAS 18001",
      insuranceProvider: "Hiscox",
      policyNumber: "PLI-ABC123456",
      coverage: "£5,000,000",
      wasteCarrierDocUrl: "https://storage.example.com/kyc/waste-carrier-licence.pdf",
      terms: true,
    },
  },
  // Operator with submitted KYC (pending review)
  {
    uid: "seed_operator_submitted_002",
    fullName: "Sophie Whitfield",
    email: "sophie.whitfield@wasteflow-demo.co.uk",
    role: "operator",
    kycStatus: "submitted",
    provider: "email",
    emailVerified: true,
    kycData: {
      companyName: "EcoWaste Solutions",
      phone: "+44 7700 234567",
      regNumber: "23456789",
      vatNumber: "GB 234 5678 90",
      yearsOp: "4",
      serviceArea: "M1, M2, M3, M4, M15, M16, SK1, SK2",
      wasteHandled: ["Recycling", "Reuse / Repurpose", "Landfill"],
      vehicles: "6",
      tonnage: "20t/day",
      wasteCarrierNum: "CBDU345678",
      certs: "ISO 14001",
      insuranceProvider: "AXA",
      policyNumber: "PLI-DEF789012",
      coverage: "£2,000,000",
      wasteCarrierDocUrl: "https://storage.example.com/kyc/waste-carrier-licence-2.pdf",
      terms: true,
    },
  },
  // Operator with rejected KYC
  {
    uid: "seed_operator_rejected_003",
    fullName: "David Chen",
    email: "david.chen@wasteflow-demo.co.uk",
    role: "operator",
    kycStatus: "rejected",
    provider: "google",
    emailVerified: true,
    kycData: {
      companyName: "FastHaul Logistics",
      phone: "+44 7700 345678",
      regNumber: "34567890",
      yearsOp: "1",
      serviceArea: "B1, B2, B3, B4",
      wasteHandled: ["Landfill"],
      vehicles: "2",
      tonnage: "5t/day",
      wasteCarrierNum: "CBDU901234",
      insuranceProvider: "Aviva",
      policyNumber: "PLI-GHI345678",
      coverage: "£1,000,000",
      wasteCarrierDocUrl: "https://storage.example.com/kyc/waste-carrier-licence-3.pdf",
      terms: true,
    },
  },
  // Operator with pending KYC (not started)
  {
    uid: "seed_operator_pending_004",
    fullName: "Tom Richardson",
    email: "tom.richardson@wasteflow-demo.co.uk",
    role: "operator",
    kycStatus: "pending",
    provider: "email",
    emailVerified: false,
  },
  // Verified Contractor with complete KYC
  {
    uid: "seed_contractor_verified_001",
    fullName: "Priya Nair",
    email: "priya.nair@wasteflow-demo.co.uk",
    role: "contractor",
    kycStatus: "verified",
    provider: "email",
    emailVerified: true,
    kycData: {
      companyName: "BuildRight Construction Ltd",
      phone: "+44 7700 456789",
      regNumber: "45678901",
      vatNumber: "GB 345 6789 01",
      industry: "construction",
      siteAddress: "123 Construction Way, King's Cross",
      postcode: "N1 9AG",
      city: "London",
      wasteTypes: ["Concrete & Masonry", "Timber & Wood", "Metals & Steel", "Plasterboard"],
      frequency: "weekly",
      volume: "8 cubic yards",
      businessDocUrl: "https://storage.example.com/kyc/business-certificate.pdf",
      terms: true,
    },
  },
  // Contractor with submitted KYC (pending review)
  {
    uid: "seed_contractor_submitted_002",
    fullName: "Marcus Okafor",
    email: "marcus.okafor@wasteflow-demo.co.uk",
    role: "contractor",
    kycStatus: "submitted",
    provider: "google",
    emailVerified: true,
    kycData: {
      companyName: "Okafor Demolition & Civil",
      phone: "+44 7700 567890",
      regNumber: "56789012",
      vatNumber: "GB 456 7890 12",
      industry: "demolition",
      siteAddress: "45 Demolition Road, Stratford",
      postcode: "E15 2SP",
      city: "London",
      wasteTypes: ["Concrete & Masonry", "Metals & Steel", "Mixed Construction", "Hazardous / Specialist"],
      frequency: "fortnightly",
      volume: "12 cubic yards",
      businessDocUrl: "https://storage.example.com/kyc/business-certificate-2.pdf",
      terms: true,
    },
  },
  // Contractor with pending KYC (not started)
  {
    uid: "seed_contractor_pending_003",
    fullName: "Emma Wilson",
    email: "emma.wilson@wasteflow-demo.co.uk",
    role: "contractor",
    kycStatus: "pending",
    provider: "email",
    emailVerified: false,
  },
];

async function seedUsersAndKYC() {
  console.log("\n🌱 WasteFlow — Seeding Firestore users collection with KYC data...\n");

  const batch = db.batch();

  for (const user of seedUsers) {
    const docRef = db.collection("users").doc(user.uid);

    const data: UserSeedData = {
      ...user,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    batch.set(docRef, data, { merge: true });
    console.log(`  ✔  Created/Updated: ${user.email}`);
    console.log(`      UID: ${user.uid}`);
    console.log(`      Role: ${user.role} | KYC Status: ${user.kycStatus}`);
    if (user.kycData) {
      console.log(`      KYC Data: ${Object.keys(user.kycData).length} fields`);
    } else {
      console.log(`      KYC Data: None (pending user)`);
    }
    console.log(`      ---`);
  }

  await batch.commit();
  console.log(`\n✅  Done! ${seedUsers.length} users seeded into Firestore.\n`);
  
  console.log("📊 Summary:");
  console.log(`   • Operators: ${seedUsers.filter(u => u.role === "operator").length}`);
  console.log(`   • Contractors: ${seedUsers.filter(u => u.role === "contractor").length}`);
  console.log(`   • Verified KYC: ${seedUsers.filter(u => u.kycStatus === "verified").length}`);
  console.log(`   • Submitted KYC: ${seedUsers.filter(u => u.kycStatus === "submitted").length}`);
  console.log(`   • Rejected KYC: ${seedUsers.filter(u => u.kycStatus === "rejected").length}`);
  console.log(`   • Pending KYC: ${seedUsers.filter(u => u.kycStatus === "pending").length}\n`);
  
  console.log("🔑 Test Accounts:");
  console.log("   Operator Verified:   james.hargreaves@wasteflow-demo.co.uk");
  console.log("   Operator Submitted:  sophie.whitfield@wasteflow-demo.co.uk");
  console.log("   Operator Rejected:   david.chen@wasteflow-demo.co.uk");
  console.log("   Operator Pending:    tom.richardson@wasteflow-demo.co.uk");
  console.log("   Contractor Verified: priya.nair@wasteflow-demo.co.uk");
  console.log("   Contractor Submitted: marcus.okafor@wasteflow-demo.co.uk");
  console.log("   Contractor Pending:  emma.wilson@wasteflow-demo.co.uk\n");
}

seedUsersAndKYC().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});