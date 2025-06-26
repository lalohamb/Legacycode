import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { SupabaseCapsuleService, UserCapsule } from '../lib/supabase';

interface UseSupabaseCapsulesReturn {
  capsules: UserCapsule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchCapsules: (query: string) => Promise<void>;
  filterByUnlockMethod: (method: string) => Promise<void>;
  clearFilters: () => Promise<void>;
}

export function useSupabaseCapsules(): UseSupabaseCapsulesReturn {
  const [capsules, setCapsules] = useState<UserCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();

  const fetchUserCapsules = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false);
      setCapsules([]);
      return;
    }

    if (!SupabaseCapsuleService.isConfigured()) {
      setError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching capsules from Supabase for user:', address);

      // Test connection first
      const connectionOk = await SupabaseCapsuleService.testConnection();
      if (!connectionOk) {
        throw new Error('Failed to connect to Supabase');
      }

      // Fetch capsules owned by the user
      const ownedCapsules = await SupabaseCapsuleService.getCapsulesByOwner(address);
      
      // Fetch capsules where user is the recipient
      const recipientCapsules = await SupabaseCapsuleService.getCapsulesByRecipient(address);
      
      // Combine and deduplicate capsules
      const allCapsules = [...ownedCapsules];
      
      // Add recipient capsules that aren't already in owned capsules
      recipientCapsules.forEach(recipientCapsule => {
        if (!allCapsules.find(capsule => capsule.id === recipientCapsule.id)) {
          allCapsules.push(recipientCapsule);
        }
      });

      // Sort by creation date (newest first)
      allCapsules.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`Found ${allCapsules.length} capsules in Supabase:`, allCapsules);
      setCapsules(allCapsules);

    } catch (err) {
      console.error('Error fetching capsules from Supabase:', err);
      setError(`Failed to load your capsules: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  const searchCapsules = useCallback(async (query: string) => {
    if (!isConnected || !address || !query.trim()) {
      await fetchUserCapsules();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await SupabaseCapsuleService.searchCapsules(query, address);
      setCapsules(searchResults);
      
    } catch (err) {
      console.error('Error searching capsules:', err);
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, fetchUserCapsules]);

  const filterByUnlockMethod = useCallback(async (method: string) => {
    if (!isConnected || !address) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filteredResults = await SupabaseCapsuleService.getCapsulesByUnlockMethod(method, address);
      setCapsules(filteredResults);
      
    } catch (err) {
      console.error('Error filtering capsules:', err);
      setError(`Filter failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  const clearFilters = useCallback(async () => {
    await fetchUserCapsules();
  }, [fetchUserCapsules]);

  // Fetch capsules when dependencies change
  useEffect(() => {
    fetchUserCapsules();
  }, [fetchUserCapsules]);

  return {
    capsules,
    loading,
    error,
    refetch: fetchUserCapsules,
    searchCapsules,
    filterByUnlockMethod,
    clearFilters,
  };
}