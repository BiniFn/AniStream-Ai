import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimeCard from '../components/AnimeCard';
import { searchAnime } from '../services/animeService';
import { Anime } from '../types';
import { Search as SearchIcon } from 'lucide-react';

const Search: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchAnime(query).then(data => {
        setResults(data);
        setLoading(false);
      });
    }
  }, [query]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
        <div className="flex items-center gap-3 mb-8">
           <SearchIcon className="text-primary w-8 h-8" />
           <h1 className="text-3xl font-bold text-white">Results for "{query}"</h1>
        </div>

        {loading ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-surface animate-pulse rounded-xl"></div>
              ))}
           </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.map(anime => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No results found for "{query}"</p>
                <p className="text-gray-600 mt-2">Try searching for a different title.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
