import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import VideoPlayer from '../components/VideoPlayer';
import GeminiChat from '../components/GeminiChat';
import { fetchAnimeDetails } from '../services/animeService';
import { searchStreamAnime, fetchStreamEpisodes, fetchStreamSources } from '../services/streamService';
import { generateAnimeRecommendation } from '../services/geminiService';
import { Anime, StreamServer, AudioType, StreamEpisode, StreamSource, StreamSubtitle } from '../types';
import { SERVER_OPTIONS, AUDIO_TYPES } from '../constants';
import { Star, MessageSquare, List, Server, AlertTriangle, Loader2 } from 'lucide-react';

const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Data State
  const [anime, setAnime] = useState<Anime | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [episodeList, setEpisodeList] = useState<StreamEpisode[]>([]);
  
  // Player State
  const [currentEpisode, setCurrentEpisode] = useState<StreamEpisode | null>(null);
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [subtitles, setSubtitles] = useState<StreamSubtitle[]>([]);
  const [intro, setIntro] = useState<{start: number, end: number} | undefined>(undefined);
  const [outro, setOutro] = useState<{start: number, end: number} | undefined>(undefined);
  
  // UI State
  const [selectedServer, setSelectedServer] = useState<StreamServer>(StreamServer.HD1);
  const [selectedAudio, setSelectedAudio] = useState<AudioType>(AudioType.SUB);
  const [loading, setLoading] = useState(true);
  const [loadingSource, setLoadingSource] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // 1. Initial Load: Fetch Jikan Info & Search Streaming API
  useEffect(() => {
    if (!id) return;
    
    const init = async () => {
      setLoading(true);
      setErrorMsg('');
      
      const jikanData = await fetchAnimeDetails(id);
      
      if (jikanData) {
        setAnime(jikanData);
        
        // Parallel: AI Analysis + Search for Stream ID
        setAnalyzing(true);
        generateAnimeRecommendation(jikanData.title).then(res => {
           setAiAnalysis(res);
           setAnalyzing(false);
        });

        // Search for this anime in the streaming provider
        try {
          // Robust Search Strategy
          const cleanTitle = (t: string) => t.replace(/season \d+|2nd season|3rd season|4th season|part \d+|\(TV\)|:.*$/gi, "").trim();
          const sanitize = (t: string) => t.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
          
          const attempts = [
            jikanData.title_english,
            jikanData.title,
            cleanTitle(jikanData.title_english || ''),
            cleanTitle(jikanData.title),
            sanitize(jikanData.title),
            jikanData.title.split(':')[0],
          ].filter((t): t is string => !!t && t.length > 2);

          const uniqueAttempts = [...new Set(attempts)];
          
          let searchRes = null;

          for (const query of uniqueAttempts) {
             console.log(`Searching stream for: ${query}`);
             searchRes = await searchStreamAnime(query);
             if (searchRes) {
                 console.log(`Found match for "${query}":`, searchRes.name);
                 break;
             }
          }

          if (searchRes) {
             setStreamId(searchRes.id);
             // Fetch Episodes
             const episodes = await fetchStreamEpisodes(searchRes.id);
             setEpisodeList(episodes);
             if (episodes.length > 0) {
                // Try to find matching episode number from URL if we had one, otherwise 1
                setCurrentEpisode(episodes[0]); 
             } else {
                setErrorMsg("Episodes not available for this anime yet.");
             }
          } else {
             console.log("Anime not found in streaming DB after multiple attempts");
             setErrorMsg("Could not find this anime in the streaming database.");
          }
        } catch (e) {
          console.error("Stream setup failed", e);
          setErrorMsg("Failed to connect to streaming service.");
        }
      }
      setLoading(false);
    };

    init();
  }, [id]);

  // 2. Fetch Sources when Episode/Server/Audio changes
  useEffect(() => {
    if (!currentEpisode || !streamId) return;

    const loadSource = async () => {
       setLoadingSource(true);
       setSources([]); // Clear previous
       setSubtitles([]);
       setIntro(undefined);
       setOutro(undefined);
       setErrorMsg('');
       
       try {
          const data = await fetchStreamSources(currentEpisode.episodeId, selectedServer, selectedAudio);
          if (data && data.sources && data.sources.length > 0) {
             setSources(data.sources);
             setSubtitles(data.subtitles || []);
             setIntro(data.intro);
             setOutro(data.outro);
          } else {
             console.warn("No sources returned for server:", selectedServer);
             setErrorMsg(`No sources found on ${selectedServer}. Try a different server.`);
          }
       } catch (error) {
          console.error("Failed to load sources", error);
          setErrorMsg("Failed to load video sources.");
       }
       setLoadingSource(false);
    };

    loadSource();
  }, [currentEpisode, selectedServer, selectedAudio, streamId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400 animate-pulse">Initializing AniStream...</p>
        </div>
      </div>
    );
  }

  if (!anime) return <div className="text-white text-center mt-20">Anime not found</div>;

  return (
    <Layout>
      {/* Background blur */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
         <img src={anime.images.webp.large_image_url} className="w-full h-full object-cover blur-3xl" alt="" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{anime.title}</span>
            <span>/</span>
            <span className="text-primary">Ep {currentEpisode?.number || 1}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Player & Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player Container */}
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video">
               {loadingSource && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 className="w-10 h-10 text-primary animate-spin" />
                         <span className="text-sm text-gray-300 font-medium tracking-wide">Fetching Stream...</span>
                      </div>
                  </div>
               )}
               {errorMsg && !loadingSource && !sources.length && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                      <div className="text-center p-6">
                         <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                         <p className="text-white font-medium">{errorMsg}</p>
                         <p className="text-gray-400 text-sm mt-1">Try switching servers (e.g. MegaCloud).</p>
                      </div>
                  </div>
               )}
               <VideoPlayer 
                  sources={sources} 
                  subtitles={subtitles}
                  intro={intro}
                  outro={outro}
                  poster={anime.images.webp.large_image_url}
                  autoplay={true}
               />
            </div>
            
            {/* Controls Bar */}
            <div className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Auto Play</span>
                      <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary rounded-full shadow-sm" />
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Auto Next</span>
                      <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-gray-400 rounded-full shadow-sm" />
                      </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                   {AUDIO_TYPES.map(type => (
                       <button
                          key={type.id}
                          onClick={() => setSelectedAudio(type.id)}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedAudio === type.id ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                       >
                           {type.label}
                       </button>
                   ))}
               </div>
            </div>

            {/* Anime Info */}
            <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{anime.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {anime.score}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded">{anime.year}</span>
                    <span>{anime.status}</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {anime.synopsis}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {anime.genres && anime.genres.map(genre => (
                        <span key={genre.name} className="px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 cursor-pointer">
                            {genre.name}
                        </span>
                    ))}
                </div>
            </div>

             {/* AI Analysis Section */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="text-primary w-5 h-5" />
                    <h3 className="font-bold text-white">AI Assistant Insights</h3>
                </div>
                {analyzing ? (
                     <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                     </div>
                ) : (
                    <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                        {aiAnalysis}
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Servers & Episodes */}
          <div className="space-y-6">
            
            {/* Servers */}
            <div className="bg-surface border border-white/5 rounded-xl p-4">
               <div className="flex items-center gap-2 mb-3 text-gray-300 text-sm font-medium">
                   <Server size={16} />
                   <span>Select Server</span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                   {SERVER_OPTIONS.map(server => (
                       <button
                          key={server.id}
                          onClick={() => setSelectedServer(server.id)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${selectedServer === server.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-black/40 text-gray-400 hover:bg-white/5'}`}
                       >
                           {server.name}
                       </button>
                   ))}
               </div>
            </div>

            {/* Episodes */}
            <div className="bg-surface border border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List size={18} className="text-gray-400" />
                        <span className="font-bold text-white">Episodes</span>
                    </div>
                    <span className="text-xs text-gray-500">{currentEpisode?.number || '?'}/{episodeList.length || anime.episodes}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {episodeList && episodeList.length > 0 ? (
                        episodeList.map(ep => (
                            <button
                               key={ep.episodeId}
                               onClick={() => setCurrentEpisode(ep)}
                               className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentEpisode?.episodeId === ep.episodeId ? 'bg-white/10 text-primary border-l-2 border-primary' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <span className="text-sm font-mono opacity-50">{ep.number.toString().padStart(2, '0')}</span>
                                <div className="text-left flex-1 truncate">
                                    <span className={`text-sm block truncate ${currentEpisode?.episodeId === ep.episodeId ? 'font-bold' : 'font-medium'}`}>
                                        {ep.title || `Episode ${ep.number}`}
                                    </span>
                                    {ep.isFiller && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 rounded uppercase">Filler</span>}
                                </div>
                                {currentEpisode?.episodeId === ep.episodeId && <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />}
                            </button>
                        ))
                    ) : (
                        // Fallback if no streams found but anime exists (shows simple list)
                        Array.from({length: anime.episodes || 12}).map((_, i) => (
                           <div key={i} className="p-4 text-center text-sm text-gray-500">
                               {streamId ? 'Loading episodes...' : 'Streams unavailable for this title.'}
                           </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
               <p className="text-xs text-yellow-200/80 leading-relaxed">
                  Note: This uses free API nodes which sleep when inactive. If loading takes time, please wait 15-20s for the server to wake up.
               </p>
            </div>

          </div>
        </div>
      </div>
      <GeminiChat />
    </Layout>
  );
};

export default Watch;