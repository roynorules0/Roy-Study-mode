import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Settings, 
  Zap, 
  Flame, 
  Headphones, 
  MessageSquare, 
  Music, 
  Brain,
  Sparkles,
  Command,
  Play,
  Square,
  Activity,
  List
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../lib/utils';

type VoiceSpeed = 'slow' | 'normal' | 'fast';
type VoiceLanguage = 'hindi' | 'english' | 'hinglish';

interface VoiceProfile {
  id: string;
  name: string;
  lang: string;
  pitch: number;
  rate: number;
  personality: string;
  color: string;
  mood: string;
}

const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'hindi-mentor', name: 'Hindi Gurukul', lang: 'hi-IN', pitch: 1, rate: 0.9, personality: 'Wise, calm and paternal', color: 'text-amber-400', mood: 'Calm' },
  { id: 'hinglish-coach', name: 'Hinglish Buddy', lang: 'hi-IN', pitch: 1.1, rate: 1.1, personality: 'Energetic, modern and friendly', color: 'text-indigo-400', mood: 'Energetic' },
  { id: 'mentor', name: 'Global Mentor', lang: 'en-US', pitch: 1, rate: 0.9, personality: 'Wise and encouraging', color: 'text-sky-400', mood: 'Peaceful' },
  { id: 'hardcore', name: 'Discipline Coach', lang: 'en-GB', pitch: 0.8, rate: 1.2, personality: 'Strict and powerful', color: 'text-rose-400', mood: 'Aggressive' },
  { id: 'robot', name: 'Cyber Bot', lang: 'en-US', pitch: 0.5, rate: 0.8, personality: 'Futuristic and logical', color: 'text-emerald-400', mood: 'Analytical' },
];

import { GoogleGenAI } from '@google/genai';

const speedMultipliers = {
  slow: 0.7,
  normal: 1,
  fast: 1.3
};

export default function AIVoiceCoach() {
  const [isEnabled, setIsEnabled] = useLocalStorage('ai-voice-coach-enabled', false);
  const [selectedVoiceId, setSelectedVoiceId] = useLocalStorage('ai-voice-coach-selected', 'hindi-mentor');
  const [volume, setVolume] = useLocalStorage('ai-voice-coach-volume', 0.8);
  const [voiceSpeed, setVoiceSpeed] = useLocalStorage<VoiceSpeed>('ai-voice-coach-speed', 'normal');
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<VoiceLanguage>('ai-voice-coach-lang', 'hindi');
  const [frequency, setFrequency] = useLocalStorage('ai-voice-coach-frequency', 'medium');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanationInput, setExplanationInput] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [voiceHistory, setVoiceHistory] = useLocalStorage<{msg: string, time: number}[]>('ai-voice-coach-history', []);
  const [geminiApiKey] = useLocalStorage<string>('gemini-api-key', '');
  
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback((text: string) => {
    if (!isEnabled || !synthesisRef.current) return;
    
    // Cancel any existing speech
    synthesisRef.current.cancel();

    const profile = VOICE_PROFILES.find(p => p.id === selectedVoiceId) || VOICE_PROFILES[0];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a matching voice from the system
    const voices = synthesisRef.current.getVoices();
    
    // Priority: Select a voice that matches profile language exactly
    let targetVoice = voices.find(v => v.lang === profile.lang);
    
    // Fallback: Select any voice matching the language prefix (e.g., 'hi')
    if (!targetVoice) {
      targetVoice = voices.find(v => v.lang.startsWith(profile.lang.split('-')[0]));
    }

    if (targetVoice) utterance.voice = targetVoice;
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate * (speedMultipliers[voiceSpeed] || 1);
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    setLastMessage(text);
    setVoiceHistory(prev => [{ msg: text, time: Date.now() }, ...prev].slice(0, 10));
    synthesisRef.current.speak(utterance);
  }, [isEnabled, selectedVoiceId, volume, setVoiceHistory, voiceSpeed]);

  const generateExplanation = async (input?: string, mode: 'normal' | 'simplify' | 'step' = 'normal') => {
    const query = input || explanationInput;
    if (!query) return;

    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      speak("Pehle Settings me Gemini API Key set karo dost.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are "Roy AI Guru", a premium Hindi study mentor.
        Explain this concept: "${query}"
        Language: ${selectedLanguage}
        Mode: ${mode === 'simplify' ? 'Extremely simple terms for a beginner' : mode === 'step' ? 'Detailed step-by-step breakdown' : 'Detailed and motivational'}
        Requirements:
        1. Keep it professional but friendly.
        2. Use natural ${selectedLanguage === 'hinglish' ? 'Hinglish (mix of Hindi and English)' : selectedLanguage}.
        3. If in Hindi, use simple terms, don't be overly academic.
        4. Provide an explanation that is roughly 60-100 words.
        5. Start with a motivational hook.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const explanation = response.text || "Neural link unstable. Phir se try karo.";
      speak(explanation);
      if (!input) setExplanationInput("");
    } catch (error) {
      console.error("Mentor generation failed:", error);
      speak("Network issue ho gayee. Guru link disconnect ho gaya.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulated smart interruptions
  useEffect(() => {
    if (!isEnabled) return;

    const timer = setInterval(() => {
      const chance = Math.random();
      if (chance < 0.05) { // 5% chance every 2 mins for demo
        const lines = {
          hindi: [
             "Beta, focus banaye rakho. Boards paas aa rahe hain.",
             "Thodi der aur mehnat, phir break lena. Tum kar sakte ho!",
             "Concentration check! Padhai par dhyan do.",
             "Aaj ka target poora karke hi uthna. All the best!",
             "Revision bahut important hai, baar baar recall karo."
          ],
          english: [
            "Maintain your focus. Success is built on consistency.",
            "Deep work session in progress. Stay away from distractions.",
            "You are doing great. Keep pushing through the session.",
            "Your brain is at peak performance right now. Use it wisely.",
            "Remember your goal. Every minute counts toward your dream."
          ],
          hinglish: [
            "Focus maintain rakho 🔥, distractions avoid karo.",
            "Ab grind mode ⚡, session quality improve karo.",
            "Aaj streak dangerous ja raha hai 👑, rukna nahi hai!",
            "Memory retention optimize ho rahi hai, deep work continue karo.",
            "Break over, let's get back to the mission 🚀",
            "Your current focus score is legendary, keep it up!"
          ]
        };
        const currentLines = lines[selectedLanguage] || lines.hinglish;
        speak(currentLines[Math.floor(Math.random() * currentLines.length)]);
      }
    }, 120000);

    return () => clearInterval(timer);
  }, [isEnabled, speak, selectedLanguage]);

  const toggleCoach = () => {
    if (!isEnabled) {
      speak("Neural voice core initialized. Coach activated 🔥");
    } else {
      if (synthesisRef.current) synthesisRef.current.cancel();
    }
    setIsEnabled(!isEnabled);
  };

  const currentProfile = VOICE_PROFILES.find(p => p.id === selectedVoiceId) || VOICE_PROFILES[0];

  return (
    <div className="min-h-screen bg-black/90 p-4 sm:p-8 space-y-8 font-sans overflow-x-hidden pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={cn("absolute top-0 right-0 w-[600px] h-[600px] blur-[140px] rounded-full opacity-10 transition-colors duration-1000", currentProfile.color.replace('text', 'bg'))} />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center relative overflow-hidden group">
                <Headphones className="text-white relative z-10" size={24} />
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/10" 
                />
             </div>
             <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Voice Coach</h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] mt-2">AI Neural Companion • v5.0</p>
             </div>
          </div>
        </div>

        <button 
          onClick={toggleCoach}
          className={cn(
            "px-8 py-4 rounded-2xl flex items-center gap-4 border transition-all relative overflow-hidden",
            isEnabled 
              ? "bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20" 
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
          )}
        >
          {isEnabled ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
          <span className="text-xs font-black uppercase tracking-[0.2em]">{isEnabled ? "Coach Online" : "Activate Coach"}</span>
          {isEnabled && (
            <motion.div 
              layoutId="glow"
              className="absolute inset-0 bg-white/5 pointer-events-none"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8">
           {/* Neural Orb & Mentor Lab */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-10 rounded-[3rem] glass border border-white/10 bg-white/[0.01] relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[length:24px_24px]" />
                 </div>

                 {/* Neural Orb Visualization */}
                 <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    <AnimatePresence>
                       {isSpeaking && (
                         <>
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1.5, opacity: 0.2 }}
                             exit={{ scale: 0.8, opacity: 0 }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                             className={cn("absolute inset-0 rounded-full blur-3xl", currentProfile.color.replace('text', 'bg'))}
                           />
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1.2, opacity: 0.4 }}
                             exit={{ scale: 0.8, opacity: 0 }}
                             transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                             className={cn("absolute inset-0 rounded-full blur-2xl", currentProfile.color.replace('text', 'bg'))}
                           />
                         </>
                       )}
                    </AnimatePresence>

                    <motion.div 
                      animate={{ 
                        scale: isSpeaking ? [1, 1.1, 1] : [1, 1.05, 1],
                        rotate: 360
                      }}
                      transition={{ 
                        scale: { duration: 0.5, repeat: Infinity },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                      }}
                      className={cn(
                        "w-48 h-48 rounded-full border-4 border-dashed relative z-10 flex items-center justify-center",
                        currentProfile.color.replace('text', 'border'),
                        isSpeaking ? "opacity-100" : "opacity-40"
                      )}
                    >
                       <div className={cn("w-32 h-32 rounded-full glass border border-white/20 flex items-center justify-center shadow-2xl relative overflow-hidden")}>
                          <Brain className={cn("transition-all duration-500", isSpeaking ? "scale-125 " + currentProfile.color : "scale-100 text-white/20")} size={48} />
                          {isSpeaking && (
                            <motion.div 
                              animate={{ y: [-40, 40] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"
                            />
                          )}
                       </div>
                    </motion.div>
                    
                    {/* Floating Particles Around Orb */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20, 0],
                          x: [0, Math.sin(i) * 30, 0],
                          opacity: isSpeaking ? [0.2, 0.8, 0.2] : 0.1
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={cn("absolute w-1.5 h-1.5 rounded-full pointer-events-none", currentProfile.color.replace('text', 'bg'))}
                        style={{
                          left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                          top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                        }}
                      />
                    ))}
                 </div>

                 <div className="text-center space-y-6 max-w-lg relative z-10">
                    <AnimatePresence mode="wait">
                      {isSpeaking ? (
                        <motion.div 
                          key="speaking"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                           <div className={cn("text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-2", currentProfile.color)}>
                              <Sparkles size={12} fill="currentColor" />
                              Gurukul AI Transmitting...
                           </div>
                           <p className="text-lg font-black text-white italic leading-tight uppercase tracking-tighter">
                             "{lastMessage}"
                           </p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                           <div className="flex justify-center gap-3">
                              {['Hindi', 'English', 'Hinglish'].map(l => (
                                <span key={l} className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border", selectedLanguage.toLowerCase() === l.toLowerCase() ? "bg-white text-black border-white" : "border-white/10 text-white/20")}>
                                   {l}
                                </span>
                              ))}
                           </div>
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-loose">Mentor mode active • Awaiting neural query</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Mentor Lab Input */}
              <div className="p-10 rounded-[3rem] glass border border-white/10 bg-indigo-600/[0.02] flex flex-col justify-center space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                          <MessageSquare className="text-indigo-400" size={18} />
                       </div>
                       <div>
                          <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Ask Mentor Guru</h3>
                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Detailed step-by-step guidance</p>
                       </div>
                    </div>

                    <div className="relative">
                       <textarea 
                          value={explanationInput}
                          onChange={(e) => setExplanationInput(e.target.value)}
                          placeholder="Example: How project hierarchy works in React?"
                          className="w-full h-32 bg-white/5 rounded-3xl py-6 px-8 text-xs font-bold text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder:text-white/10 resize-none"
                       />
                       <button 
                         onClick={() => generateExplanation()}
                         className="absolute bottom-4 right-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                       >
                          {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={20} fill="currentColor" />}
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => generateExplanation(undefined, 'simplify')}
                      className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                    >
                       <Zap className="text-amber-400 mb-3" size={16} />
                       <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Simplify Concept</div>
                       <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Easier to understand</div>
                    </button>
                    <button 
                      onClick={() => generateExplanation(undefined, 'step')}
                      className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                    >
                       <List className="text-emerald-400 mb-3" size={16} />
                       <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Step-by-Step</div>
                       <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Deep logical flow</div>
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Natural Controls</span>
                       <div className="flex gap-2">
                          {['slow', 'normal', 'fast'].map(s => (
                            <button 
                              key={s}
                              onClick={() => setVoiceSpeed(s as VoiceSpeed)}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all",
                                voiceSpeed === s ? "bg-white text-black border-white" : "text-white/20 border-white/10"
                              )}
                            >
                               {s}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Voice History */}

           {/* Voice History */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-white/60">Voice Activity Log</h3>
                 <button 
                  onClick={() => setVoiceHistory([])}
                  className="text-[8px] font-black uppercase text-white/20 hover:text-rose-500 transition-colors"
                 >
                    Purge History
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {voiceHistory.slice(0, 6).map((h, i) => (
                   <motion.div 
                     key={h.time}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4 hover:bg-white/[0.04] transition-all group"
                   >
                      <div className="p-2.5 rounded-xl bg-white/5 text-white/20 group-hover:text-white/60 transition-colors">
                         <MessageSquare size={14} />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[11px] font-bold text-white/70 leading-relaxed uppercase tracking-tight line-clamp-2 italic">"{h.msg}"</p>
                         <span className="text-[8px] font-black opacity-20 uppercase">{new Date(h.time).toLocaleTimeString()}</span>
                      </div>
                   </motion.div>
                 ))}
                 {voiceHistory.length === 0 && (
                   <div className="col-span-full py-16 text-center text-[10px] font-black uppercase opacity-20 tracking-[0.5em] border-2 border-white/5 rounded-[3rem] border-dashed">
                      No Neural Trace Found
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Settings Panel */}
        <div className="lg:col-span-4 space-y-8">
           {/* Active Voice Selector */}
           <div className="p-8 rounded-[3rem] glass border border-white/10 bg-white/[0.02] space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black italic uppercase tracking-widest text-white">Mentor Personality</h3>
                 <Settings size={18} className="text-white/20" />
              </div>

              <div className="space-y-3">
                 {VOICE_PROFILES.map(profile => (
                   <button 
                     key={profile.id}
                     onClick={() => setSelectedVoiceId(profile.id)}
                     className={cn(
                       "w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between group",
                       selectedVoiceId === profile.id 
                         ? "bg-indigo-600/10 border-indigo-500/40" 
                         : "bg-white/5 border-white/5 hover:bg-white/10"
                     )}
                   >
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                           selectedVoiceId === profile.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white"
                         )}>
                            {profile.id === 'robot' ? <Zap size={18} /> : 
                             profile.id.includes('mentor') ? <Brain size={18} /> : 
                             profile.id.includes('coach') ? <Sparkles size={18} /> : 
                             profile.id === 'hardcore' ? <Flame size={18} /> : <Headphones size={18} />}
                         </div>
                         <div className="text-left">
                            <div className={cn("text-[11px] font-black italic tracking-tighter uppercase", selectedVoiceId === profile.id ? "text-white" : "text-white/60")}>
                               {profile.name}
                            </div>
                            <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">{profile.mood} • {profile.personality}</div>
                         </div>
                      </div>
                      {selectedVoiceId === profile.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />}
                   </button>
                 ))}
              </div>
           </div>

           {/* Preference Control */}
           <div className="p-8 rounded-[3rem] glass border border-white/5 bg-white/[0.01] space-y-8">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-white/40">Core Preferences</h3>
              
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Base Language</span>
                    </div>
                    <div className="flex gap-2 p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                        {[
                          { id: 'hindi', label: 'Hindi', icon: '🇮🇳' },
                          { id: 'english', label: 'English', icon: '🇺🇸' },
                          { id: 'hinglish', label: 'Hinglish', icon: '⚡' }
                        ].map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => setSelectedLanguage(lang.id as VoiceLanguage)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                              selectedLanguage === lang.id ? "bg-white text-black shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                          >
                            {lang.label}
                          </button>
                        ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Global Pacing</span>
                       <span className="text-xs font-black text-white">{voiceSpeed}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {['slow', 'normal', 'fast'].map(s => (
                         <button 
                           key={s}
                           onClick={() => setVoiceSpeed(s as VoiceSpeed)}
                           className={cn(
                             "py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all",
                             voiceSpeed === s ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/5 text-white/20"
                           )}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Master Volume</span>
                       <span className="text-xs font-black text-white">{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-3 mb-3">
                       <Brain size={16} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Guru Insight</span>
                    </div>
                    <p className="text-[9px] font-bold text-white/50 leading-relaxed uppercase italic">
                      "Dheere sun-nay se concept clarity boost hoti hai. Complex topics ke liye 'Slow' mode use karein."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
