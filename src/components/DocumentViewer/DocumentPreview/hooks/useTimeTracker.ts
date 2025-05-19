
import { useState, useEffect, useRef } from 'react';

export const useTimeTracker = () => {
  const [isAnalysisStuck, setIsAnalysisStuck] = useState<{ stuck: boolean; minutesStuck: number }>({
    stuck: false,
    minutesStuck: 0
  });
  
  const startTime = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  
  const startTracking = () => {
    startTime.current = Date.now();
    
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    // Set up interval to check if analysis is stuck
    const intervalId = window.setInterval(() => {
      if (startTime.current) {
        const elapsedMs = Date.now() - startTime.current;
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        
        // Consider analysis stuck if it takes more than 5 minutes
        const isStuck = elapsedMinutes > 5;
        
        setIsAnalysisStuck({
          stuck: isStuck,
          minutesStuck: elapsedMinutes
        });
      }
    }, 30000); // Check every 30 seconds
    
    checkIntervalRef.current = intervalId;
  };
  
  const stopTracking = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    startTime.current = null;
    setIsAnalysisStuck({
      stuck: false,
      minutesStuck: 0
    });
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);
  
  return {
    isAnalysisStuck,
    startTracking,
    stopTracking
  };
};
