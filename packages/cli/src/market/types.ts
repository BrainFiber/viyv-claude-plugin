export type MarketPlugin = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  keywords: string[];
  visibility: 'public' | 'private';
  latest_version: string | null;
  download_count: number;
  owner: {
    username: string;
    avatar_url: string | null;
  };
};

export type PublishOptions = {
  visibility?: 'public' | 'private';
  access?: string[];
};

export type DownloadResult = {
  url: string;
  version: string;
  checksum: string;
  size: number;
};
