import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, rank }) => {
  return (
    <Link to={`/watch/${anime.mal_id}`} className="group relative block w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface">
      <img 
        src={anime.images.webp.large_image_url} 
        alt={anime.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-0 right-0 bg-primary/90 text-white font-bold text-lg px-3 py-1 rounded-bl-xl backdrop-blur-sm">
          #{rank}
        </div>
      )}

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
        <div className="bg-accent/90 p-4 rounded-full text-white backdrop-blur-sm shadow-lg shadow-accent/20">
          <Play fill="currentColor" className="w-8 h-8 ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-3 md:p-4">
        <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span>{anime.score || 'N/A'}</span>
          </div>
          <span>•</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase">{anime.type || 'TV'}</span>
          <span>•</span>
          <span>{anime.year || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
