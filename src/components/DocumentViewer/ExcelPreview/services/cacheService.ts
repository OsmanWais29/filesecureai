
/**
 * Cache service for Excel data
 */
export const cacheService = {
  /**
   * Save Excel data to cache
   */
  async saveExcelData(documentId: string, data: any, clientName?: string): Promise<void> {
    try {
      const cacheKey = `excel_data_${documentId}`;
      const cacheData = {
        data,
        clientName,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving Excel data to cache:', error);
    }
  },

  /**
   * Get Excel data from cache
   */
  async getExcelData(documentId: string): Promise<{ data: any; clientName?: string } | null> {
    try {
      const cacheKey = `excel_data_${documentId}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (!cachedData) {
        return null;
      }

      const parsedData = JSON.parse(cachedData);
      const timestamp = parsedData.timestamp || 0;

      // Expire cache after 1 hour
      if (Date.now() - timestamp > 3600000) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return {
        data: parsedData.data,
        clientName: parsedData.clientName
      };
    } catch (error) {
      console.error('Error retrieving Excel data from cache:', error);
      return null;
    }
  },

  /**
   * Clear Excel data cache
   */
  async clearExcelCache(documentId?: string): Promise<void> {
    try {
      if (documentId) {
        // Clear specific document cache
        localStorage.removeItem(`excel_data_${documentId}`);
      } else {
        // Clear all Excel cache
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('excel_data_')) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing Excel cache:', error);
    }
  }
};
