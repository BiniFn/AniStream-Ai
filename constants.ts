import { AudioType, StreamServer } from "./types";

export const APP_NAME = "AniStream";
export const JIKAN_API_BASE = "https://api.jikan.moe/v4";

// Stream API nodes are configurable so this frontend can be wired to any
// compatible AniWatch/Hianime backend (including self-hosted forks).
//
// Example .env value:
// VITE_STREAM_API_NODES=https://my-api.example.com/api/v2/hianime,https://fallback.example.com/api/v2/hianime
//
// If no env value is provided, we keep a conservative fallback list.
const envNodes = (import.meta.env.VITE_STREAM_API_NODES || "")
  .split(",")
  .map((node: string) => node.trim())
  .filter(Boolean);

export const STREAM_API_NODES = envNodes.length > 0
  ? envNodes
  : [
      "https://aniwatch-api-v1-0.onrender.com/api/v2/hianime",
      "https://aniwatch-api-net.vercel.app/api/v2/hianime",
      "https://hianime-api-chi.vercel.app/api/v2/hianime",
      "https://api-aniwatch.onrender.com/api/v2/hianime",
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
  { name: "Search", path: "/search" },
];
