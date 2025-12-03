import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

type TokenVerifyResult =
  | { valid: true; userId: string }
  | { valid: false; error: string };

export async function verifyApiToken(authHeader: string | null): Promise<TokenVerifyResult> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.slice(7);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const adminClient = createAdminClient();

  // Verify token - use explicit type assertion to avoid TS inference issues
  const { data: tokenData, error: tokenError } = await adminClient
    .from("api_tokens")
    .select("user_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .single();

  if (tokenError || !tokenData) {
    return { valid: false, error: "Invalid token" };
  }

  // Cast to known shape
  const td = tokenData as { user_id: string; expires_at: string; revoked_at: string | null };

  if (td.revoked_at) {
    return { valid: false, error: "Token has been revoked" };
  }

  if (new Date(td.expires_at) < new Date()) {
    return { valid: false, error: "Token has expired" };
  }

  // Update last used (fire and forget)
  void (adminClient.from("api_tokens") as any)
    .update({ last_used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return { valid: true, userId: td.user_id };
}
