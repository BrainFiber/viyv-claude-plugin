import type { MarketPlugin, DownloadResult } from './types.js';

export class MarketClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  private headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getMe(): Promise<{ id: string; username: string; display_name: string | null }> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    const data = await response.json();
    return data.user;
  }

  async searchPlugins(query: string, options?: { limit?: number; offset?: number }): Promise<MarketPlugin[]> {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const response = await fetch(`${this.baseUrl}/api/plugins?${params}`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search plugins: ${response.status}`);
    }

    const data = await response.json();
    return data.plugins;
  }

  async getPlugin(id: string): Promise<MarketPlugin & { versions: Array<{ version: string; created_at: string }> }> {
    const response = await fetch(`${this.baseUrl}/api/plugins/${id}`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Plugin not found: ${id}`);
      }
      throw new Error(`Failed to get plugin: ${response.status}`);
    }

    const data = await response.json();
    return { ...data.plugin, versions: data.versions };
  }

  async downloadPlugin(id: string, version?: string): Promise<DownloadResult> {
    const params = new URLSearchParams();
    if (version) params.set('version', version);

    const response = await fetch(`${this.baseUrl}/api/plugins/${id}/download?${params}`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Plugin not found: ${id}`);
      }
      if (response.status === 403) {
        throw new Error(`Access denied to plugin: ${id}`);
      }
      throw new Error(`Failed to download plugin: ${response.status}`);
    }

    return response.json();
  }

  async publishPlugin(
    pluginData: {
      id: string;
      name: string;
      description?: string;
      category?: string;
      keywords?: string[];
      visibility?: 'public' | 'private';
    }
  ): Promise<{ plugin: MarketPlugin; created?: boolean; updated?: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/plugins`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(pluginData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to publish plugin: ${response.status}`);
    }

    return response.json();
  }

  async updatePlugin(
    id: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      keywords?: string[];
      visibility?: 'public' | 'private';
    }
  ): Promise<{ plugin: MarketPlugin }> {
    const response = await fetch(`${this.baseUrl}/api/plugins/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to update plugin: ${response.status}`);
    }

    return response.json();
  }

  async deletePlugin(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/plugins/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to delete plugin: ${response.status}`);
    }
  }
}
