import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// Initialize Firebase securely using our trusted local JSON key
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
    console.warn("⚠️ Firebase Admin initialization skipped during environment setup.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export async function GET(request: Request) {
  try {
    // 1. Extract the author parameter from the incoming URL query string (e.g. ?author=sharon)
    const { searchParams } = new URL(request.url);
    const authorSlug = searchParams.get("author");

    if (!authorSlug) {
      return NextResponse.json(
        { success: false, error: "Missing required author query context token." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Central database core offline." },
        { status: 503 }
      );
    }

    // 2. Query Firestore: Fetch assets matching this author context that are Active and Public
    const productsRef = db.collection("products");
    const snapshot = await productsRef
      .where("status", "==", "Active")
      .where("type", "==", "Audiobook")
      .get();

    const authorProducts: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Match check: Enforce checking if the asset belongs to the requesting author slug
      // This maps cleanly to how we format the prefix assets keys: bk_[authorSlug]_[bookName]
      if (data.assetKey && data.assetKey.startsWith(`bk_${authorSlug.toLowerCase()}`)) {
        authorProducts.push({
          id: doc.id,
          assetKey: data.assetKey,
          title: data.title || "Untitled Audiobook",
          price: data.price || "0.00",
          type: data.type || "Audiobook",
          status: data.status || "Active",
          image: data.image || null,
          stripePriceId: data.priceId || "", // Needed for passing to the Checkout button
          stripeConnectId: data.stripeConnectId || "" // Needed for direct sub-merchant routing
        });
      }
    });

    // 3. Dispatch the catalog envelope with open cross-origin delivery clearances
    return NextResponse.json(
      { 
        success: true, 
        products: authorProducts 
      }, 
      { 
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allows independent WordPress storefronts to read the data safely
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );

  } catch (error: any) {
    console.error("❌ Public catalog data stream crash sequence:", error);
    return NextResponse.json(
      { success: false, error: "Internal ecosystem delivery breakdown." }, 
      { status: 500 }
    );
  }
}

// Support preflight requests from author domains seamlessly
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
  });
}