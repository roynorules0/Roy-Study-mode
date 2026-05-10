import { useState, useEffect } from 'react';
import { Search, Loader2, Play, Bookmark, Clock, ArrowRight, Headphones, Trash2, X, RotateCcw, ListPlus, FolderPlus, ChevronRight, Hash, Library, Plus } from 'lucide-react';
import { YouTubeVideo, VideoPlaylist, WatchHistory, HistoryItem } from '../../types';
import { searchVideos } from '../../services/youtube';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VideoPlayerView from './VideoPlayerView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface YouTubeStudyProps {
  apiKey: string;
  timeLeft: number;
  onResume: () => void;
  onPause: () => void;
  timerActive: boolean;
  onLectureStart?: () => void;
}

export default function YouTubeStudy({ apiKey, timeLeft, onResume, onPause, timerActive, onLectureStart }: YouTubeStudyProps) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [activeView, setActiveView] = useState<'search' | 'playlists' | 'history'>('search');
  
  const [history, setHistory] = useLocalStorage<YouTubeVideo[]>('study-video-history', []);
  const [videoProgress, setVideoProgress] = useLocalStorage<Record<string, WatchHistory>>('study-video-progress', {});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistSubject, setNewPlaylistSubject] = useState("");
  const [addingToPlaylist, setAddingToPlaylist] = useState<YouTubeVideo | null>(null);

  const [playlists, setPlaylists] = useLocalStorage<VideoPlaylist[]>('study-playlists', [
    { id: 'biology', name: 'Biology Basics', subject: 'Biology', videos: [] },
    { id: 'chemistry', name: 'Organic Chemistry', subject: 'Chemistry', videos: [] },
    { id: 'physics', name: 'Classical Mechanics', subject: 'Physics', videos: [] },
  ]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!apiKey) {
      setError("Please add YouTube API Key in Settings first.");
      return;
    }
    setLoading(true);
    setError(null);
    setActiveView('search');
    try {
      const results = await searchVideos(query, apiKey);
      setVideos(results);
    } catch (err: any) {
      setError(err.message || "Failed to fetch videos.");
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim() || !newPlaylistSubject.trim()) return;
    const newPlaylist: VideoPlaylist = {
      id: crypto.randomUUID(),
      name: newPlaylistName,
      subject: newPlaylistSubject,
      videos: []
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName("");
    setNewPlaylistSubject("");
    setShowCreatePlaylist(false);
  };

  const toggleVideoInPlaylist = (playlistId: string, video: YouTubeVideo) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const exists = p.videos.some(v => v.id === video.id);
        if (exists) {
          return { ...p, videos: p.videos.filter(v => v.id !== video.id) };
        } else {
          return { ...p, videos: [...p.videos, video] };
        }
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (selectedPlaylistId === playlistId) setSelectedPlaylistId(null);
  };

  const playlistsBySubject = playlists.reduce((acc, p) => {
    if (!acc[p.subject]) acc[p.subject] = [];
    acc[p.subject].push(p);
    return acc;
  }, {} as Record<string, VideoPlaylist[]>);

  const playVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    if (onLectureStart) onLectureStart();
    setHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      return [video, ...filtered].slice(0, 15);
    });
  };

  const removeHistoryItem = (e: any, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(v => v.id !== id));
    // Also remove progress to keep storage clean
    setVideoProgress(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setVideoProgress({});
    setShowClearConfirm(false);
  };

  const getProgressPercent = (videoId: string) => {
    const progress = videoProgress[videoId];
    if (!progress || !progress.totalDurationAtLastSave) return 0;
    return (progress.lastTimestamp / progress.totalDurationAtLastSave) * 100;
  };

  const getFormattedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (selectedVideo) {
    return (
      <VideoPlayerView 
        video={selectedVideo} 
        timeLeft={timeLeft} 
        onResume={onResume}
        onPause={onPause}
        timerActive={timerActive}
        onBack={() => setSelectedVideo(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Headphones size={20} className="text-red-500" /> YouTube Study
          </h2>
          <p className="text-sm opacity-60 mt-1">Focused study environment.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl glass">
          {[
            { id: 'search', label: 'Search', icon: Search },
            { id: 'playlists', label: 'Playlists', icon: Library },
            { id: 'history', label: 'History', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveView(tab.id as any);
                setSelectedPlaylistId(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeView === tab.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "opacity-50 hover:opacity-100"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence>
        {/* Create Playlist Modal */}
        {showCreatePlaylist && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass p-6 rounded-[2rem] space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Create New Playlist</h3>
                <button onClick={() => setShowCreatePlaylist(false)} className="p-2 opacity-50 hover:opacity-100"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mathematics, History..." 
                    value={newPlaylistSubject}
                    onChange={(e) => setNewPlaylistSubject(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl glass outline-none focus:ring-2 ring-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase opacity-40 ml-1">Playlist Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Calculus II, WWII Lectures..." 
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl glass outline-none focus:ring-2 ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={createPlaylist}
                className="w-full h-12 bg-indigo-500 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
              >
                Create Playlist
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Add to Playlist Overlay */}
        {addingToPlaylist && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass p-6 rounded-[2rem] space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Add to Playlist</h3>
                  <p className="text-[10px] opacity-50 font-bold uppercase truncate max-w-[250px]">{addingToPlaylist.title}</p>
                </div>
                <button onClick={() => setAddingToPlaylist(null)} className="p-2 opacity-50 hover:opacity-100"><X size={20} /></button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {playlists.length === 0 && <p className="text-center py-8 opacity-40 text-sm italic">No playlists found. Create one first.</p>}
                {playlists.map(p => {
                  const isInPlaylist = p.videos.some(v => v.id === addingToPlaylist.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleVideoInPlaylist(p.id, addingToPlaylist)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                        isInPlaylist ? "bg-indigo-500/20 border-indigo-500/40 border ring-1 ring-indigo-500/20" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold">{p.name}</div>
                        <div className="text-[10px] opacity-50 uppercase font-black">{p.subject} • {p.videos.length} videos</div>
                      </div>
                      {isInPlaylist ? <Bookmark size={18} fill="currentColor" className="text-indigo-500" /> : <Plus size={18} />}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => { setAddingToPlaylist(null); setShowCreatePlaylist(true); }}
                className="w-full h-12 glass border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-white/5"
              >
                <FolderPlus size={16} /> Create New Playlist
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Search Bar (Only shown in search or if active) */}
        {activeView === 'search' && (
          <div className="relative">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search lectures (e.g. Physics Newton's Laws)..."
              className="w-full h-14 pl-12 pr-12 rounded-2xl glass focus:ring-2 ring-indigo-500 transition-all outline-none text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform font-bold text-xs gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>Refine <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === 'search' && (
            <motion.section 
              key="search-view"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video, idx) => (
                  <motion.div 
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <div onClick={() => playVideo(video)} className="cursor-pointer">
                      <div className="aspect-video rounded-3xl glass overflow-hidden relative mb-3">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-3 right-3 p-2 rounded-xl glass text-white backdrop-blur-3xl">
                          <Play size={16} fill="white" />
                        </div>
                        {getProgressPercent(video.id) > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
                            <div className="h-full bg-indigo-500" style={{ width: `${getProgressPercent(video.id)}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="px-1">
                        <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{video.title}</h4>
                        <div className="flex items-center gap-2 mt-2 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                          <span>{video.channelTitle}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setAddingToPlaylist(video)}
                      className="absolute top-2 right-2 p-2 rounded-xl glass bg-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500 hover:text-white"
                      title="Add to playlist"
                    >
                      <ListPlus size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
              {videos.length === 0 && !loading && (
                <div className="p-16 text-center glass rounded-[2.5rem] opacity-30">
                  <Search size={40} className="mx-auto mb-4" />
                  <p className="text-sm">Search for your study topics above.</p>
                </div>
              )}
            </motion.section>
          )}

          {activeView === 'playlists' && (
            <motion.section 
              key="playlists-view"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {selectedPlaylistId ? (
                // Single Playlist View
                <div className="space-y-4">
                  {(() => {
                    const playlist = playlists.find(p => p.id === selectedPlaylistId);
                    if (!playlist) return null;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setSelectedPlaylistId(null)} className="flex items-center gap-2 text-xs font-bold opacity-50 hover:opacity-100 transition-all">
                            <ArrowRight size={14} className="rotate-180" /> Back to Playlists
                          </button>
                          <button onClick={() => deletePlaylist(playlist.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="py-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">{playlist.subject}</div>
                          <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">{playlist.name}</h3>
                          <div className="text-xs opacity-50 font-bold mt-1 uppercase">{playlist.videos.length} Lectures saved</div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {playlist.videos.map(video => (
                            <div key={video.id} className="group relative glass p-3 rounded-2xl flex gap-4 transition-all hover:bg-white/5 cursor-pointer" onClick={() => playVideo(video)}>
                              <div className="w-24 aspect-video rounded-xl overflow-hidden shrink-0 relative">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={16} fill="white" className="text-white" />
                                </div>
                              </div>
                              <div className="flex flex-col justify-center gap-1 min-w-0 pr-6">
                                <h4 className="text-[11px] font-bold uppercase leading-tight line-clamp-2 tracking-tight">{video.title}</h4>
                                <p className="text-[10px] opacity-40 font-black uppercase truncate">{video.channelTitle}</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleVideoInPlaylist(playlist.id, video); }}
                                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-rose-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {playlist.videos.length === 0 && (
                            <div className="col-span-full py-12 text-center opacity-30 italic text-sm">
                              This playlist is empty. Add some videos from search!
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                // Subject List View
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Your Collections</h3>
                    <button 
                      onClick={() => setShowCreatePlaylist(true)}
                      className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/10 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <Plus size={14} /> New Playlist
                    </button>
                  </div>
                  
                  {Object.entries(playlistsBySubject).map(([subject, subjectPlaylists]) => (
                    <div key={subject} className="space-y-4">
                      <div className="flex items-center gap-2 opacity-50">
                        <Hash size={14} className="text-indigo-500" />
                        <h4 className="text-xs font-bold uppercase tracking-widest">{subject}</h4>
                        <div className="h-[1px] flex-1 bg-white/5 ml-2" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectPlaylists.map(playlist => (
                          <div 
                            key={playlist.id}
                            onClick={() => setSelectedPlaylistId(playlist.id)}
                            className="bg-white/5 rounded-[2rem] border border-white/5 p-5 cursor-pointer hover:bg-white/10 hover:border-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 group relative"
                          >
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <Library size={20} />
                            </div>
                            <h4 className="text-base font-bold italic uppercase tracking-tighter mb-1 line-clamp-1">{playlist.name}</h4>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-[10px] font-black uppercase opacity-40">{playlist.videos.length} Lectures</span>
                              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {playlists.length === 0 && (
                    <div className="p-16 text-center glass rounded-[2.5rem] opacity-30">
                      <Library size={40} className="mx-auto mb-4" />
                      <p className="text-sm">Start by creating a playlist for a subject.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          )}

          {activeView === 'history' && (
            <motion.section 
              key="history-view"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold opacity-40 uppercase tracking-widest">Recent Activity</h3>
                {history.length > 0 && (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-500 px-3 py-1 bg-rose-500/5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map(video => {
                  const percent = getProgressPercent(video.id);
                  return (
                    <div 
                      key={video.id}
                      className="group relative glass rounded-2xl overflow-hidden cursor-pointer hover:border-white/10 transition-colors flex gap-4 p-3"
                    >
                      <div className="w-28 aspect-video rounded-xl overflow-hidden shrink-0 relative" onClick={() => playVideo(video)}>
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play fill="white" className="text-white" size={18} />
                        </div>
                        {percent > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                            <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-0.5 pr-10 overflow-hidden">
                        <div onClick={() => playVideo(video)}>
                          <h4 className="text-xs font-bold line-clamp-2 leading-tight uppercase tracking-tight opacity-90 group-hover:text-indigo-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="text-[10px] opacity-40 font-bold uppercase mt-1 truncate">{video.channelTitle}</div>
                        </div>
                        {percent > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[9px] font-bold opacity-50">{Math.floor(percent)}%</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button 
                          onClick={() => setAddingToPlaylist(video)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 glass bg-white/10 hover:bg-indigo-500 transition-all active:scale-95"
                        >
                          <ListPlus size={14} />
                        </button>
                        <button 
                          onClick={(e) => removeHistoryItem(e, video.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-500 transition-all active:scale-90"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {history.length === 0 && (
                <div className="p-16 text-center glass rounded-[2.5rem] opacity-30">
                  <Clock size={40} className="mx-auto mb-4" />
                  <p className="text-sm">Your study sessions will appear here.</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="p-6 rounded-3xl glass border border-rose-500/20 bg-rose-500/5 text-center space-y-4 max-w-sm w-full">
              <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">Clear all study history?</p>
              <div className="flex gap-3">
                <button 
                  onClick={clearHistory}
                  className="flex-1 h-12 rounded-xl bg-rose-500 text-white font-bold"
                >
                  Clear Everything
                </button>
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
