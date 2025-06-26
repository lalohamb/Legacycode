import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { legacyCapsuleABI } from '../contracts/abi';
import { getIPFSGatewayURL } from '../utils/pinataService';

// Load contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

interface CapsuleInfo {
  id: number;
  title: string;
  recipient: string;
  contentType: 'text' | 'video';
  unlockMethod: string;
  metadataURI?: string;
  isUnlocked?: boolean;
  owner: string;
  contentHash: string;
  createdAt?: string;
}

interface UseUserCapsulesReturn {
  capsules: CapsuleInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Type guard to ensure proper hex string format
function isValidHexAddress(address: string | undefined): address is `0x${string}` {
  return typeof address === 'string' && 
         address.length === 42 && 
         address.startsWith('0x') &&
         /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function useUserCapsules(): UseUserCapsulesReturn {
  const [capsules, setCapsules] = useState<CapsuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Validate contract address
  const isValidAddress = isValidHexAddress(CONTRACT_ADDRESS);

  const fetchUserCapsules = useCallback(async () => {
    if (!isConnected || !address || !publicClient || !isValidAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching capsules for user:', address);

      // Step 1: Get the total number of capsules minted
      const nextTokenId = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'nextTokenId',
      }) as bigint;

      const totalCapsules = Number(nextTokenId) - 1; // nextTokenId starts at 1, so subtract 1
      console.log('Total capsules minted:', totalCapsules);

      if (totalCapsules <= 0) {
        setCapsules([]);
        setLoading(false);
        return;
      }

      // Step 2: Check each capsule to see if the user owns it
      const userCapsules: CapsuleInfo[] = [];
      
      for (let tokenId = 1; tokenId <= totalCapsules; tokenId++) {
        try {
          // Parallel reads for efficiency
          const [owner, capsuleData, tokenURI] = await Promise.all([
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: legacyCapsuleABI,
              functionName: 'ownerOf',
              args: [BigInt(tokenId)],
            }) as Promise<string>,
            
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: legacyCapsuleABI,
              functionName: 'capsules',
              args: [BigInt(tokenId)],
            }) as Promise<any[]>,
            
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: legacyCapsuleABI,
              functionName: 'tokenURI',
              args: [BigInt(tokenId)],
            }) as Promise<string>
          ]);

          // Check if the current user owns this capsule
          if (owner.toLowerCase() === address.toLowerCase()) {
            console.log(`User owns capsule #${tokenId}`);

            // Extract data from the capsule struct (v04 format)
            const [
              capsuleOwner,
              recipient,
              title,
              contentHash,
              contentType,
              chosenUnlockMethod,
              passphraseHash,
              birthdayUnlockTimestamp,
              unlockAmount,
              unlockTokenAddress,
              requiredNFTContract,
              requiredNFTTokenId,
              qrCodeHash,
              passphraseVerified,
              birthdayVerified,
              tokenVerified,
              nftVerified,
              qrVerified,
              isUnlocked
            ] = capsuleData;

            // Map unlock method ID to method name
            const unlockMethods = ['passphrase', 'qa', 'payment', 'qrcode', 'geolocation', 'token', 'quiz', 'timed'];
            const unlockMethodName = unlockMethods[Number(chosenUnlockMethod)] || 'unknown';
            
            // Try to fetch metadata to get more detailed unlock method info
            let metadataUnlockMethod = unlockMethodName;
            try {
              if (tokenURI) {
                const metadataResponse = await fetch(getIPFSGatewayURL(tokenURI));
                if (metadataResponse.ok) {
                  const metadata = await metadataResponse.json();
                  if (metadata.properties?.unlock_method) {
                    metadataUnlockMethod = metadata.properties.unlock_method;
                  }
                }
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for capsule #${tokenId}:`, metadataError);
            }

            const capsuleInfo: CapsuleInfo = {
              id: tokenId,
              title: title || `Capsule #${tokenId}`,
              recipient: recipient || '',
              contentType: contentType === 0 ? 'text' : 'video',
              unlockMethod: metadataUnlockMethod,
              metadataURI: tokenURI || undefined,
              isUnlocked: isUnlocked || false,
              owner: owner,
              contentHash: contentHash || '',
              createdAt: new Date().toISOString(), // We don't have creation timestamp from contract
            };

            userCapsules.push(capsuleInfo);
          }
        } catch (tokenError) {
          // Token might not exist or might be burned, skip it
          console.warn(`Error fetching data for token #${tokenId}:`, tokenError);
          continue;
        }
      }

      // Sort capsules by ID (most recent first)
      userCapsules.sort((a, b) => b.id - a.id);
      
      console.log(`Found ${userCapsules.length} capsules owned by user:`, userCapsules);
      setCapsules(userCapsules);

    } catch (err) {
      console.error('Error fetching user capsules:', err);
      setError(`Failed to load your capsules: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, publicClient, isValidAddress]);

  // Fetch capsules when dependencies change
  useEffect(() => {
    if (!isValidAddress) {
      setError('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your .env file.');
      setLoading(false);
      return;
    }

    fetchUserCapsules();
  }, [fetchUserCapsules, isValidAddress]);

  return {
    capsules,
    loading,
    error,
    refetch: fetchUserCapsules,
  };
}