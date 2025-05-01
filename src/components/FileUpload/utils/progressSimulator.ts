
import { useState, useEffect } from 'react';

interface StageConfig {
  text: string;
  duration: number;
  startProgress: number;
  endProgress: number;
}

/**
 * Simulates an upload progress with configurable stages
 * @param stages Array of stage configurations with text, duration, and progress ranges
 * @param setProgress Function to update the progress state
 * @param setText Function to update the step text state
 * @returns Promise that resolves when all stages are complete
 */
export const simulateUploadProgress = (
  stages: StageConfig[],
  setProgress: (progress: number) => void,
  setText: (text: string) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let currentStageIndex = 0;

    const processStage = () => {
      if (currentStageIndex >= stages.length) {
        resolve();
        return;
      }

      const stage = stages[currentStageIndex];
      setText(stage.text);

      const startTime = Date.now();
      const endTime = startTime + stage.duration;
      const startProgress = stage.startProgress;
      const progressDiff = stage.endProgress - startProgress;

      const updateInterval = setInterval(() => {
        const now = Date.now();
        const elapsedRatio = Math.min(1, (now - startTime) / stage.duration);
        const currentProgress = startProgress + (progressDiff * elapsedRatio);
        
        setProgress(Math.round(currentProgress));

        if (now >= endTime) {
          clearInterval(updateInterval);
          currentStageIndex++;
          processStage();
        }
      }, 50); // Update progress every 50ms for smooth animation
    };

    processStage();
  });
};

/**
 * Hook to simulate and manage upload progress
 * @param initialProgress Starting progress value
 * @param initialStep Starting step text
 * @returns Object containing progress, step text, and functions to update them
 */
export const useProgressSimulation = (
  initialProgress: number = 0,
  initialStep: string = ""
) => {
  const [progress, setProgress] = useState(initialProgress);
  const [step, setStep] = useState(initialStep);
  const [isComplete, setIsComplete] = useState(false);

  const runSimulation = async (stages: StageConfig[]) => {
    await simulateUploadProgress(stages, setProgress, setStep);
    setIsComplete(true);
    return true;
  };

  const reset = () => {
    setProgress(0);
    setStep("");
    setIsComplete(false);
  };

  return {
    progress,
    step,
    isComplete,
    setProgress,
    setStep,
    runSimulation,
    reset
  };
};

/**
 * Creates a predefined set of upload stages for common document types
 * @param isSpecialForm Whether the document is a special form that requires analysis
 * @param isExcel Whether the document is an Excel file
 * @returns Array of stage configurations
 */
export const createUploadStages = (isSpecialForm: boolean, isExcel: boolean): StageConfig[] => {
  return [
    { 
      text: "Uploading document...", 
      duration: 1500,
      startProgress: 5,
      endProgress: 40 
    },
    { 
      text: "Processing document...", 
      duration: 800,
      startProgress: 40,
      endProgress: 60
    },
    {
      text: isSpecialForm ? "Running compliance checks..." : "Preparing document preview...",
      duration: isSpecialForm ? 1800 : 800,
      startProgress: 60,
      endProgress: 85
    },
    {
      text: isExcel ? "Extracting data from spreadsheet..." : "Finalizing document...",
      duration: isExcel ? 1500 : 700,
      startProgress: 85,
      endProgress: 100
    }
  ];
};
