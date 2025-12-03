import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyApiToken } from "@/lib/auth/verify-token";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/plugins/[slug] - Get plugin details
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClient();

  // Check if user is authenticated (for private plugins)
  const authHeader = request.headers.get("authorization");
  let userId: string | null = null;

  const tokenResult = await verifyApiToken(authHeader);
  if (tokenResult.valid) {
    userId = tokenResult.userId;
  }

  // Get plugin
  const { data: plugin, error } = await supabase
    .from("plugins")
    .select(`
      *,
      profiles:owner_id (username, avatar_url)
    `)
    .eq("id", slug)
    .single();

  if (error || !plugin) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  // Check access for private plugins
  if (plugin.visibility === "private") {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (plugin.owner_id !== userId) {
      // Check if user has access
      const { data: access } = await supabase
        .from("plugin_access")
        .select("id")
        .eq("plugin_id", slug)
        .eq("user_id", userId)
        .single();

      if (!access) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
  }

  // Get versions
  const { data: versions } = await supabase
    .from("plugin_versions")
    .select("version, created_at")
    .eq("plugin_id", slug)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    plugin,
    versions: versions || [],
  });
}

// PATCH /api/plugins/[slug] - Update plugin
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const authHeader = request.headers.get("authorization");

  const tokenResult = await verifyApiToken(authHeader);

  if (!tokenResult.valid) {
    return NextResponse.json({ error: tokenResult.error }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Check ownership
  const { data: plugin } = await adminClient
    .from("plugins")
    .select("owner_id")
    .eq("id", slug)
    .single();

  const pluginData = plugin as { owner_id: string } | null;

  if (!pluginData) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  if (pluginData.owner_id !== tokenResult.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Update plugin
  const body = await request.json();
  const allowedFields = ["name", "description", "category", "keywords", "visibility"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await (adminClient.from("plugins") as any)
    .update(updates)
    .eq("id", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plugin: data });
}

// DELETE /api/plugins/[slug] - Delete plugin
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const authHeader = request.headers.get("authorization");

  const tokenResult = await verifyApiToken(authHeader);

  if (!tokenResult.valid) {
    return NextResponse.json({ error: tokenResult.error }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Check ownership
  const { data: plugin } = await adminClient
    .from("plugins")
    .select("owner_id")
    .eq("id", slug)
    .single();

  const pluginData = plugin as { owner_id: string } | null;

  if (!pluginData) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  if (pluginData.owner_id !== tokenResult.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Delete plugin (cascades to versions and access)
  const { error } = await (adminClient.from("plugins") as any)
    .delete()
    .eq("id", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
