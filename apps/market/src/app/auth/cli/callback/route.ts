import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectUri = requestUrl.searchParams.get("redirect");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`);
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const githubUsername = user.user_metadata?.user_name ||
                          user.user_metadata?.preferred_username ||
                          user.email?.split("@")[0] ||
                          user.id.slice(0, 8);

    await supabase.from("profiles").insert({
      id: user.id,
      username: githubUsername,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      github_id: user.user_metadata?.provider_id,
    });
  }

  // Generate CLI token
  const token = `vcp_${crypto.randomBytes(32).toString("hex")}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  const adminClient = createAdminClient();
  await (adminClient.from("api_tokens") as any).insert({
    user_id: user.id,
    token_hash: tokenHash,
    name: `CLI Token ${new Date().toISOString().split("T")[0]}`,
    expires_at: expiresAt.toISOString(),
  });

  if (redirectUri) {
    // Redirect to CLI's localhost callback with token
    return NextResponse.redirect(`${redirectUri}?token=${token}`);
  }

  // Show success page with token
  return NextResponse.redirect(`${origin}/auth/cli/success?token=${token}`);
}
