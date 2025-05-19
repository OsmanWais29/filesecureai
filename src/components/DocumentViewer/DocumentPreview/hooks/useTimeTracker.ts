
import { useState, useEffect, useRef } from 'react';

export interface TimeTrackerResult {
  isAnalysisStuck: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useTimeTracker = (timeout = 2): TimeTrackerResult => {
  const [isStuck, setIsStuck] = useState(false);
  const [minutesStuck, setMinutesStuck] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = () => {
    startTimeRef.current = Date.now();
    setIsStuck(false);
    setMinutesStuck(0);

    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const minutesElapsed = Math.floor((Date.now() - startTimeRef.current) / (60 * 1000));
        setMinutesStuck(minutesElapsed);

        if (minutesElapsed >= timeout) {
          setIsStuck(true);
        }
      }
    }, 10000); // Check every 10 seconds
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setIsStuck(false);
    setMinutesStuck(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isAnalysisStuck: isStuck, // Fixed to return a boolean, not an object
    startTracking,
    stopTracking
  };
};
