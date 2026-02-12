import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import GeminiChat from '../components/GeminiChat';
import { fetchTopAnime, fetchSeasonNow } from '../services/animeService';
import { Anime } from '../types';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [seasonal, setSeasonal] = useState<Anime[]>([]);
  const [heroAnime, setHeroAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [topData, seasonalData] = await Promise.all([
          fetchTopAnime('airing'),
          fetchSeasonNow()
        ]);

        const validTopData = Array.isArray(topData) ? topData : [];
        const validSeasonalData = Array.isArray(seasonalData) ? seasonalData : [];

        setTrending(validTopData);
        setSeasonal(validSeasonalData);
        if (validTopData.length > 0) {
          setHeroAnime(validTopData[0]);
        }
      } catch (error) {
        console.error("Home data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      {heroAnime && <Hero anime={heroAnime} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Flame className="text-primary" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {trending.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} rank={index + 1} />
            ))}
          </div>
        </section>

        {/* Seasonal Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-secondary" />
              <h2 className="text-2xl font-bold text-white">New Releases</h2>
            </div>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
             {seasonal.slice(0, 10).map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>

      </div>
      <GeminiChat />
    </Layout>
  );
};

export default Home;
