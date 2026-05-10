import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, Camera, CameraOff } from 'lucide-react';
import Human from '@vladmandic/human';

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

const HUMAN_CONFIG = {
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
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
  const [error, setError] = useState<string | null>(null);
  const humanRef = useRef<Human | null>(null);

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

    const detect = async () => {
      if (isCancelled || !isActive || !videoElementRef.current || !humanRef.current || !videoElementRef.current.srcObject) {
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
      detect();
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

  return (
    <motion.div 
      drag
      dragMomentum={false}
      initial={{ x: 0, y: 0 }}
      className={`fixed bottom-24 right-6 z-[999999] group ${isMinimized ? 'w-16 h-16' : 'w-48 sm:w-64 aspect-video'} transition-all pointer-events-none`}
    >
      <div className="relative w-full h-full rounded-[2rem] glass border border-white/20 overflow-hidden shadow-2xl backdrop-blur-3xl bg-black pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div 
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400">
                <Camera size={20} />
              </div>
              {!isMinimized && (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Ready to Study</div>
                  <button 
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-indigo-500 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Enable Focus Cam
                  </button>
                  {error && <p className="text-[8px] text-rose-500 font-bold uppercase">{error}</p>}
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
                  WebkitTransform: 'scaleX(-1)'
                }}
              />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Starting...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button 
             onClick={() => setIsMinimized(!isMinimized)}
             className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button 
             onClick={toggleCam}
             className={`p-1.5 rounded-lg bg-black/40 backdrop-blur-md ${isActive ? 'text-rose-400' : 'text-emerald-400'} hover:bg-white/20`}
          >
            {isActive ? <CameraOff size={12} /> : <Camera size={12} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
})

