import { JIKAN_API_BASE } from "../constants";
import { Anime, JikanResponse } from "../types";

// Helper for Jikan requests with rate limit handling
const fetchJikan = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${JIKAN_API_BASE}${endpoint}`);
    // Jikan returns 429 when rate limited. Return null to handle gracefully.
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Jikan API Error ${endpoint}:`, error);
    return null;
  }
};

export const fetchTopAnime = async (filter: string = 'airing'): Promise<Anime[]> => {
  const data = await fetchJikan<JikanResponse<Anime[]>>(`/top/anime?filter=${filter}&limit=10`);
  return data?.data || [];
};

export const fetchAnimeDetails = async (id: string): Promise<Anime | null> => {
  const data = await fetchJikan<{ data: Anime }>(`/anime/${id}`);
  return data?.data || null;
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  const data = await fetchJikan<JikanResponse<Anime[]>>(`/anime?q=${encodeURIComponent(query)}&limit=20`);
  return data?.data || [];
};

export const fetchSeasonNow = async (): Promise<Anime[]> => {
  const data = await fetchJikan<JikanResponse<Anime[]>>(`/seasons/now?limit=15`);
  return data?.data || [];
};