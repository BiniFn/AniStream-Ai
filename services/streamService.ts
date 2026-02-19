import { STREAM_API_NODES } from "../constants";
import { SearchResult, StreamEpisode, StreamData, AudioType, StreamServer } from "../types";

// Helper to handle API responses with fallback nodes
const fetchJson = async <T>(endpoint: string): Promise<T | null> => {
  let has404 = false;
  let lastError = null;

  for (const base of STREAM_API_NODES) {
    try {
      // Construct URL: If base is a proxy (contains ?), simply append.
      // If endpoint starts with /, it usually works fine with the string concatenation.
      const url = `${base}${endpoint}`;
      
      // Timeout increased to 20s because proxies and cold starts can be slow
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); 
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          has404 = true;
          // Don't warn for 404s on search
          if (!endpoint.includes('/search')) {
             console.warn(`Node ${base} returned 404 for ${endpoint}`);
          }
        } else {
          console.warn(`Node ${base} returned ${response.status} for ${endpoint}`);
        }
        continue;
      }

      const json = await response.json();
      // Unpack data if wrapped in success/data object, otherwise return generic json
      return json.success ? json.data : json;
    } catch (error) {
      lastError = error;
      console.warn(`Connection to ${base} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }
  
  if (has404) {
    console.info(`Resource not found on any node: ${endpoint}`);
  } else {
    console.error(`All streaming API nodes failed for endpoint: ${endpoint}`, lastError);
  }
  
  return null;
};

export const searchStreamAnime = async (query: string): Promise<SearchResult | null> => {
  try {
    // API expects: /search?q=...
    const endpoint = `/search?q=${encodeURIComponent(query)}`;
    const data = await fetchJson<{ suggestions?: SearchResult[], animes?: SearchResult[] }>(endpoint);
    
    if (!data) return null;
    
    // The API might return 'animes' or 'suggestions'
    const results = data.animes || data.suggestions || [];
    
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error searching stream anime:", error);
    return null;
  }
};

export const fetchStreamEpisodes = async (animeId: string): Promise<StreamEpisode[]> => {
  try {
    // API expects: /anime/{id}/episodes
    const endpoint = `/anime/${animeId}/episodes`;
    const data = await fetchJson<{ episodes: StreamEpisode[], totalEpisodes: number }>(endpoint);
    
    const episodes = data?.episodes;
    
    return Array.isArray(episodes) ? episodes : [];
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
};

export const fetchStreamSources = async (
  episodeId: string, 
  server: StreamServer = StreamServer.HD1, 
  category: AudioType = AudioType.SUB
): Promise<StreamData | null> => {
  try {
    // API expects: /episode/sources?animeEpisodeId=...&server=...&category=...
    const endpoint = `/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${category}`;
    
    const data = await fetchJson<any>(endpoint);
    
    if (data && Array.isArray(data.sources)) {
        const isHlsSource = (source: any) => {
          const sourceType = String(source?.type || '').toLowerCase();
          const sourceUrl = String(source?.url || '').toLowerCase();
          return sourceType === 'm3u8' || sourceType === 'hls' || sourceUrl.includes('.m3u8');
        };

        return {
          sources: data.sources.map((s: any) => ({
             url: s.url,
             type: s.type,
             // API might not always provide reliable type metadata
             isM3U8: isHlsSource(s),
             quality: s.quality
          })),
          subtitles: data.tracks?.map((t: any) => ({
             url: t.file,
             lang: t.label || t.kind
          })) || [],
          intro: data.intro,
          outro: data.outro
        };
    }
    return null;
  } catch (error) {
    console.error("Error fetching sources:", error);
    return null;
  }
};
