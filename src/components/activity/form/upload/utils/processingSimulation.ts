
export const simulateProcessingStages = (
  isSpecialForm: boolean,
  isExcel: boolean
): Promise<void> => {
  // Define different processing times based on file type for a realistic experience
  const simulationTime = isSpecialForm ? 2500 : (isExcel ? 1800 : 1200);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, simulationTime);
  });
};
