import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, RotateCcw, Volume2, Maximize, Settings, Subtitles, SkipForward, Layers } from 'lucide-react';
import { StreamSource, StreamSubtitle } from '../types';

interface VideoPlayerProps {
  sources?: StreamSource[];
  subtitles?: StreamSubtitle[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  poster?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ sources, subtitles, intro, outro, poster, autoplay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isError, setIsError] = useState(false);
  const [qualities, setQualities] = useState<{height: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 is Auto
  const [showSettings, setShowSettings] = useState(false);
  const [canSkipIntro, setCanSkipIntro] = useState(false);
  const [canSkipOutro, setCanSkipOutro] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying && !showSettings) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
         if (isPlaying && !showSettings) setShowControls(false);
      });
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying, showSettings]);

  // Check for Intro/Outro
  useEffect(() => {
    if (!intro && !outro) {
        setCanSkipIntro(false);
        setCanSkipOutro(false);
        return;
    }
    
    const checkSkip = () => {
        if (intro && currentTime >= intro.start && currentTime < intro.end) {
            setCanSkipIntro(true);
        } else {
            setCanSkipIntro(false);
        }

        if (outro && currentTime >= outro.start && currentTime < outro.end) {
            setCanSkipOutro(true);
        } else {
            setCanSkipOutro(false);
        }
    };

    checkSkip();
  }, [currentTime, intro, outro]);

  // Initialize Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sources || sources.length === 0) return;

    // Find M3U8 source preferred
    const m3u8Source = sources.find(s => s.isM3U8) || sources[0];
    
    setIsError(false);
    setQualities([]);

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      
      const hls = new Hls({
        xhrSetup: function(xhr, url) {
           xhr.withCredentials = false;
        }
      });
      hlsRef.current = hls;
      
      hls.loadSource(m3u8Source.url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((l, i) => ({ height: l.height, level: i }));
        // Filter out duplicates and sort
        const uniqueLevels = levels.filter((v, i, a) => a.findIndex(t => t.height === v.height) === i).sort((a, b) => b.height - a.height);
        setQualities(uniqueLevels);
        if (autoplay) video.play().catch(() => console.log("Autoplay blocked"));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           console.error("HLS Fatal Error", data);
           if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
               hls.startLoad(); // Try to recover
           } else {
               setIsError(true);
           }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari support
      video.src = m3u8Source.url;
      if (autoplay) video.play();
    } else {
      setIsError(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [sources, autoplay]);

  // Handle Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  const changeQuality = (level: number) => {
      if (hlsRef.current) {
          hlsRef.current.currentLevel = level;
          setCurrentQuality(level);
          setShowSettings(false);
      }
  };

  const skipTime = (seconds: number) => {
     if (videoRef.current) {
         videoRef.current.currentTime += seconds;
     }
  };

  const skipTo = (time: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime = time;
      }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!sources && !poster) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl ring-1 ring-white/10"
      onMouseLeave={() => setShowSettings(false)}
    >
      {!sources ? (
        // Placeholder state
        <div className="absolute inset-0 flex items-center justify-center">
            <img src={poster} className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="z-10 bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                <p className="text-white font-medium">Select an episode to start streaming</p>
            </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={poster}
            crossOrigin="anonymous"
            onClick={togglePlay}
          >
            {subtitles?.map((sub, idx) => (
               <track 
                 key={idx} 
                 kind="subtitles" 
                 label={sub.lang} 
                 src={sub.url} 
                 default={sub.lang.toLowerCase().includes('english')} 
               />
            ))}
          </video>

          {/* Error State */}
          {isError && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                <div className="text-center p-6 bg-red-900/20 border border-red-500/50 rounded-xl">
                   <p className="text-red-400 font-bold mb-2">Stream Error</p>
                   <p className="text-gray-300 text-sm">Could not load this source. Try a different server.</p>
                </div>
             </div>
          )}

          {/* Skip Intro/Outro Button */}
          {(canSkipIntro || canSkipOutro) && (
              <button 
                  onClick={() => canSkipIntro && intro ? skipTo(intro.end) : (outro ? skipTo(outro.end) : null)}
                  className="absolute bottom-20 left-4 z-30 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 animate-fade-in"
              >
                  <SkipForward size={16} fill="currentColor" />
                  {canSkipIntro ? 'Skip Intro' : 'Skip Outro'}
              </button>
          )}

          {/* Custom Controls */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Progress Bar */}
            <div 
                className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) videoRef.current.currentTime = pos * duration;
                }}
            >
              <div 
                className="h-full bg-primary rounded-full relative" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg scale-0 group-hover/progress:scale-100 transition-all" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                  {isPlaying ? (
                    <div className="w-5 h-5 border-l-4 border-r-4 border-white mx-1" /> // Pause Icon custom
                  ) : (
                    <Play fill="currentColor" size={24} />
                  )}
                </button>
                
                <button onClick={() => skipTime(-10)} className="text-white hover:text-primary transition-colors">
                   <RotateCcw size={20} />
                </button>

                <div className="flex items-center gap-2 group/vol">
                   <Volume2 size={20} className="text-white" />
                   <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                      <input 
                        type="range" 
                        min="0" max="1" step="0.1" 
                        value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
                        }}
                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                   </div>
                </div>

                <span className="text-xs font-mono text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-white relative">
                 {/* Quality Selector */}
                 {qualities.length > 0 && (
                     <div className="relative">
                        <button 
                            onClick={() => setShowSettings(!showSettings)} 
                            className={`hover:text-primary transition-colors ${showSettings ? 'text-primary' : ''}`}
                            title="Quality"
                        >
                            <Settings size={20} />
                        </button>
                        {showSettings && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg p-2 min-w-[120px] backdrop-blur-md shadow-xl animate-fade-in-up">
                                <p className="text-xs text-gray-400 mb-2 px-2 uppercase font-bold">Quality</p>
                                <button 
                                    onClick={() => changeQuality(-1)}
                                    className={`w-full text-left px-2 py-1.5 rounded text-sm ${currentQuality === -1 ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                >
                                    Auto
                                </button>
                                {qualities.map((q) => (
                                    <button 
                                        key={q.level}
                                        onClick={() => changeQuality(q.level)}
                                        className={`w-full text-left px-2 py-1.5 rounded text-sm ${currentQuality === q.level ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {q.height}p
                                    </button>
                                ))}
                            </div>
                        )}
                     </div>
                 )}

                 <button title="Subtitles" className="hover:text-primary transition-colors">
                    <Subtitles size={20} />
                 </button>
                 <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
                    <Maximize size={20} />
                 </button>
              </div>
            </div>
          </div>
          
          {/* Big Center Play Button */}
          {!isPlaying && !isError && (
             <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
             >
                <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center pl-1 text-white shadow-xl shadow-primary/30 hover:scale-110 transition-transform">
                   <Play fill="currentColor" size={32} />
                </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;