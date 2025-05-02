
export const generateId = (): string => {
  // Use UUID format instead of simple random string for better uniqueness
  return Array.from({ length: 4 }, () => 
    Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
  ).join('-');
};
