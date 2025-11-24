export type MarketplacePluginEntry = {
  name: string;
  source: string;
  description?: string;
  version?: string;
  author?: {
    name?: string;
    email?: string;
    url?: string;
  };
  strict?: boolean;
};

export type MarketplaceSchema = {
  name: string;
  owner: {
    name: string;
    email?: string;
  };
  plugins: MarketplacePluginEntry[];
};
