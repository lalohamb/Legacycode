import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types
export interface UserCapsule {
  id: number;
  title: string;
  owner_address: string;
  recipient_address?: string;
  unlock_method: string;
  content_type: 'text' | 'video';
  metadata_uri?: string;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  block_number?: number;
}

export interface InsertUserCapsule {
  id: number;
  title: string;
  owner_address: string;
  recipient_address?: string;
  unlock_method: string;
  content_type: 'text' | 'video';
  metadata_uri?: string;
  is_unlocked?: boolean;
  transaction_hash?: string;
  block_number?: number;
}

export interface UpdateUserCapsule {
  owner_address?: string;
  is_unlocked?: boolean;
  updated_at?: string;
}

// Supabase service functions
export class SupabaseCapsuleService {
  
  // Insert or update a capsule in Supabase (upsert to handle duplicates)
  static async insertCapsule(capsule: InsertUserCapsule): Promise<UserCapsule | null> {
    try {
      console.log('🔍 [DEBUG] Supabase - insertCapsule (upsert) called with:', {
        capsule,
        capsuleId: capsule.id,
        ownerAddress: capsule.owner_address
      });
      
      // Validate required fields
      if (!capsule.id || !capsule.title || !capsule.owner_address || !capsule.unlock_method) {
        throw new Error('Missing required fields for capsule insertion');
      }
      
      // Ensure owner_address is lowercase for consistency
      const normalizedCapsule = {
        ...capsule,
        owner_address: capsule.owner_address.toLowerCase(),
        recipient_address: capsule.recipient_address?.toLowerCase()
      };
      
      console.log('🔍 [DEBUG] Supabase - Normalized capsule data for upsert:', normalizedCapsule);
      
      // Use upsert to handle duplicate key conflicts
      // This will insert if the record doesn't exist, or update if it does
      const { data, error } = await supabase
        .from('user_capsules')
        .upsert(normalizedCapsule, {
          onConflict: 'id', // Specify the conflict column (primary key)
          ignoreDuplicates: false // We want to update existing records, not ignore them
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error upserting capsule:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [DEBUG] Supabase - Capsule upserted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to upsert capsule:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Get all capsules for a specific owner
  static async getCapsulesByOwner(ownerAddress: string): Promise<UserCapsule[]> {
    try {
      console.log('🔍 [DEBUG] Supabase - getCapsulesByOwner called with:', ownerAddress);
      
      const { data, error } = await supabase
        .from('user_capsules')
        .select('*')
        .eq('owner_address', ownerAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error fetching capsules from Supabase:', error);
        throw error;
      }

      console.log(`✅ [DEBUG] Supabase - Found ${data?.length || 0} capsules for owner:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to fetch capsules:', error);
      return [];
    }
  }

  // Get all capsules for a specific recipient
  static async getCapsulesByRecipient(recipientAddress: string): Promise<UserCapsule[]> {
    try {
      console.log('🔍 [DEBUG] Supabase - getCapsulesByRecipient called with:', recipientAddress);
      
      const { data, error } = await supabase
        .from('user_capsules')
        .select('*')
        .eq('recipient_address', recipientAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error fetching recipient capsules from Supabase:', error);
        throw error;
      }

      console.log(`✅ [DEBUG] Supabase - Found ${data?.length || 0} capsules for recipient:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to fetch recipient capsules:', error);
      return [];
    }
  }

  // Get a specific capsule by ID
  static async getCapsuleById(capsuleId: number): Promise<UserCapsule | null> {
    try {
      console.log('🔍 [DEBUG] Supabase - getCapsuleById called with:', {
        capsuleId,
        type: typeof capsuleId,
        isNumber: typeof capsuleId === 'number',
        isInteger: Number.isInteger(capsuleId),
        stringified: JSON.stringify(capsuleId)
      });
      
      // Validate input
      if (!Number.isInteger(capsuleId) || capsuleId < 1) {
        console.error('❌ [DEBUG] Supabase - Invalid capsuleId provided:', capsuleId);
        throw new Error(`Invalid capsule ID: ${capsuleId}. Must be a positive integer.`);
      }
      
      console.log('🔍 [DEBUG] Supabase - About to execute query with capsuleId:', capsuleId);
      
      const { data, error } = await supabase
        .from('user_capsules')
        .select('*')
        .eq('id', capsuleId)
        .single();

      console.log('🔍 [DEBUG] Supabase - Query result:', {
        data,
        error,
        hasData: !!data,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      });

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error fetching capsule by ID:', {
          capsuleId,
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Don't throw for "not found" errors, just return null
        if (error.code === 'PGRST116') {
          console.log('🔍 [DEBUG] Supabase - No capsule found with ID:', capsuleId);
          return null;
        }
        
        throw error;
      }

      console.log('✅ [DEBUG] Supabase - Capsule found:', data);
      return data;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to fetch capsule by ID:', {
        capsuleId,
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Update capsule unlock status
  static async updateCapsuleUnlockStatus(capsuleId: number, isUnlocked: boolean): Promise<UserCapsule | null> {
    try {
      console.log('🔍 [DEBUG] Supabase - updateCapsuleUnlockStatus called with:', {
        capsuleId,
        isUnlocked,
        capsuleIdType: typeof capsuleId
      });
      
      const { data, error } = await supabase
        .from('user_capsules')
        .update({ 
          is_unlocked: isUnlocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', capsuleId)
        .select()
        .single();

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error updating capsule unlock status:', error);
        throw error;
      }

      console.log('✅ [DEBUG] Supabase - Capsule unlock status updated:', data);
      return data;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to update capsule unlock status:', error);
      return null;
    }
  }

  // Update capsule owner (for transfers)
  static async updateCapsuleOwner(capsuleId: number, newOwnerAddress: string): Promise<UserCapsule | null> {
    try {
      console.log('🔍 [DEBUG] Supabase - updateCapsuleOwner called with:', {
        capsuleId,
        newOwnerAddress,
        capsuleIdType: typeof capsuleId
      });
      
      const { data, error } = await supabase
        .from('user_capsules')
        .update({ 
          owner_address: newOwnerAddress.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', capsuleId)
        .select()
        .single();

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error updating capsule owner:', error);
        throw error;
      }

      console.log('✅ [DEBUG] Supabase - Capsule owner updated:', data);
      return data;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to update capsule owner:', error);
      return null;
    }
  }

  // Search capsules by title or unlock method
  static async searchCapsules(query: string, ownerAddress?: string): Promise<UserCapsule[]> {
    try {
      console.log('🔍 [DEBUG] Supabase - searchCapsules called with:', { query, ownerAddress });
      
      let queryBuilder = supabase
        .from('user_capsules')
        .select('*')
        .or(`title.ilike.%${query}%,unlock_method.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (ownerAddress) {
        queryBuilder = queryBuilder.eq('owner_address', ownerAddress.toLowerCase());
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error searching capsules:', error);
        throw error;
      }

      console.log(`✅ [DEBUG] Supabase - Found ${data?.length || 0} capsules matching query:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to search capsules:', error);
      return [];
    }
  }

  // Get capsules by unlock method
  static async getCapsulesByUnlockMethod(unlockMethod: string, ownerAddress?: string): Promise<UserCapsule[]> {
    try {
      console.log('🔍 [DEBUG] Supabase - getCapsulesByUnlockMethod called with:', { unlockMethod, ownerAddress });
      
      let queryBuilder = supabase
        .from('user_capsules')
        .select('*')
        .eq('unlock_method', unlockMethod)
        .order('created_at', { ascending: false });

      if (ownerAddress) {
        queryBuilder = queryBuilder.eq('owner_address', ownerAddress.toLowerCase());
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error fetching capsules by unlock method:', error);
        throw error;
      }

      console.log(`✅ [DEBUG] Supabase - Found ${data?.length || 0} capsules with unlock method ${unlockMethod}:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to fetch capsules by unlock method:', error);
      return [];
    }
  }

  // Batch upsert multiple capsules (useful for syncing blockchain data)
  static async batchUpsertCapsules(capsules: InsertUserCapsule[]): Promise<UserCapsule[]> {
    try {
      console.log('🔍 [DEBUG] Supabase - batchUpsertCapsules called with:', {
        count: capsules.length,
        capsuleIds: capsules.map(c => c.id)
      });
      
      if (capsules.length === 0) {
        return [];
      }
      
      // Normalize all capsules
      const normalizedCapsules = capsules.map(capsule => ({
        ...capsule,
        owner_address: capsule.owner_address.toLowerCase(),
        recipient_address: capsule.recipient_address?.toLowerCase()
      }));
      
      const { data, error } = await supabase
        .from('user_capsules')
        .upsert(normalizedCapsules, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error batch upserting capsules:', error);
        throw error;
      }

      console.log(`✅ [DEBUG] Supabase - Batch upserted ${data?.length || 0} capsules successfully`);
      return data || [];
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to batch upsert capsules:', error);
      return [];
    }
  }

  // Delete a capsule (useful for cleanup or testing)
  static async deleteCapsule(capsuleId: number): Promise<boolean> {
    try {
      console.log('🔍 [DEBUG] Supabase - deleteCapsule called with:', capsuleId);
      
      const { error } = await supabase
        .from('user_capsules')
        .delete()
        .eq('id', capsuleId);

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error deleting capsule:', error);
        throw error;
      }

      console.log('✅ [DEBUG] Supabase - Capsule deleted successfully:', capsuleId);
      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to delete capsule:', error);
      return false;
    }
  }

  // Check if Supabase is properly configured
  static isConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  }

  // Test Supabase connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [DEBUG] Supabase - Testing connection...');
      
      const { data, error } = await supabase
        .from('user_capsules')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ [DEBUG] Supabase - Connection test failed:', error);
        return false;
      }

      console.log('✅ [DEBUG] Supabase - Connection successful');
      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Connection test failed:', error);
      return false;
    }
  }

  // Get capsule statistics
  static async getCapsuleStats(ownerAddress?: string): Promise<{
    total: number;
    unlocked: number;
    locked: number;
    byUnlockMethod: Record<string, number>;
  }> {
    try {
      console.log('🔍 [DEBUG] Supabase - getCapsuleStats called with:', ownerAddress);
      
      let queryBuilder = supabase
        .from('user_capsules')
        .select('unlock_method, is_unlocked');

      if (ownerAddress) {
        queryBuilder = queryBuilder.eq('owner_address', ownerAddress.toLowerCase());
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('❌ [DEBUG] Supabase - Error fetching capsule stats:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        unlocked: data?.filter(c => c.is_unlocked).length || 0,
        locked: data?.filter(c => !c.is_unlocked).length || 0,
        byUnlockMethod: {} as Record<string, number>
      };

      // Count by unlock method
      data?.forEach(capsule => {
        const method = capsule.unlock_method;
        stats.byUnlockMethod[method] = (stats.byUnlockMethod[method] || 0) + 1;
      });

      console.log('✅ [DEBUG] Supabase - Capsule stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DEBUG] Supabase - Failed to fetch capsule stats:', error);
      return {
        total: 0,
        unlocked: 0,
        locked: 0,
        byUnlockMethod: {}
      };
    }
  }
}