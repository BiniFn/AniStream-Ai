import { AudioType, StreamServer } from "./types";

export const APP_NAME = "AniStream";
export const JIKAN_API_BASE = "https://api.jikan.moe/v4";

// List of available API nodes for ghoshRitesh12/aniwatch-api
// We use CORS proxies (corsproxy.io) to avoid "Failed to fetch" errors in the browser
export const STREAM_API_NODES = [
  // Primary: Render instance (reliable but slow start) via Proxy
  "https://corsproxy.io/?https://aniwatch-api-v1-0.onrender.com/api/v2/hianime",
  // Secondary: Vercel instances via Proxy
  "https://corsproxy.io/?https://aniwatch-api-net.vercel.app/api/v2/hianime",
  "https://corsproxy.io/?https://hianime-api-chi.vercel.app/api/v2/hianime",
  "https://corsproxy.io/?https://api-aniwatch.onrender.com/api/v2/hianime",
  // Fallback: Direct (might work if server enables CORS)
  "https://aniwatch-api-v1-0.onrender.com/api/v2/hianime"
]; 

export const SERVER_OPTIONS = [
  { id: StreamServer.HD1, name: "HD-1 (VidCloud)" },
  { id: StreamServer.HD2, name: "HD-2 (VidStreaming)" },
  { id: StreamServer.MEGACLOUD, name: "MegaCloud" },
  { id: StreamServer.STREAMSB, name: "StreamSB" },
];

export const AUDIO_TYPES = [
  { id: AudioType.SUB, label: "Subtitles" },
  { id: AudioType.DUB, label: "Dubbed" },
];

export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Trending", path: "/trending" },
  { name: "Popular", path: "/popular" },
  { name: "Movies", path: "/movies" },
];