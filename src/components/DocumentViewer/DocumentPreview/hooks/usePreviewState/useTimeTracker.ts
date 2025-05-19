
import { useState, useEffect, useRef } from 'react';
import { TimeTrackerResult } from '../types';

export const useTimeTracker = (): TimeTrackerResult => {
  const startTimeRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isAnalysisStuck, setIsAnalysisStuck] = useState<{ stuck: boolean; minutesStuck: number }>({ 
    stuck: false, 
    minutesStuck: 0 
  });
  const intervalRef = useRef<number | null>(null);

  const startTracking = () => {
    if (isTracking) return;
    
    startTimeRef.current = Date.now();
    setIsTracking(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Set up interval to check if analysis is stuck (every minute)
    intervalRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      
      const elapsedMinutes = (Date.now() - startTimeRef.current) / (1000 * 60);
      
      // Consider analysis stuck if it's been running for more than 5 minutes
      if (elapsedMinutes > 5) {
        setIsAnalysisStuck({
          stuck: true,
          minutesStuck: Math.floor(elapsedMinutes)
        });
      } else {
        setIsAnalysisStuck({
          stuck: false,
          minutesStuck: Math.floor(elapsedMinutes)
        });
      }
    }, 60000); // Check every minute
  };

  const stopTracking = () => {
    if (!isTracking) return;
    
    setIsTracking(false);
    startTimeRef.current = null;
    
    // Clear interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset stuck status
    setIsAnalysisStuck({
      stuck: false,
      minutesStuck: 0
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isAnalysisStuck,
    startTracking,
    stopTracking
  };
};
