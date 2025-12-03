export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          github_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          github_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          github_id?: string | null;
          created_at?: string;
        };
      };
      api_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          name: string;
          expires_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          name: string;
          expires_at: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          name?: string;
          expires_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
      };
      plugins: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          category: string | null;
          keywords: string[];
          visibility: "public" | "private";
          latest_version: string | null;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          owner_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          keywords?: string[];
          visibility?: "public" | "private";
          latest_version?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          keywords?: string[];
          visibility?: "public" | "private";
          latest_version?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      plugin_versions: {
        Row: {
          id: string;
          plugin_id: string;
          version: string;
          checksum: string;
          storage_path: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          plugin_id: string;
          version: string;
          checksum: string;
          storage_path: string;
          size_bytes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          plugin_id?: string;
          version?: string;
          checksum?: string;
          storage_path?: string;
          size_bytes?: number;
          created_at?: string;
        };
      };
      plugin_access: {
        Row: {
          id: string;
          plugin_id: string;
          user_id: string;
          granted_by: string;
          granted_at: string;
        };
        Insert: {
          id?: string;
          plugin_id: string;
          user_id: string;
          granted_by: string;
          granted_at?: string;
        };
        Update: {
          id?: string;
          plugin_id?: string;
          user_id?: string;
          granted_by?: string;
          granted_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Plugin = Database["public"]["Tables"]["plugins"]["Row"];
export type PluginVersion = Database["public"]["Tables"]["plugin_versions"]["Row"];
export type PluginAccess = Database["public"]["Tables"]["plugin_access"]["Row"];
export type ApiToken = Database["public"]["Tables"]["api_tokens"]["Row"];
