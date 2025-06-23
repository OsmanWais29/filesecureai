
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingDocuments: Array<{
    id: string;
    title: string;
    uploadedAt: string;
    similarity: number;
  }>;
  recommendations: string[];
}

export class DuplicatePreventionService {
  /**
   * Check for duplicate files before upload
   */
  static async checkForDuplicates(
    file: File, 
    userId: string
  ): Promise<DuplicateCheckResult> {
    try {
      console.log('🔍 Checking for duplicates:', file.name);

      // Get file hash for exact match detection
      const fileHash = await this.calculateFileHash(file);
      
      // Check for exact matches by hash
      const { data: exactMatches, error: hashError } = await supabase
        .from('documents')
        .select('id, title, created_at, metadata')
        .eq('file_hash', fileHash)
        .eq('user_id', userId);

      if (hashError) {
        console.error('Error checking file hash:', hashError);
      }

      // Check for similar names
      const { data: nameMatches, error: nameError } = await supabase
        .from('documents')
        .select('id, title, created_at, metadata')
        .ilike('title', `%${this.extractBaseName(file.name)}%`)
        .eq('user_id', userId)
        .limit(10);

      if (nameError) {
        console.error('Error checking similar names:', nameError);
      }

      const duplicates = [];
      const recommendations = [];

      // Process exact matches
      if (exactMatches && exactMatches.length > 0) {
        duplicates.push(...exactMatches.map(doc => ({
          id: doc.id,
          title: doc.title,
          uploadedAt: doc.created_at,
          similarity: 100 // Exact match
        })));
        recommendations.push('This exact file already exists. Consider creating a new version instead.');
      }

      // Process similar name matches
      if (nameMatches && nameMatches.length > 0) {
        const similarMatches = nameMatches
          .filter(doc => !duplicates.some(dup => dup.id === doc.id))
          .map(doc => ({
            id: doc.id,
            title: doc.title,
            uploadedAt: doc.created_at,
            similarity: this.calculateNameSimilarity(file.name, doc.title)
          }))
          .filter(match => match.similarity > 70); // Only high similarity matches

        duplicates.push(...similarMatches);
        
        if (similarMatches.length > 0) {
          recommendations.push('Similar files found. Please verify this is not a duplicate.');
        }
      }

      // Store file hash for future duplicate prevention
      if (fileHash && duplicates.length === 0) {
        // No duplicates found, we can proceed with upload
        console.log('✅ No duplicates found, file can be uploaded');
      }

      return {
        isDuplicate: duplicates.length > 0,
        existingDocuments: duplicates.sort((a, b) => b.similarity - a.similarity),
        recommendations
      };

    } catch (error) {
      console.error('Duplicate check failed:', error);
      return {
        isDuplicate: false,
        existingDocuments: [],
        recommendations: ['Unable to check for duplicates. Proceeding with upload.']
      };
    }
  }

  /**
   * Calculate file hash for exact duplicate detection
   */
  private static async calculateFileHash(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Failed to calculate file hash:', error);
      return '';
    }
  }

  /**
   * Extract base name for similarity comparison
   */
  private static extractBaseName(fileName: string): string {
    return fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ') // Replace underscores and dashes with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  /**
   * Calculate name similarity percentage
   */
  private static calculateNameSimilarity(name1: string, name2: string): number {
    const base1 = this.extractBaseName(name1);
    const base2 = this.extractBaseName(name2);
    
    if (base1 === base2) return 100;
    
    // Simple similarity calculation based on common words
    const words1 = base1.split(' ');
    const words2 = base2.split(' ');
    
    const commonWords = words1.filter(word => 
      words2.includes(word) && word.length > 2
    );
    
    const totalWords = Math.max(words1.length, words2.length);
    return Math.round((commonWords.length / totalWords) * 100);
  }

  /**
   * Handle duplicate resolution
   */
  static async handleDuplicateResolution(
    action: 'replace' | 'version' | 'rename' | 'cancel',
    file: File,
    existingDocumentId?: string,
    newName?: string
  ): Promise<{ proceed: boolean; options?: any }> {
    try {
      switch (action) {
        case 'replace':
          if (existingDocumentId) {
            // Create new version and mark old as replaced
            return { proceed: true, options: { replaceDocumentId: existingDocumentId } };
          }
          break;
          
        case 'version':
          if (existingDocumentId) {
            // Create as new version
            return { proceed: true, options: { createVersionOf: existingDocumentId } };
          }
          break;
          
        case 'rename':
          if (newName) {
            // Proceed with new name
            return { proceed: true, options: { newFileName: newName } };
          }
          break;
          
        case 'cancel':
          return { proceed: false };
      }
      
      return { proceed: false };
    } catch (error) {
      console.error('Duplicate resolution failed:', error);
      return { proceed: false };
    }
  }
}
