import { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Maximize2, 
  Minimize2, 
  Camera, 
  CameraOff, 
  Settings2, 
  Circle, 
  Square, 
  RectangleHorizontal, 
  Ghost,
  Move,
  ChevronDown,
  Scaling,
  Zap,
  AlertCircle
} from 'lucide-react';
import Human from '@vladmandic/human';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../lib/utils';

interface FocusCamProps {
  onFocusChange?: (isFocused: boolean) => void;
  onMetricsUpdate?: (metrics: FocusMetrics) => void;
  autoPause?: boolean;
}

export interface FocusMetrics {
  attentionScore: number;
  isFacePresent: boolean;
  isLookingAway: boolean;
  totalFocusedTime: number;
  distractionCount: number;
}

export interface CamLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  opacity: number;
  shape: 'circle' | 'square' | 'widescreen' | 'bubble';
  autoAdjust: boolean;
}

const HUMAN_CONFIG = {
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
  backend: 'webgl', // Force WebGL for stability in iframe environments
  face: {
    enabled: true,
    detector: { rotation: true, maxDetected: 1 },
    mesh: { enabled: true },
    iris: { enabled: true },
    emotion: { enabled: false },
    description: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
};

export default memo(function FocusCam({ onFocusChange, onMetricsUpdate }: FocusCamProps) {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const humanRef = useRef<Human | null>(null);

  const [layout, setLayout] = useLocalStorage<CamLayout>('focus-cam-layout', {
    width: 200,
    height: 150,
    x: 0,
    y: 0,
    opacity: 1,
    shape: 'widescreen',
    autoAdjust: true
  });

  const [metrics, setMetrics] = useState<FocusMetrics>({
    attentionScore: 100,
    isFacePresent: false,
    isLookingAway: false,
    totalFocusedTime: 0,
    distractionCount: 0
  });

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Use a ref callback to robustly attach the stream
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoElementRef.current = node;
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }
    }
  }, [stream]);

  // Detection logic
  useEffect(() => {
    let isCancelled = false;
    const human = new Human(HUMAN_CONFIG as any);
    humanRef.current = human;

    const initAndDetect = async () => {
      try {
        // Explicitly set backend and wait for it
        if (human.tf) {
          await human.tf.setBackend('webgl');
          await human.tf.ready();
        }
      } catch (e) {
        console.warn("Failed to set WebGL backend, falling back:", e);
      }
      detect();
    };

    const detect = async () => {
      if (isCancelled || !isActive || !videoElementRef.current || !humanRef.current || !videoElementRef.current.srcObject || videoElementRef.current.readyState < 2) {
         if (!isCancelled && isActive) requestAnimationFrame(detect);
         return;
      }

      try {
        const result = await humanRef.current.detect(videoElementRef.current);
        if (isCancelled) return;
        
        const face = result.face[0];
        const hasFace = !!face;
        
        let isLookingAway = false;
        let attentionScore = metricsRef.current.attentionScore;

        if (hasFace) {
          const rotation = face.rotation;
          if (rotation) {
            const { pitch, yaw } = rotation.angle;
            // Thresholds for looking away
            if (Math.abs(pitch) > 0.4 || Math.abs(yaw) > 0.5) {
              isLookingAway = true;
            }
          }
        }

        const isDistracted = !hasFace || isLookingAway;
        
        if (isDistracted) {
          attentionScore = Math.max(0, attentionScore - 2);
        } else {
          attentionScore = Math.min(100, attentionScore + 1);
        }

        setMetrics(prev => ({
          ...prev,
          isFacePresent: hasFace,
          isLookingAway: isLookingAway,
          attentionScore: attentionScore,
          totalFocusedTime: !isDistracted ? prev.totalFocusedTime + 1 : prev.totalFocusedTime,
          distractionCount: (isDistracted && prev.attentionScore > 90) ? prev.distractionCount + 1 : prev.distractionCount
        }));

        if (onMetricsUpdate) {
          onMetricsUpdate({
            ...metricsRef.current,
            isFacePresent: hasFace,
            isLookingAway: isLookingAway,
            attentionScore: attentionScore
          });
        }
        if (onFocusChange) onFocusChange(!isDistracted);
      } catch (err) {
        console.error("Detection error:", err);
      }

      if (!isCancelled && isActive) {
        setTimeout(() => {
          if (!isCancelled) requestAnimationFrame(detect);
        }, 1000); // Check once per second for performance and focus stability
      }
    };

    if (isActive) {
      initAndDetect();
    }

    return () => {
      isCancelled = true;
    };
  }, [isActive, onFocusChange, onMetricsUpdate]);

  // Robust playback handling
  useEffect(() => {
    const video = videoElementRef.current;
    if (isActive && video && stream) {
      const playVideo = async () => {
        try {
          if (video.paused) {
            await video.play();
          }
        } catch (e) {
          if (e instanceof Error && e.name !== 'AbortError') {
            console.error("Video play error:", e);
          }
        }
      };
      playVideo();
    }
  }, [isActive, stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user'
        },
        audio: false
      });
      setStream(s);
      setIsActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera permission required');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    // Auto-start camera with a 1.5s delay to ensure YouTube player is settled
    const timer = setTimeout(() => {
      startCamera();
    }, 1500);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  const toggleCam = () => {
    if (isActive) stopCamera();
    else startCamera();
  };

  const shapes = {
    circle: "rounded-full aspect-square",
    square: "rounded-[2rem] aspect-square",
    widescreen: "rounded-[2rem] aspect-video",
    bubble: "rounded-full w-20 h-20 sm:w-24 sm:h-24"
  };

  const handleDragEnd = (_: any, info: any) => {
    setLayout(prev => ({
      ...prev,
      x: prev.x + info.delta.x,
      y: prev.y + info.delta.y
    }));
  };

  const handleResize = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    e.stopPropagation();
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startWidth = layout.width;
    const startHeight = layout.height;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) newWidth = Math.max(50, Math.min(400, startWidth + deltaX));
      if (direction.includes('left')) newWidth = Math.max(50, Math.min(400, startWidth - deltaX));
      if (direction.includes('bottom')) newHeight = Math.max(50, Math.min(300, startHeight + deltaY));
      
      // Keep aspect ratio for widescreen
      if (layout.shape === 'widescreen') {
        newHeight = newWidth * (9/16);
      } else if (layout.shape === 'circle' || layout.shape === 'square') {
        newHeight = newWidth;
      }

      setLayout(prev => ({ ...prev, width: newWidth, height: newHeight }));
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: layout.x, y: layout.y }}
      animate={{ 
        width: isMinimized ? (layout.shape === 'bubble' ? 80 : 64) : layout.width,
        height: isMinimized ? (layout.shape === 'bubble' ? 80 : 64) : layout.height,
        opacity: layout.opacity,
        scale: isMinimized ? 0.8 : 1
      }}
      className={cn(
        "fixed z-[200] group pointer-events-none cursor-move",
        !layout.x && !layout.y && "bottom-24 right-6"
      )}
      onDoubleClick={() => setIsMinimized(!isMinimized)}
    >
      <div className={cn(
        "relative w-full h-full glass-modern border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-black pointer-events-auto transition-all duration-500 ease-out",
        shapes[layout.shape],
        isMinimized && "rounded-full aspect-square ring-2 ring-indigo-500/50 ring-offset-4 ring-offset-black"
      )}>
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div 
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 shadow-inner">
                <Camera size={24} />
              </div>
              {!isMinimized && layout.width > 120 && (
                <>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">Neural Vision</div>
                  <button 
                    onClick={startCamera}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
                      error 
                        ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
                        : "bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-500/20"
                    )}
                  >
                    {error ? "Retry Access" : "Activate Link"}
                  </button>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-rose-500"
                    >
                      <AlertCircle size={10} />
                      <p className="text-[7px] font-bold uppercase tracking-wider">{error}</p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key="active"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="relative w-full h-full bg-black flex items-center justify-center pointer-events-none"
            >
              <video 
                ref={setVideoRef} 
                autoPlay
                muted 
                playsInline 
                className="w-full h-full object-cover pointer-events-none"
                style={{ 
                  transform: 'scaleX(-1)',
                  WebkitTransform: 'scaleX(-1)',
                  filter: `brightness(${1.1}) contrast(1.1)`
                }}
              />
              {/* Scanline FX */}
              <div className="absolute inset-0 bg-scanlines opacity-[0.03] pointer-events-none" />
              
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                  <Zap className="text-indigo-500 animate-pulse" size={20} />
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Syncing...</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

         {/* Dynamic Status Indicator */}
        {isActive && !isMinimized && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2 z-20">
             {/* Energy Bar */}
             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${metrics.attentionScore}%` }}
                  className={cn(
                    "h-full transition-all duration-700",
                    metrics.attentionScore > 70 ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" : 
                    metrics.attentionScore > 30 ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : 
                    "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                  )}
                />
             </div>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5">
                   <div className={cn("w-1.5 h-1.5 rounded-full", metrics.isLookingAway ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} />
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-80">
                     {metrics.isLookingAway ? "Distracted" : "Locked In"}
                   </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/5">
                   <Zap size={10} className="text-amber-400" />
                   <span className="text-[8px] font-black">{Math.round(metrics.attentionScore)}%</span>
                </div>
             </div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button 
             onClick={() => setShowSettings(!showSettings)}
             className={cn("p-1.5 rounded-lg bg-black/60 text-white hover:bg-white/20", showSettings && "text-indigo-400")}
          >
            <Settings2 size={12} />
          </button>
          <button 
             onClick={() => setIsMinimized(!isMinimized)}
             className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button 
             onClick={toggleCam}
             className={`p-1.5 rounded-lg bg-black/60 ${isActive ? 'text-rose-400' : 'text-emerald-400'} hover:bg-white/20`}
          >
            {isActive ? <CameraOff size={12} /> : <Camera size={12} />}
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !isMinimized && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xl p-4 space-y-4 border-t border-white/10 z-30 overflow-y-auto max-h-[80%]"
            >
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Cam Layout</span>
                  <button onClick={() => setShowSettings(false)} className="text-white/40"><ChevronDown size={14} /></button>
               </div>

               {/* Size Slider */}
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                     <span>Scale</span>
                     <span className="text-indigo-400">{Math.round(layout.width)}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="400" 
                    value={layout.width}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      let h = val;
                      if (layout.shape === 'widescreen') h = val * (9/16);
                      setLayout({...layout, width: val, height: h});
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
               </div>

               {/* Opacity Slider */}
               <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                     <span>Ghost Mode</span>
                     <span className="text-indigo-400">{Math.round(layout.opacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="1" 
                    step="0.1"
                    value={layout.opacity}
                    onChange={(e) => setLayout({...layout, opacity: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
               </div>

               {/* Shapes */}
               <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'circle', icon: <Circle size={14} /> },
                    { id: 'square', icon: <Square size={14} /> },
                    { id: 'widescreen', icon: <RectangleHorizontal size={14} /> },
                    { id: 'bubble', icon: <Ghost size={14} /> }
                  ].map(shape => (
                    <button 
                      key={shape.id}
                      onClick={() => setLayout({...layout, shape: shape.id as any})}
                      className={cn(
                        "p-2 rounded-xl border transition-all flex items-center justify-center",
                        layout.shape === shape.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                      )}
                    >
                      {shape.icon}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resize Handle */}
        {!isMinimized && (
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-40 flex items-center justify-center opacity-0 group-hover:opacity-100"
            onMouseDown={(e) => handleResize(e, 'right-bottom')}
            onTouchStart={(e) => handleResize(e, 'right-bottom')}
          >
            <Scaling size={14} className="text-white/40 rotate-90" />
          </div>
        )}
      </div>

      {/* Floating Indicator */}
      {isMinimized && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border-2 border-black" />
      )}
    </motion.div>
  );
})

