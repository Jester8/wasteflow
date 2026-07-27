import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebase-admin";
import { submitReceiptOfWaste, DefraReceiptPayload } from "../../../lib/defraWasteTracking";

// A skip lorry / flatbed making a single road collection is the app's only
// real-world scenario today — hardcoded rather than exposed as a form
// field the operator would have to fill in every time.
const MEANS_OF_TRANSPORT = "Road";

export async function POST(req: NextRequest) {
  try {
    const { idToken, requestId } = await req.json();

    if (!idToken || !requestId) {
      return NextResponse.json({ error: "Missing idToken or requestId" }, { status: 400 });
    }

    const adminAuth = getAuth();
    const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const requestRef = adminDb.doc(`wasteRequests/${requestId}`);
    const requestSnap = await requestRef.get();
    if (!requestSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    const requestData = requestSnap.data()!;

    const operatorUid: string | undefined = requestData.assignedOperatorId || requestData.operatorId;

    const callerSnap = await adminDb.doc(`users/${decoded.uid}`).get();
    const callerRole = callerSnap.exists ? callerSnap.data()?.role : null;
    const isOwner = decoded.uid === operatorUid;
    const isPrivileged = callerRole === "admin" || callerRole === "superadmin";
    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (requestData.status !== "completed" || !requestData.wasteTransferRecord) {
      return NextResponse.json({ error: "Request has no completed waste transfer record" }, { status: 400 });
    }

    // Already successfully submitted — don't send a duplicate movement to
    // DEFRA for the same pickup.
    if (requestData.defraSubmission?.status === "submitted") {
      return NextResponse.json({ skipped: false, alreadySubmitted: true, ...requestData.defraSubmission });
    }

    if (!operatorUid) {
      const skip = { status: "skipped", reason: "No operator assigned to this request", checkedAt: FieldValue.serverTimestamp() };
      await requestRef.update({ defraSubmission: skip });
      return NextResponse.json({ skipped: true, reason: skip.reason });
    }

    const [operatorUserSnap, operatorKycSnap] = await Promise.all([
      adminDb.doc(`users/${operatorUid}`).get(),
      adminDb.doc(`kyc/${operatorUid}`).get(),
    ]);
    const operatorUser = operatorUserSnap.exists ? operatorUserSnap.data()! : {};
    const operatorKyc = operatorKycSnap.exists ? operatorKycSnap.data()! : {};

    const transfer = requestData.wasteTransferRecord;

    // These can only ever come from the operator's own DEFRA registration —
    // there's nothing sensible to default them to, so if they're missing we
    // skip the submission (the pickup itself has already completed fine)
    // rather than send DEFRA an invalid or fabricated record.
    const missing: string[] = [];
    if (!operatorKyc.defraApiCode) missing.push("operator's DEFRA API code");
    if (!operatorKyc.wasteCarrierNum) missing.push("operator's waste carrier licence number");
    if (!transfer.receivingSiteAuthNumber) missing.push("receiving site authorisation number");
    if (!transfer.receivingSiteAddress) missing.push("receiving site address");
    if (!transfer.receivingSitePostcode) missing.push("receiving site postcode");

    if (missing.length > 0) {
      const skip = {
        status: "skipped",
        reason: `Missing required field(s): ${missing.join(", ")}`,
        checkedAt: FieldValue.serverTimestamp(),
      };
      await requestRef.update({ defraSubmission: skip });
      return NextResponse.json({ skipped: true, reason: skip.reason });
    }

    const weightAmount = Number(transfer.weightAmount);
    const weight = {
      metric: transfer.weightUnit === "Kilograms" ? ("Kilograms" as const) : ("Tonnes" as const),
      amount: Number.isFinite(weightAmount) ? weightAmount : 0,
      isEstimate: Boolean(transfer.weightEstimated),
    };

    const payload: DefraReceiptPayload = {
      apiCode: operatorKyc.defraApiCode,
      dateTimeReceived: new Date().toISOString(),
      wasteItems: [
        {
          ewcCodes: [transfer.ewcCode.replace(/\s+/g, "")],
          wasteDescription: transfer.wasteDescription || "Construction and demolition waste",
          physicalForm: transfer.physicalForm,
          // Not captured per-job today — this app deals in skip loads, so a
          // single skip container is the sensible default absent a real
          // container count/type field in the completion form.
          numberOfContainers: 1,
          typeOfContainers: "Skip",
          weight,
          containsHazardous: Boolean(transfer.isHazardous),
          containsPops: false,
          disposalOrRecoveryCodes: [
            { code: transfer.disposalOrRecoveryCode, weight },
          ],
        },
      ],
      carrier: {
        organisationName: operatorKyc.companyName || operatorUser.fullName || "Unknown carrier",
        registrationNumber: operatorKyc.wasteCarrierNum,
        meansOfTransport: MEANS_OF_TRANSPORT,
        vehicleRegistration: operatorUser.vehicleRegistration || undefined,
      },
      receiver: {
        siteName: transfer.receivingSiteName || undefined,
        authorisationNumber: transfer.receivingSiteAuthNumber,
      },
      receipt: {
        address: {
          fullAddress: transfer.receivingSiteAddress,
          postcode: transfer.receivingSitePostcode,
        },
      },
    };

    const result = await submitReceiptOfWaste(payload);

    if (result.ok) {
      const submission = {
        status: "submitted",
        globalMovementId: result.globalMovementId,
        env: result.env,
        submittedAt: FieldValue.serverTimestamp(),
      };
      await requestRef.update({ defraSubmission: submission });
      return NextResponse.json({ skipped: false, ...submission });
    }

    if (result.reason === "not_configured") {
      const skip = {
        status: "skipped",
        reason: "DEFRA integration is not configured on this deployment",
        checkedAt: FieldValue.serverTimestamp(),
      };
      await requestRef.update({ defraSubmission: skip });
      return NextResponse.json({ skipped: true, reason: skip.reason });
    }

    const failure = {
      status: "failed",
      error: result.error,
      attemptedAt: FieldValue.serverTimestamp(),
    };
    await requestRef.update({ defraSubmission: failure });
    return NextResponse.json({ skipped: false, ...failure }, { status: 502 });
  } catch (err: any) {
    console.error("[defra/submit-receipt]", err);
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
  }
}
