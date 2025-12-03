import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyApiToken } from "@/lib/auth/verify-token";

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const tokenResult = await verifyApiToken(authHeader);

  if (!tokenResult.valid) {
    return NextResponse.json({ error: tokenResult.error }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Get user profile
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", tokenResult.userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: profile,
  });
}
