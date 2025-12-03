import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect") || "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user info and ensure profile exists
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        // Create profile if it doesn't exist
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
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=access_denied`);
}
