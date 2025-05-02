
export const simulateProcessingStages = (
  isSpecialForm: boolean,
  isExcel: boolean
): Promise<void> => {
  const simulationTime = isSpecialForm ? 2000 : (isExcel ? 1500 : 1000);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, simulationTime);
  });
};
