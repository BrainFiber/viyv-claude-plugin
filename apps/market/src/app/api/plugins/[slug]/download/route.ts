import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyApiToken } from "@/lib/auth/verify-token";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/plugins/[slug]/download - Get download URL
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const version = searchParams.get("version");

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get plugin
  const { data: plugin, error } = await supabase
    .from("plugins")
    .select("id, visibility, owner_id, latest_version")
    .eq("id", slug)
    .single();

  if (error || !plugin) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  // Check access for private plugins
  if (plugin.visibility === "private") {
    const authHeader = request.headers.get("authorization");
    const tokenResult = await verifyApiToken(authHeader);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: tokenResult.error }, { status: 401 });
    }

    if (plugin.owner_id !== tokenResult.userId) {
      // Check if user has access
      const { data: access } = await supabase
        .from("plugin_access")
        .select("id")
        .eq("plugin_id", slug)
        .eq("user_id", tokenResult.userId)
        .single();

      if (!access) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
  }

  // Get version info
  const targetVersion = version || plugin.latest_version;

  if (!targetVersion) {
    return NextResponse.json({ error: "No version available" }, { status: 404 });
  }

  const { data: versionData } = await supabase
    .from("plugin_versions")
    .select("storage_path, checksum, size_bytes")
    .eq("plugin_id", slug)
    .eq("version", targetVersion)
    .single();

  if (!versionData) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Generate signed URL (5 minutes)
  const { data: signedUrl, error: signError } = await adminClient.storage
    .from("plugins")
    .createSignedUrl(versionData.storage_path, 300);

  if (signError || !signedUrl) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }

  // Increment download count
  await (adminClient as any).rpc("increment_download_count", { plugin_id: slug });

  return NextResponse.json({
    url: signedUrl.signedUrl,
    version: targetVersion,
    checksum: versionData.checksum,
    size: versionData.size_bytes,
  });
}
