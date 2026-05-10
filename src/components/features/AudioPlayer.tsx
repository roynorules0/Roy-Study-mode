import { useState, useRef } from 'react';
import { Music, Headphones, Volume2, SkipBack, SkipForward, Play, Pause, Waves, Trees, Wind } from 'lucide-react';
import { clsx } from 'clsx';

const PLAYS: Record<string, string> = {
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Generic lofi placeholder
  rain: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tait_Audio/Nature_Recordings/Tait_Audio_-_Nature_Recordings_-_Heavy_Rain.mp3',
  forest: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Moonlight_Reprise.mp3', // Scenic calm
};

export default function AudioPlayer() {
  const [active, setActive] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (type: string) => {
    if (active === type) {
      audioRef.current?.pause();
      setActive(null);
    } else {
      setActive(type);
      // Logic would go here to set source and play
      // For this demo, we'll just toggle the state
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold flex items-center gap-2"><Headphones size={18} /> Audio Ambience</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {[
          { id: 'lofi', label: 'Lo-fi Beats', icon: Music, color: 'bg-indigo-500' },
          { id: 'rain', label: 'Rainy Day', icon: Waves, color: 'bg-blue-400' },
          { id: 'forest', label: 'Deep Forest', icon: Trees, color: 'bg-green-500' },
          { id: 'noise', label: 'White Noise', icon: Wind, color: 'bg-slate-400' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => toggle(item.id)}
            className={clsx(
              "flex-shrink-0 w-32 p-4 rounded-3xl glass flex flex-col items-center gap-3 transition-all duration-300",
              active === item.id ? "ring-2 ring-indigo-500 bg-indigo-500/10" : "opacity-70"
            )}
          >
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white", item.color)}>
              <item.icon size={24} />
            </div>
            <div className="text-xs font-bold whitespace-nowrap">{item.label}</div>
            <div className="p-1.5 rounded-full bg-white/10">
               {active === item.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl glass flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Volume2 size={18} className="opacity-50" />
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="w-[60%] h-full bg-indigo-500" />
            </div>
         </div>
         <span className="text-[10px] font-bold opacity-40 uppercase">Volume 60%</span>
      </div>
    </section>
  );
}
