import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// Initialize Firebase securely using the local JSON file
if (!admin.apps.length) {
  try {
    const keyPath = path.join(process.cwd(), "secrets", "firebase-service-account.json");
    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error: any) {
    console.warn("⚠️ Firebase Admin skipped initialization during build phase.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export async function POST(request: Request) {
  try {
    // 🔑 Destructuring assetKey to match your frontend and database state
    const { userEmail, assetKey, requestingDomain } = await request.json();

    if (!userEmail || !assetKey) {
      return NextResponse.json(
        { authenticated: false, error: "Missing required identification keys." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { authenticated: false, error: "Database engine offline." },
        { status: 503 }
      );
    }

    // 🔑 Adjusted to search by 'assetKey' and verify the status is 'active'
    const entitlementsRef = db.collection("entitlements");
    const snapshot = await entitlementsRef
      .where("userEmail", "==", userEmail.toLowerCase())
      .where("assetKey", "==", assetKey)
      .where("status", "==", "active")
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        authenticated: false,
        owned: false,
        message: "No valid active entitlement or license key matches this asset query.",
      }, { status: 200 });
    }

    const entitlementData = snapshot.docs[0].data();

    // 🔑 Time-Bound Expiration Validation for memberships
    if (entitlementData.expiresAt) {
      const expirationDate = new Date(entitlementData.expiresAt);
      if (expirationDate < new Date()) {
        return NextResponse.json({
          authenticated: false,
          owned: false,
          message: "This membership subscription has expired.",
        }, { status: 200 });
      }
    }

    if (requestingDomain && entitlementData.origin_domain && entitlementData.origin_domain !== requestingDomain) {
      console.warn(`⚠️ Domain cross-match alert: Requested from ${requestingDomain}, purchased via ${entitlementData.origin_domain}`);
    }

    return NextResponse.json({
      authenticated: true,
      owned: true,
      unlockedAt: entitlementData.purchasedAt, // Matches your ledger's field name
      invoiceUrl: entitlementData.stripeSessionId,
      assetType: entitlementData.type || "Audiobook",
      message: "Access Authorization Granted.",
    }, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });

  } catch (error: any) {
    console.error("❌ Entitlement verification crash sequence:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server verification breakdown." }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}