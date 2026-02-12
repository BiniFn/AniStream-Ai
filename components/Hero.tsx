import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Calendar, Star } from 'lucide-react';
import { Anime } from '../types';

interface HeroProps {
  anime: Anime;
}

const Hero: React.FC<HeroProps> = ({ anime }) => {
  if (!anime) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={anime.images.webp.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover opacity-60 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 flex items-end md:items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-0">
        <div className="w-full md:w-2/3 lg:w-1/2 space-y-6">
          <div className="flex items-center gap-2 text-primary font-medium tracking-wider text-sm uppercase animate-fade-in">
            #{anime.rank || 1} Trending
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight line-clamp-2">
            {anime.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={16} fill="currentColor" />
              <span className="font-bold text-white">{anime.score}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{anime.year}</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-xs">
              {anime.rating?.split(' ')[0] || 'PG-13'}
            </div>
            <div className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 text-xs font-semibold">
              HD
            </div>
          </div>

          <p className="text-gray-400 line-clamp-3 md:line-clamp-4 text-sm md:text-base leading-relaxed max-w-xl">
            {anime.synopsis}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Link 
              to={`/watch/${anime.mal_id}`}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Play fill="currentColor" size={20} />
              Watch Now
            </Link>
            <Link
              to={`/watch/${anime.mal_id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-md"
            >
              <Info size={20} />
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
