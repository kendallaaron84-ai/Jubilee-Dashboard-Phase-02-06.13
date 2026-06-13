import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

let db: any = null;

try {
  if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountKey)),
      });
    }
  }
  if (getApps().length) {
    db = getFirestore();
  }
} catch (error: any) {
  console.warn("⚠️ Firebase Admin skipped initialization during build phase.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, domain, productType } = body;

    if (!licenseKey || !domain || !productType) {
      return NextResponse.json(
        { verified: false, message: "Missing required validation parameters." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { verified: false, message: "Database connection unavailable during build verification." },
        { status: 503 }
      );
    }

    const licensesRef = db.collection("licenses");
    const snapshot = await licensesRef.where("licenseKey", "==", licenseKey).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { verified: false, message: "Invalid license key structure or key does not exist." }, 
        { status: 404 }
      );
    }

    const licenseDoc = snapshot.docs[0];
    const licenseData = licenseDoc.data();

    if (licenseData.status !== "active") {
      return NextResponse.json(
        { verified: false, message: "License has been suspended or revoked." }, 
        { status: 403 }
      );
    }

    if (licenseData.associatedWebsite !== domain) {
      return NextResponse.json(
        { verified: false, message: "Domain mismatch allocation detected. License key belongs to another host." }, 
        { status: 403 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: "License signature verified successfully.",
      tier: licenseData.tier || "standard",
      productType: licenseData.productType || productType
    });

  } catch (error: any) {
    console.error("❌ License validation engine error:", error);
    return NextResponse.json(
      { verified: false, message: "Internal authentication server fault." },
      { status: 500 }
    );
  }
}