import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // 🔑 Pinning version to match your working checkout context
});

if (!admin.apps.length) {
  try {
    const keyPath = path.join(process.cwd(), "secrets", "firebase-service-account.json");
    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("🚀 Firebase Initialized successfully from local JSON file!");
    } else {
      console.error("❌ Key file not found at:", keyPath);
    }
  } catch (err: any) {
    console.error("❌ Firebase Initialization Error:", err.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("Stripe-Signature");
  
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  // 🔑 TASK 2 & 3: ADVANCED ENTITLEMENT HANDLING
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. Pull our custom tokens safely out of the Stripe metadata envelope
    const metadata = session.metadata || {};
    const assetKey = metadata.koba_asset_key;
    const productType = metadata.koba_product_type || "Audiobook";
    const stripeConnectId = metadata.author_stripe_connect_id || "";
    
    // Fallback to Stripe data fields if metadata email wasn't passed directly
    const userEmail = metadata.user_email || session.customer_details?.email || "";

    console.log(`Processing entitlement fulfillment for: ${userEmail} -> Asset: ${assetKey}`);

    if (!assetKey || !userEmail) {
      console.error("❌ Missing vital payload credentials. Aborting DB entry.");
      return NextResponse.json({ error: "Missing asset key or user email in metadata" }, { status: 400 });
    }

    if (!db) {
      console.error("❌ Firestore connection is unavailable. Database write rejected.");
      return NextResponse.json({ error: "Database core unavailable" }, { status: 500 });
    }

    // 2. Dynamic Time-Bound Calculations (expiresAt)
    let expiresAt: Date | null = null;

    if (productType === "Membership" && session.subscription) {
      try {
        // If it's a recurring sub, fetch the subscription details directly from Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        // Stripe uses Unix timestamps (seconds), JavaScript Date wants milliseconds
        expiresAt = new Date(subscription.current_period_end * 1000);
        console.log(`⏱️ Subscription item mapped. Access expires on: ${expiresAt.toISOString()}`);
      } catch (subErr: any) {
        console.error("⚠️ Failed to extract subscription period end date:", subErr.message);
        // Fall back to 31 days out if API network call hiccups
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 31);
      }
    }

    // 3. Write clean, unique entitlement document directly to Firestore
    try {
      const entitlementId = `ent_${Math.random().toString(36).substring(2, 11)}`;
      
      await db.collection("entitlements").doc(entitlementId).set({
        id: entitlementId,
        userId: "", // Will map to their Auth user record once they claim it via dashboard
        userEmail: userEmail.toLowerCase(),
        assetKey: assetKey,
        type: productType,
        status: "active",
        purchasedAt: new Date().toISOString(),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        stripeConnectId: stripeConnectId,
        stripeSessionId: session.id
      });

      console.log(`🎉 Success! Entitlement reference ${entitlementId} provisioned securely.`);
    } catch (dbErr: any) {
      console.error("❌ Firestore Mutation Refusal:", dbErr.message);
      return NextResponse.json({ error: "Failed to save record to cloud storage" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}