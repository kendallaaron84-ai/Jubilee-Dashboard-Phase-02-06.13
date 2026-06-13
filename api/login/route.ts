import { NextResponse } from "next/server";
import { auth as adminAuth } from "@/lib/firebase-admin"; // Ensure you have your admin SDK initialized here

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 🔑 Intercept local development bypass request
    if (process.env.NODE_ENV === 'development' && body.isDevBypass) {
      const response = NextResponse.json({ status: "success" });
      response.cookies.set("__session", "dev_bypass_cookie_active", {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false, // Localhost doesn't require HTTPS enforcement
        sameSite: "strict",
        path: "/",
      });
      return response;
    }

    const { idToken } = body;
    const expiresIn = 60 * 60 * 24 * 7 * 1000; 
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ status: "success" });
    // ... rest of your standard token code
    
    // Append the cookie directly onto the secure transport layer
    response.cookies.set("__session", sessionCookie, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true, // Safeguards cookie from XSS injection
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Session creation failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}