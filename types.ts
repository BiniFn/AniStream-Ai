export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  synopsis: string;
  score: number;
  genres: { name: string }[];
  episodes: number;
  status: string;
  rating: string;
  year: number;
  type?: string;
  rank?: number;
}

export interface JikanResponse<T> {
  data: T;
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

// Streaming API Types
export interface StreamEpisode {
  episodeId: string;
  title: string;
  number: number;
  isFiller: boolean;
}

export interface StreamSource {
  url: string;
  isM3U8: boolean;
  type?: string;
  quality?: string;
}

export interface StreamSubtitle {
  url: string;
  lang: string;
}

export interface StreamData {
  sources: StreamSource[];
  subtitles: StreamSubtitle[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface SearchResult {
  id: string;
  name: string;
  poster: string;
  jname?: string; // Japanese name might be available
}

export enum StreamServer {
  HD1 = 'hd-1',
  HD2 = 'hd-2',
  MEGACLOUD = 'megacloud',
  STREAMSB = 'streamsb',
}

export enum AudioType {
  SUB = 'sub',
  DUB = 'dub',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}