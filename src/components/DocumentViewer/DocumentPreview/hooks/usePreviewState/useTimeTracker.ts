
import { useState, useEffect, useCallback } from 'react';
import { TimeTrackerResult } from '../types';

export const useTimeTracker = (stuckThresholdMinutes = 3): TimeTrackerResult => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isStuck, setIsStuck] = useState<boolean>(false);
  const [minutesStuck, setMinutesStuck] = useState<number>(0);

  // Start tracking time
  const startTracking = useCallback(() => {
    setStartTime(Date.now());
    setIsStuck(false);
    setMinutesStuck(0);
  }, []);

  // Stop tracking time
  const stopTracking = useCallback(() => {
    setStartTime(null);
    setIsStuck(false);
    setMinutesStuck(0);
  }, []);

  // Check if processing is "stuck"
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      setMinutesStuck(Math.floor(elapsedMinutes));
      
      if (elapsedMinutes >= stuckThresholdMinutes) {
        setIsStuck(true);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [startTime, stuckThresholdMinutes]);

  return {
    isStuck,
    minutesStuck,
    startTracking,
    stopTracking
  };
};
