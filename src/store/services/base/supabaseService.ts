
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

// Base service class with common Supabase utilities
export const supabaseService = {
  handleError(error: any, message: string): never {
    const errorMessage = formatSupabaseError(error);
    console.error(`${message}:`, error);
    
    if (error && 'details' in error) {
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    toast.error(`${message}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw new Error(errorMessage);
  }
};
