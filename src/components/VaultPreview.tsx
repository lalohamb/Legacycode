import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Key, Shield, Award, FileCheck, ExternalLink, User, Hash, Cloud, Image as ImageIcon, AlertCircle, DollarSign, CheckCircle, Clock, Loader2, Coins, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { keccak256, toBytes, stringToHex, parseEther, formatEther } from 'viem';
import Button from './Button';
import UnlockedContentPopup from './UnlockedContentPopup';
import { useCapsuleContract } from '../hooks/useCapsuleContract';
import { getIPFSGatewayURL } from '../utils/pinataService';
import { SupabaseCapsuleService } from '../lib/supabase';

interface CapsuleData {
  title: string;
  type: 'text' | 'video';
  message: string;
  recipient: string;
  lifeLesson: string;
  images: File[];
  file?: File;
  videoBlob?: Blob;
}

interface UnlockRulesData {
  method: string;
  passphrase?: string;
  personName?: string;
  dateOfBirth?: string;
  mothersName?: string;
  unlockFee?: number;
  qrPhrase?: string;
  location?: string;
  erc20TokenAddress?: string;
  erc20UnlockAmount?: number;
  erc721ContractAddress?: string;
  unlockTokenId?: string;
  quizAnswer?: string;
  unlockDate?: string;
}

interface UploadResult {
  metadataURI: string;
  contentURI?: string;
  imageURIs: string[];
}

const VaultPreview: React.FC = () => {
  const [capsuleData, setCapsuleData] = useState<CapsuleData | null>(null);
  const [unlockData, setUnlockData] = useState<UnlockRulesData | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [capsuleId, setCapsuleId] = useState<number>(1);
  const [metadataContent, setMetadataContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading capsule data...');
  const [unlockMethod, setUnlockMethod] = useState<string>('');
  const [supabaseCapsule, setSupabaseCapsule] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showUnlockedContent, setShowUnlockedContent] = useState(false);
  const [previousUnlockState, setPreviousUnlockState] = useState(false);
  
  // Single-step unlock states
  const [unlockInputs, setUnlockInputs] = useState({
    passphrase: '',
    qrPhrase: '',
    personName: '',
    dateOfBirth: '',
    mothersName: '',
    quizAnswer: '',
    location: '',
    paymentAmount: '',
  });
  
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { 
    submitPassphrase,
    verifyBirthdayTimestamp,
    verifyTokenOwnership,
    verifyNFTOwnership,
    verifyQRCode,
    finalizeUnlock,
    unlockWithPayment,
    getCapsuleOwner, 
    getTokenURI, 
    getCapsuleData,
    getContentHash,
    getUnlockMethodName,
    verificationStatuses,
    isPending,
    isSuccess,
    txHash
  } = useCapsuleContract();

  // Get the capsule ID from localStorage or URL params - only run once
  useEffect(() => {
    console.log('🔍 [DEBUG] VaultPreview - Getting capsule ID from storage...');
    
    const selectedId = localStorage.getItem('selectedCapsuleId');
    const lastCreatedId = localStorage.getItem('lastCreatedCapsuleId');
    
    console.log('🔍 [DEBUG] VaultPreview - Storage values:', {
      selectedId,
      lastCreatedId,
      selectedIdType: typeof selectedId,
      lastCreatedIdType: typeof lastCreatedId
    });
    
    let finalCapsuleId: number;
    
    if (selectedId) {
      finalCapsuleId = parseInt(selectedId, 10);
      console.log('🔍 [DEBUG] VaultPreview - Using selected capsule ID:', {
        originalValue: selectedId,
        parsedValue: finalCapsuleId,
        isNaN: isNaN(finalCapsuleId)
      });
    } else if (lastCreatedId) {
      finalCapsuleId = parseInt(lastCreatedId, 10);
      console.log('🔍 [DEBUG] VaultPreview - Using last created capsule ID:', {
        originalValue: lastCreatedId,
        parsedValue: finalCapsuleId,
        isNaN: isNaN(finalCapsuleId)
      });
    } else {
      finalCapsuleId = 1;
      console.log('🔍 [DEBUG] VaultPreview - Using default capsule ID: 1');
    }
    
    // Validate the parsed ID
    if (isNaN(finalCapsuleId) || finalCapsuleId < 1) {
      console.error('❌ [DEBUG] VaultPreview - Invalid capsule ID, falling back to 1:', {
        finalCapsuleId,
        isNaN: isNaN(finalCapsuleId),
        lessThanOne: finalCapsuleId < 1
      });
      finalCapsuleId = 1;
    }
    
    console.log('🔍 [DEBUG] VaultPreview - Final capsule ID set:', {
      capsuleId: finalCapsuleId,
      type: typeof finalCapsuleId
    });
    
    setCapsuleId(finalCapsuleId);
  }, []); // Empty dependency array - only run once

  // Get NFT data from blockchain
  const { data: nftOwner } = getCapsuleOwner(BigInt(capsuleId), { enabled: capsuleId > 0 });
  const { data: tokenURI } = getTokenURI(BigInt(capsuleId), { enabled: capsuleId > 0 });
  const { data: onChainCapsuleData } = getCapsuleData(BigInt(capsuleId), { enabled: capsuleId > 0 });
  const { data: unlockMethodName } = getUnlockMethodName(BigInt(capsuleId), { enabled: capsuleId > 0 });

  const isOwnerOrApproved = nftOwner && address && (
    nftOwner.toLowerCase() === address.toLowerCase()
  );

  // Extract token and NFT requirements from on-chain data
  const tokenRequirements = onChainCapsuleData ? {
    unlockAmount: onChainCapsuleData[8], // unlockAmount
    unlockTokenAddress: onChainCapsuleData[9], // unlockTokenAddress
  } : null;

  const nftRequirements = onChainCapsuleData ? {
    requiredNFTContract: onChainCapsuleData[10], // requiredNFTContract
    requiredNFTTokenId: onChainCapsuleData[11], // requiredNFTTokenId
  } : null;

  // Get unlock method from contract
  useEffect(() => {
    if (onChainCapsuleData && onChainCapsuleData[5] !== undefined) {
      const methodId = Number(onChainCapsuleData[5]); // chosenUnlockMethod
      const methods = ['passphrase', 'qa', 'payment', 'qrcode', 'geolocation', 'token', 'quiz', 'timed'];
      setUnlockMethod(methods[methodId] || 'unknown');
      console.log('Unlock method from contract:', methods[methodId], 'ID:', methodId);
    } else if (unlockMethodName) {
      setUnlockMethod(unlockMethodName.toLowerCase().replace(/\s+/g, ''));
      console.log('Unlock method name from contract:', unlockMethodName);
    }
  }, [onChainCapsuleData, unlockMethodName]);

  // Enhanced unlock state monitoring with popup trigger
  useEffect(() => {
    if (onChainCapsuleData && onChainCapsuleData[17] !== undefined) {
      const currentUnlockState = onChainCapsuleData[17]; // isUnlocked field
      
      console.log('🔍 [DEBUG] Unlock state check:', {
        previousUnlockState,
        currentUnlockState,
        hasTransitioned: !previousUnlockState && currentUnlockState,
        hasCapsuleData: !!capsuleData,
        dataLoaded
      });
      
      // Check if capsule just became unlocked (transition from false to true)
      if (!previousUnlockState && currentUnlockState && capsuleData && dataLoaded) {
        console.log('🎉 [DEBUG] Capsule just became unlocked! Showing content popup...');
        setShowUnlockedContent(true);
      }
      
      // Update states
      setIsUnlocked(currentUnlockState);
      setPreviousUnlockState(currentUnlockState);
    }
  }, [onChainCapsuleData, previousUnlockState, capsuleData, dataLoaded]);

  // Watch for successful unlock transaction completion
  useEffect(() => {
    if (isSuccess && txHash && capsuleData) {
      console.log('🎉 [DEBUG] Unlock transaction successful! Showing popup...', {
        txHash,
        hasCapsuleData: !!capsuleData
      });
      
      // Show popup immediately on successful unlock transaction
      setShowUnlockedContent(true);
      
      // Update Supabase if configured
      if (SupabaseCapsuleService.isConfigured()) {
        SupabaseCapsuleService.updateCapsuleUnlockStatus(capsuleId, true)
          .then(() => console.log('Capsule unlock status updated in Supabase'))
          .catch(err => console.warn('Failed to update unlock status in Supabase:', err));
      }
    }
  }, [isSuccess, txHash, capsuleData, capsuleId]);

  // Stable fetchMetadata function
  const fetchMetadata = useCallback(async (metadataURI: string) => {
    if (!metadataURI) return;
    
    try {
      console.log('Fetching metadata from:', metadataURI);
      const response = await fetch(getIPFSGatewayURL(metadataURI));
      if (response.ok) {
        const metadata = await response.json();
        setMetadataContent(metadata);
        console.log('Fetched metadata from Pinata:', metadata);
      }
    } catch (error) {
      console.error('Error fetching metadata from Pinata:', error);
    }
  }, []);

  // Main data loading effect - only run when capsuleId changes and data hasn't been loaded
  useEffect(() => {
    // Prevent re-loading if data is already loaded
    if (dataLoaded) {
      console.log('🔍 [DEBUG] VaultPreview - Data already loaded, skipping...');
      return;
    }

    const loadCapsuleData = async () => {
      setIsLoading(true);
      setLoadingMessage('Loading capsule data...');

      console.log('🔍 [DEBUG] VaultPreview - Starting loadCapsuleData with capsuleId:', {
        capsuleId,
        type: typeof capsuleId,
        isNumber: typeof capsuleId === 'number',
        isInteger: Number.isInteger(capsuleId),
        isPositive: capsuleId > 0
      });

      try {
        // Priority 1: Try to load from Supabase if configured
        if (SupabaseCapsuleService.isConfigured()) {
          setLoadingMessage('Loading from Supabase...');
          
          console.log('🔍 [DEBUG] VaultPreview - About to call SupabaseCapsuleService.getCapsuleById with:', {
            capsuleId,
            type: typeof capsuleId,
            stringified: JSON.stringify(capsuleId)
          });
          
          const supabaseData = await SupabaseCapsuleService.getCapsuleById(capsuleId);
          
          console.log('🔍 [DEBUG] VaultPreview - Supabase response:', {
            supabaseData,
            hasData: !!supabaseData,
            dataType: typeof supabaseData
          });
          
          if (supabaseData) {
            console.log('✅ [DEBUG] VaultPreview - Loaded capsule from Supabase:', supabaseData);
            setSupabaseCapsule(supabaseData);
            
            // Reconstruct capsule data from Supabase
            const reconstructedCapsule: CapsuleData = {
              title: supabaseData.title,
              type: supabaseData.content_type,
              message: 'Content stored on blockchain - unlock to view full content',
              recipient: supabaseData.recipient_address || '',
              lifeLesson: '',
              images: []
            };
            
            setCapsuleData(reconstructedCapsule);
            setUnlockMethod(supabaseData.unlock_method);
            
            // Fetch metadata if available
            if (supabaseData.metadata_uri) {
              setLoadingMessage('Fetching metadata from Pinata IPFS...');
              await fetchMetadata(supabaseData.metadata_uri);
            }
            
            setDataLoaded(true); // Mark data as loaded
            setIsLoading(false);
            return;
          } else {
            console.log('⚠️ [DEBUG] VaultPreview - No data found in Supabase for capsule ID:', capsuleId);
          }
        }

        // Priority 2: Load stored data if available (for recently created capsules)
        const storedCapsule = localStorage.getItem('capsuleData');
        const storedUnlock = localStorage.getItem('unlockRules');
        const storedUpload = localStorage.getItem('uploadResult');
        
        if (storedCapsule && storedUnlock) {
          setLoadingMessage('Loading from local storage...');
          const parsedCapsule = JSON.parse(storedCapsule);
          setCapsuleData(parsedCapsule);
          setUnlockData(JSON.parse(storedUnlock));

          if (storedUpload) {
            const parsedUpload = JSON.parse(storedUpload);
            setUploadResult(parsedUpload);
            
            if (parsedUpload.metadataURI) {
              setLoadingMessage('Fetching metadata from Pinata IPFS...');
              await fetchMetadata(parsedUpload.metadataURI);
            }
          }

          if (parsedCapsule.images && Array.isArray(parsedCapsule.images)) {
            const urls = parsedCapsule.images.map((image: File) => {
              if (image instanceof File) {
                return URL.createObjectURL(image);
              } else if (typeof image === 'string' && image.startsWith('data:')) {
                return image;
              }
              return null;
            }).filter(Boolean);
            
            setImageUrls(urls);
          }

          setDataLoaded(true); // Mark data as loaded
          setIsLoading(false);
          return;
        }

        // Priority 3: If we have blockchain data but no local data, try to fetch from tokenURI
        if (tokenURI && !storedCapsule) {
          setLoadingMessage('Fetching metadata from blockchain...');
          await fetchMetadata(tokenURI);
        }

        // Priority 4: If we have on-chain capsule data, try to reconstruct basic info
        if (onChainCapsuleData && !capsuleData) {
          setLoadingMessage('Loading from blockchain data...');
          try {
            const [owner, recipient, title, contentHash, contentType, chosenUnlockMethod] = onChainCapsuleData;
            
            const reconstructedCapsule: CapsuleData = {
              title: title || `Capsule #${capsuleId}`,
              type: contentType === 0 ? 'text' : 'video',
              message: 'Content stored on blockchain - unlock to view full content',
              recipient: recipient || '',
              lifeLesson: '',
              images: []
            };
            
            setCapsuleData(reconstructedCapsule);
            
            // Map unlock method ID to method name
            const methods = ['passphrase', 'qa', 'payment', 'qrcode', 'geolocation', 'token', 'quiz', 'timed'];
            const methodName = methods[Number(chosenUnlockMethod)] || 'unknown';
            
            const reconstructedUnlock: UnlockRulesData = {
              method: methodName,
              passphrase: methodName === 'passphrase' ? 'demo123' : undefined,
              qrPhrase: methodName === 'qrcode' ? 'unlock-phrase' : undefined,
            };
            
            setUnlockData(reconstructedUnlock);
          } catch (err) {
            console.error('Error reconstructing capsule data:', err);
          }
        }

        // Priority 5: If we still don't have data, create a demo capsule
        if (!capsuleData && !storedCapsule) {
          setLoadingMessage('Creating demo capsule data...');
          const demoCapsule: CapsuleData = {
            title: `Demo Single-Step Capsule #${capsuleId}`,
            type: 'text',
            message: 'This is a demo capsule that uses single-step unlock based on the chosen method. The unlock process will only require the specific verification method selected during creation.',
            recipient: '',
            lifeLesson: 'Security through targeted verification ensures efficient access control.',
            images: []
          };
          
          setCapsuleData(demoCapsule);
          
          const demoUnlock: UnlockRulesData = {
            method: unlockMethod || 'passphrase',
            passphrase: 'demo123',
            qrPhrase: 'unlock-phrase'
          };
          
          setUnlockData(demoUnlock);
        }

        setDataLoaded(true); // Mark data as loaded

      } catch (error) {
        console.error('❌ [DEBUG] VaultPreview - Error loading capsule data:', error);
        setError('Failed to load capsule data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCapsuleData();
  }, [capsuleId, dataLoaded]); // Only depend on capsuleId and dataLoaded flag

  const handleUnlockInputChange = (field: string, value: string) => {
    setUnlockInputs(prev => ({ ...prev, [field]: value }));
  };

  const getMethodDisplayName = (method: string) => {
    const names = {
      'passphrase': 'Secret Passphrase',
      'qa': 'Question & Answer',
      'payment': 'Payment Required',
      'qrcode': 'QR Code Scan',
      'geolocation': 'Location Verification',
      'token': 'Token Ownership',
      'quiz': 'Quiz Answer',
      'timed': 'Time-based Release'
    };
    return names[method as keyof typeof names] || method;
  };

  const handleUnlock = async () => {
    if (!isConnected || !isOwnerOrApproved) {
      setError('You must be connected and authorized to unlock this capsule');
      return;
    }

    try {
      setError('');
      
      switch (unlockMethod) {
        case 'passphrase':
          if (!unlockInputs.passphrase) {
            setError('Please enter the passphrase');
            return;
          }
          await submitPassphrase(BigInt(capsuleId), unlockInputs.passphrase);
          break;

        case 'qa':
          if (!unlockInputs.personName || !unlockInputs.dateOfBirth || !unlockInputs.mothersName) {
            setError('Please fill in all Q&A fields');
            return;
          }
          const combinedData = `${unlockInputs.personName}${unlockInputs.dateOfBirth}${unlockInputs.mothersName}`;
          await submitPassphrase(BigInt(capsuleId), combinedData);
          break;

        case 'payment':
          if (!unlockInputs.paymentAmount) {
            setError('Please enter the payment amount');
            return;
          }
          const paymentAmount = parseEther(unlockInputs.paymentAmount);
          await unlockWithPayment(BigInt(capsuleId), paymentAmount);
          return; // Payment unlock is complete, no need to finalize

        case 'qrcode':
          if (!unlockInputs.qrPhrase) {
            setError('Please enter the QR phrase');
            return;
          }
          await verifyQRCode(BigInt(capsuleId), unlockInputs.qrPhrase);
          break;

        case 'geolocation':
          if (!unlockInputs.location) {
            setError('Please select the location');
            return;
          }
          await submitPassphrase(BigInt(capsuleId), unlockInputs.location);
          break;

        case 'token':
          // For token method, we need both token and NFT verification
          await verifyTokenOwnership(BigInt(capsuleId));
          await verifyNFTOwnership(BigInt(capsuleId));
          break;

        case 'quiz':
          if (!unlockInputs.quizAnswer) {
            setError('Please enter the quiz answer');
            return;
          }
          await submitPassphrase(BigInt(capsuleId), unlockInputs.quizAnswer.toLowerCase());
          break;

        case 'timed':
          await verifyBirthdayTimestamp(BigInt(capsuleId));
          break;

        default:
          setError('Unknown unlock method');
          return;
      }

      // For non-payment methods, we need to finalize the unlock
      if (unlockMethod !== 'payment') {
        // Wait a moment for the verification to complete, then finalize
        setTimeout(async () => {
          try {
            await finalizeUnlock(BigInt(capsuleId));
          } catch (finalizeError: any) {
            setError(`Failed to finalize unlock: ${finalizeError.message}`);
          }
        }, 2000);
      }

    } catch (error: any) {
      setError(`Failed to unlock capsule: ${error.message}`);
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingMessage}</p>
          {SupabaseCapsuleService.isConfigured() && (
            <p className="text-sm text-blue-600 mt-2">Enhanced with Supabase indexing</p>
          )}
        </div>
      </div>
    );
  }

  // Show message if no capsule data is available
  if (!capsuleData) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Capsule Data Found</h2>
          <p className="text-gray-600 mb-6">
            Unable to load data for capsule #{capsuleId}. This may be because the capsule doesn't exist or the metadata is not accessible.
          </p>
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/create')}
            >
              Create a New Capsule
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/my-capsules')}
            >
              View My Capsules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            {/* Supabase Data Indicator */}
            {supabaseCapsule && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Enhanced Data Loading</h3>
                    <p className="text-sm text-blue-700">
                      Loaded from Supabase index for faster performance. Created: {new Date(supabaseCapsule.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isUnlocked ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Single-Step NFT Capsule #{capsuleId}
                  </h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    {capsuleData.title}
                  </h2>
                  <p className="text-gray-600">
                    {capsuleData.message.substring(0, 100)}
                    {capsuleData.message.length > 100 ? '...' : ''}
                  </p>
                </div>

                {/* Unlock Method Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start">
                    <Key className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-800 mb-2">
                        Single-Step Unlock: {getMethodDisplayName(unlockMethod)}
                      </h3>
                      <p className="text-blue-700 text-sm mb-3">
                        This capsule uses the new single-step unlock system. Only the {getMethodDisplayName(unlockMethod).toLowerCase()} verification is required to unlock the content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* NFT Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Hash className="h-5 w-5 mr-2" />
                    NFT Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Token ID</label>
                      <p className="text-gray-900 font-mono">#{capsuleId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Owner</label>
                      <p className="text-gray-900 font-mono text-sm">
                        {nftOwner ? `${nftOwner.slice(0, 6)}...${nftOwner.slice(-4)}` : 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Unlock Method</label>
                      <p className="text-gray-900">{getMethodDisplayName(unlockMethod)}</p>
                    </div>
                    {tokenURI && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Metadata URI</label>
                        <div className="flex items-center">
                          <p className="text-blue-600 font-mono text-sm mr-2 truncate">{tokenURI}</p>
                          <a 
                            href={getIPFSGatewayURL(tokenURI)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unlock Interface */}
                <div className="bg-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Unlock Capsule
                  </h3>
                  
                  {unlockMethod === 'passphrase' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Passphrase
                        </label>
                        <input
                          type="password"
                          value={unlockInputs.passphrase}
                          onChange={(e) => handleUnlockInputChange('passphrase', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the secret passphrase (demo: demo123)"
                        />
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'qa' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={unlockInputs.personName}
                          onChange={(e) => handleUnlockInputChange('personName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the person's full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={unlockInputs.dateOfBirth}
                          onChange={(e) => handleUnlockInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mother's First Name
                        </label>
                        <input
                          type="text"
                          value={unlockInputs.mothersName}
                          onChange={(e) => handleUnlockInputChange('mothersName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter mother's first name"
                        />
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'payment' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Amount (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={unlockInputs.paymentAmount}
                          onChange={(e) => handleUnlockInputChange('paymentAmount', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter payment amount in ETH"
                        />
                        {tokenRequirements && (
                          <p className="text-sm text-gray-600 mt-2">
                            Required: {formatEther(tokenRequirements.unlockAmount)} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'qrcode' && (
                    <div className="space-y-4">
                      {unlockData?.qrPhrase && (
                        <div className="flex justify-center mb-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <QRCodeSVG
                              value={unlockData.qrPhrase}
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter QR Code Phrase
                        </label>
                        <input
                          type="text"
                          value={unlockInputs.qrPhrase}
                          onChange={(e) => handleUnlockInputChange('qrPhrase', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Scan QR code and enter the phrase (demo: unlock-phrase)"
                        />
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'geolocation' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Location
                        </label>
                        <select
                          value={unlockInputs.location}
                          onChange={(e) => handleUnlockInputChange('location', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a location</option>
                          <option value="New York, USA">New York, USA</option>
                          <option value="London, UK">London, UK</option>
                          <option value="Tokyo, Japan">Tokyo, Japan</option>
                          <option value="Paris, France">Paris, France</option>
                          <option value="Sydney, Australia">Sydney, Australia</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'token' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-amber-800 text-sm">
                          <strong>Token Verification:</strong> This method requires you to own both the specified ERC-20 tokens and the required NFT. The verification will be performed automatically when you click unlock.
                        </p>
                      </div>
                      {tokenRequirements && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">Required Assets:</h4>
                          <p className="text-sm text-gray-600">
                            <strong>ERC-20 Tokens:</strong> {formatEther(tokenRequirements.unlockAmount)} tokens
                          </p>
                          <p className="text-sm text-gray-600 font-mono break-all">
                            Contract: {tokenRequirements.unlockTokenAddress}
                          </p>
                          {nftRequirements && (
                            <>
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Required NFT:</strong> Token ID #{nftRequirements.requiredNFTTokenId.toString()}
                              </p>
                              <p className="text-sm text-gray-600 font-mono break-all">
                                Contract: {nftRequirements.requiredNFTContract}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {unlockMethod === 'quiz' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quiz Answer
                        </label>
                        <input
                          type="text"
                          value={unlockInputs.quizAnswer}
                          onChange={(e) => handleUnlockInputChange('quizAnswer', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the correct answer"
                        />
                      </div>
                    </div>
                  )}

                  {unlockMethod === 'timed' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                          <strong>Time-based Unlock:</strong> This capsule will unlock automatically when the specified time has passed. Click the unlock button to check if the time condition has been met.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleUnlock}
                      className="w-full"
                      disabled={!isConnected || !isOwnerOrApproved || isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        `Unlock with ${getMethodDisplayName(unlockMethod)}`
                      )}
                    </Button>
                  </div>
                </div>

                {/* Access Control */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <Key className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Access Control
                    </h2>
                  </div>
                  
                  {!isConnected ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800">Please connect your wallet to interact with this NFT capsule.</p>
                      </div>
                    </div>
                  ) : !isOwnerOrApproved ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-red-800">
                            You are not authorized to unlock this NFT capsule. Only the owner ({nftOwner ? `${nftOwner.slice(0, 6)}...${nftOwner.slice(-4)}` : 'Unknown'}) can unlock it.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        ✓ You are authorized to unlock this NFT capsule as the owner.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-block p-3 bg-green-50 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  NFT Capsule Unlocked Successfully!
                </h2>
                <p className="text-gray-600 mb-2">Token ID: #{capsuleId}</p>
                <p className="text-sm text-green-600 mb-6">
                  Unlocked using: {getMethodDisplayName(unlockMethod)}
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <p className="text-blue-800 text-lg font-medium mb-4">
                    🎉 Your legacy content is now accessible!
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowUnlockedContent(true)}
                    className="mb-4"
                  >
                    View Unlocked Content
                  </Button>
                  <p className="text-blue-700 text-sm">
                    Click above to view the full content of this capsule in a beautiful popup display.
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-medium text-blue-600">
                    Single-Step Legacy NFT Unlocked
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unlocked Content Popup */}
      <UnlockedContentPopup
        isVisible={showUnlockedContent}
        onClose={() => setShowUnlockedContent(false)}
        capsuleData={{
          id: capsuleId,
          title: capsuleData.title,
          message: capsuleData.message,
          type: capsuleData.type,
          lifeLesson: capsuleData.lifeLesson,
          unlockMethod: unlockMethod
        }}
        uploadResult={uploadResult}
        imageUrls={imageUrls}
        metadataContent={metadataContent}
      />
    </>
  );
};

export default VaultPreview;