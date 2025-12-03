import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyApiToken } from "@/lib/auth/verify-token";

// GET /api/plugins - List public plugins
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "popular";
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const supabase = await createClient();

  let query = supabase
    .from("plugins")
    .select(`
      *,
      profiles:owner_id (username, avatar_url)
    `)
    .eq("visibility", "public");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sort
  switch (sort) {
    case "recent":
      query = query.order("updated_at", { ascending: false });
      break;
    case "downloads":
      query = query.order("download_count", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "popular":
    default:
      query = query.order("download_count", { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    plugins: data,
    total: count,
    limit,
    offset,
  });
}

// POST /api/plugins - Create new plugin (requires auth)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const tokenResult = await verifyApiToken(authHeader);

  if (!tokenResult.valid) {
    return NextResponse.json({ error: tokenResult.error }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Parse request body
  const body = await request.json();
  const { id, name, description, category, keywords, visibility } = body;

  if (!id || !name) {
    return NextResponse.json(
      { error: "id and name are required" },
      { status: 400 }
    );
  }

  // Check if plugin already exists
  const { data: existing } = await adminClient
    .from("plugins")
    .select("id, owner_id")
    .eq("id", id)
    .single();

  const existingPlugin = existing as { id: string; owner_id: string } | null;

  if (existingPlugin) {
    // Check ownership for update
    if (existingPlugin.owner_id !== tokenResult.userId) {
      return NextResponse.json(
        { error: "Plugin already exists with different owner" },
        { status: 403 }
      );
    }

    // Update existing plugin
    const { data, error } = await (adminClient.from("plugins") as any)
      .update({
        name,
        description,
        category,
        keywords: keywords || [],
        visibility: visibility || "public",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plugin: data, updated: true });
  }

  // Create new plugin
  const { data, error } = await (adminClient.from("plugins") as any)
    .insert({
      id,
      owner_id: tokenResult.userId,
      name,
      description,
      category,
      keywords: keywords || [],
      visibility: visibility || "public",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plugin: data, created: true }, { status: 201 });
}
