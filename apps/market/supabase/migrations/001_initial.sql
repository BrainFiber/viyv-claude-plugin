-- viyv-claude-plugin-market Initial Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  github_id text unique,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles are public read
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================
-- API TOKENS TABLE (for CLI authentication)
-- ============================================
create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  token_hash text unique not null,
  name text not null,
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table api_tokens enable row level security;

-- Users can view their own tokens
create policy "Users can view own tokens"
  on api_tokens for select
  using (auth.uid() = user_id);

-- Users can create their own tokens
create policy "Users can create tokens"
  on api_tokens for insert
  with check (auth.uid() = user_id);

-- Users can revoke their own tokens
create policy "Users can revoke own tokens"
  on api_tokens for update
  using (auth.uid() = user_id);

-- Index for token lookup
create index if not exists idx_api_tokens_hash on api_tokens(token_hash);
create index if not exists idx_api_tokens_user on api_tokens(user_id);

-- ============================================
-- PLUGINS TABLE
-- ============================================
create table if not exists plugins (
  id text primary key,  -- slug-style ID
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text,
  keywords text[] default '{}',
  visibility text default 'public' check (visibility in ('public', 'private')),
  latest_version text,
  download_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table plugins enable row level security;

-- Public plugins are viewable by everyone
create policy "Public plugins viewable by everyone"
  on plugins for select
  using (visibility = 'public');

-- Private plugins viewable by owner
create policy "Private plugins viewable by owner"
  on plugins for select
  using (visibility = 'private' and owner_id = auth.uid());

-- Owners can manage their plugins
create policy "Owners can insert plugins"
  on plugins for insert
  with check (owner_id = auth.uid());

create policy "Owners can update plugins"
  on plugins for update
  using (owner_id = auth.uid());

create policy "Owners can delete plugins"
  on plugins for delete
  using (owner_id = auth.uid());

-- Indexes
create index if not exists idx_plugins_owner on plugins(owner_id);
create index if not exists idx_plugins_visibility on plugins(visibility);
create index if not exists idx_plugins_category on plugins(category);
create index if not exists idx_plugins_downloads on plugins(download_count desc);

-- ============================================
-- PLUGIN VERSIONS TABLE
-- ============================================
create table if not exists plugin_versions (
  id uuid primary key default gen_random_uuid(),
  plugin_id text references plugins(id) on delete cascade not null,
  version text not null,
  checksum text not null,
  storage_path text not null,
  size_bytes integer not null,
  created_at timestamptz default now() not null,
  unique(plugin_id, version)
);

-- Enable RLS
alter table plugin_versions enable row level security;

-- Versions follow plugin visibility
create policy "Versions viewable if plugin is viewable"
  on plugin_versions for select
  using (
    exists (
      select 1 from plugins
      where id = plugin_versions.plugin_id
    )
  );

-- Index
create index if not exists idx_versions_plugin on plugin_versions(plugin_id);

-- ============================================
-- PLUGIN ACCESS TABLE (for private plugins)
-- ============================================
create table if not exists plugin_access (
  id uuid primary key default gen_random_uuid(),
  plugin_id text references plugins(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  granted_by uuid references profiles(id) on delete cascade not null,
  granted_at timestamptz default now() not null,
  unique(plugin_id, user_id)
);

-- Enable RLS
alter table plugin_access enable row level security;

-- Users can see access they've been granted
create policy "Users can view granted access"
  on plugin_access for select
  using (user_id = auth.uid() or granted_by = auth.uid());

-- Plugin owners can manage access
create policy "Plugin owners can manage access"
  on plugin_access for all
  using (
    exists (
      select 1 from plugins
      where id = plugin_access.plugin_id and owner_id = auth.uid()
    )
  );

-- Index
create index if not exists idx_access_plugin on plugin_access(plugin_id);
create index if not exists idx_access_user on plugin_access(user_id);

-- ============================================
-- DEFERRED POLICY (requires plugin_access to exist)
-- ============================================
-- Private plugins viewable by granted users (via plugin_access)
create policy "Private plugins viewable by granted users"
  on plugins for select
  using (
    visibility = 'private' and
    exists (
      select 1 from plugin_access
      where plugin_id = plugins.id and user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment download count
create or replace function increment_download_count(p_plugin_id text)
returns void
language plpgsql
security definer
as $$
begin
  update plugins
  set download_count = download_count + 1
  where id = p_plugin_id;
end;
$$;

-- Function to handle new user signup (create profile)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, github_id)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1),
      new.id::text
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- STORAGE BUCKET
-- ============================================
insert into storage.buckets (id, name, public)
values ('plugins', 'plugins', false)
on conflict do nothing;
