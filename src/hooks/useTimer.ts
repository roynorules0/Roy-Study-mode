import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState } from '../types';

export function useTimer(initialDuration: number) {
  const [state, setState] = useState<TimerState>(() => {
    try {
      const saved = localStorage.getItem('study-timer-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Recalculate remaining if it was active
        if (parsed.isActive && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          const remaining = parsed.duration - elapsed;
          if (remaining <= 0) {
            return { ...parsed, isActive: false, startTime: null, duration: 0 };
          }
          return { ...parsed };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse timer state:', e);
    }
    return {
      isActive: false,
      mode: 'work',
      startTime: null,
      duration: initialDuration,
      remainingAtLastPause: initialDuration,
    };
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    if (state.isActive && state.startTime) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      return Math.max(0, state.duration - elapsed);
    }
    return state.remainingAtLastPause;
  });

  useEffect(() => {
    localStorage.setItem('study-timer-state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (state.isActive) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (state.startTime || now)) / 1000);
        const remaining = Math.max(0, state.duration - elapsed);
        
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setState(s => ({ ...s, isActive: false, startTime: null }));
          clearInterval(interval);
        }
      }, 500); 
    }

    return () => clearInterval(interval);
  }, [state.isActive, state.startTime, state.duration]);

  const start = useCallback((duration: number) => {
    setState({
      isActive: true,
      mode: 'work',
      startTime: Date.now(),
      duration,
      remainingAtLastPause: duration,
    });
    setTimeLeft(duration);
  }, []);

  const pause = useCallback(() => {
    if (state.isActive) {
      setState(s => ({
        ...s,
        isActive: false,
        startTime: null,
        duration: timeLeft,
        remainingAtLastPause: timeLeft,
      }));
    }
  }, [state.isActive, timeLeft]);

  const resume = useCallback(() => {
    if (!state.isActive) {
      setState(s => ({
        ...s,
        isActive: true,
        startTime: Date.now(),
        duration: s.remainingAtLastPause,
      }));
    }
  }, [state.isActive]);

  const reset = useCallback((durationInSeconds: number) => {
    setState({
      isActive: false,
      mode: 'work',
      startTime: null,
      duration: durationInSeconds,
      remainingAtLastPause: durationInSeconds,
    });
    setTimeLeft(durationInSeconds);
  }, []);

  const syncTime = useCallback((newTimeLeft: number) => {
    setTimeLeft(newTimeLeft);
    setState(s => ({
      ...s,
      duration: newTimeLeft,
      remainingAtLastPause: newTimeLeft,
      startTime: s.isActive ? Date.now() : null
    }));
  }, []);

  return { timeLeft, isActive: state.isActive, start, pause, resume, reset, syncTime, state };
}
