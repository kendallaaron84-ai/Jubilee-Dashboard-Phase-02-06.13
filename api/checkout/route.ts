import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe (Ensure your env variable is set)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-10-16" 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔥 INCOMING PAYLOAD FROM WP:", body); // Add this right here!
    
    const { 
      priceId, 
      koba_asset_key, 
      product_type, 
      stripeConnectId, 
      user_email, 
      origin_domain 
    } = body;

    // 🔑 DEFINE THE MISSING VARIABLE HERE:
    // If product_type is "Membership", use "subscription". Otherwise, "payment"
    const sessionMode = product_type === "Membership" ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({

      line_items: [{ price: priceId, quantity: 1 }],
      mode: sessionMode, // Now 'sessionMode' is safely defined above!
      success_url: `https://dashboard.koba-i.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dashboard.koba-i.com/billing`,
      metadata: {
        koba_asset_key: koba_asset_key,
        koba_product_type: product_type || "Audiobook",
        author_stripe_connect_id: stripeConnectId || "",
        user_email: user_email, 
        origin_domain: origin_domain || "koba-i.com", 
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("❌ Real Backend Stripe Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}