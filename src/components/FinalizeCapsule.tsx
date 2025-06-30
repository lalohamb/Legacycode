import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { keccak256, toBytes, stringToHex, parseEther, formatEther } from 'viem';
import { Shield, CheckCircle, AlertCircle, Loader2, Hash, ExternalLink, Cloud, DollarSign, Wallet, Sparkles, CreditCard } from 'lucide-react';
import Button from './Button';
import SuccessNotification from './SuccessNotification';
import { useCapsuleContract } from '../hooks/useCapsuleContract';
import { getIPFSGatewayURL, uploadCompleteCapsule, isPinataConfigured } from '../utils/pinataService';
import { SupabaseCapsuleService, InsertUserCapsule } from '../lib/supabase';

interface CapsuleData {
  title: string;
  type: 'text' | 'video';
  message: string;
  recipient: string;
  lifeLesson: string;
  images: File[];
  file?: File;
  videoBlob?: Blob;
  metadataURI: string;
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

// Type guard for hex addresses
function isValidHexAddress(address: string): address is `0x${string}` {
  return address.length === 42 && 
         address.startsWith('0x') &&
         /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Safe hex string generation
function generateHexHash(input: string): `0x${string}` {
  try {
    console.log('Generating content hash for:', input);
    const hash = keccak256(toBytes(stringToHex(input)));
    console.log('Generated content hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error generating content hash:', error);
    throw new Error('Failed to generate content hash');
  }
}

const FinalizeCapsule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { 
    createCapsule, 
    isSuccess, 
    txHash, 
    error, 
    isPending, 
    createReceipt, 
    extractCapsuleIdFromReceipt,
    getMintingFee,
    getFeeRecipient
  } = useCapsuleContract();
  
  const [capsuleData, setCapsuleData] = useState<CapsuleData | null>(null);
  const [unlockData, setUnlockData] = useState<UnlockRulesData | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error2, setError2] = useState('');
  const [step, setStep] = useState<'review' | 'uploading' | 'creating' | 'transaction-pending' | 'success'>('review');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [createdCapsuleId, setCreatedCapsuleId] = useState<number | null>(null);
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [successMessageShown, setSuccessMessageShown] = useState(false);
  const [supabaseIndexed, setSupabaseIndexed] = useState(false);

  // 💰 Fee-related state
  const { data: mintingFee } = getMintingFee();
  const { data: feeRecipient } = getFeeRecipient();

  // Get data from navigation state
  const capsuleFormData = location.state?.capsuleFormData as CapsuleData;
  const unlockRules = location.state?.unlockRules as UnlockRulesData;

  useEffect(() => {
    // Check if we have data from the previous steps
    if (!capsuleFormData || !unlockRules) {
      // If no data in state, inform user and redirect
      alert('Capsule data was lost. This can happen if you refresh the page. Please start over.');
      navigate('/create');
      return;
    }

    setCapsuleData(capsuleFormData);
    setUnlockData(unlockRules);
  }, [capsuleFormData, unlockRules, navigate]);

  // Enhanced transaction state monitoring
  useEffect(() => {
    console.log('🔄 Transaction state update:', {
      isPending,
      isSuccess,
      txHash,
      hasReceipt: !!createReceipt,
      transactionSubmitted,
      step,
      successMessageShown
    });

    // If transaction was submitted and is now pending
    if (transactionSubmitted && isPending && step === 'creating') {
      console.log('📤 Transaction is pending, moving to transaction-pending step');
      setStep('transaction-pending');
    }

    // If transaction is successful and we haven't shown success yet
    if (transactionSubmitted && isSuccess && createReceipt && !successMessageShown) {
      console.log('✅ Transaction successful! Processing receipt...');
      
      // Extract capsule ID from receipt
      if (extractCapsuleIdFromReceipt) {
        const capsuleId = extractCapsuleIdFromReceipt(createReceipt);
        if (capsuleId !== null) {
          console.log('🎯 NFT Capsule created with ID:', capsuleId);
          setCreatedCapsuleId(capsuleId);
          // Store the capsule ID for the VaultPreview component
          localStorage.setItem('selectedCapsuleId', capsuleId.toString());
          localStorage.setItem('lastCreatedCapsuleId', capsuleId.toString());
          
          // Index the capsule in Supabase
          indexCapsuleInSupabase(capsuleId, createReceipt);
        }
      }
      
      // Move to success step and show notification
      console.log('🎉 Moving to success step and showing notification');
      setStep('success');
      setShowSuccessNotification(true);
      setSuccessMessageShown(true);
      setIsCreating(false);
      
      // Auto-hide the notification after 10 seconds and navigate
      setTimeout(() => {
        if (showSuccessNotification) {
          handleCloseSuccessNotification();
        }
      }, 10000);
    }

    // If transaction failed
    if (transactionSubmitted && !isPending && !isSuccess && error && !successMessageShown) {
      console.log('❌ Transaction failed:', error);
      setError2(`Transaction failed: ${error.message || 'Unknown error'}`);
      setStep('review');
      setIsCreating(false);
      setTransactionSubmitted(false);
    }
  }, [isPending, isSuccess, createReceipt, extractCapsuleIdFromReceipt, error, transactionSubmitted, step, successMessageShown, showSuccessNotification]);

  // Index capsule in Supabase after successful blockchain transaction
  const indexCapsuleInSupabase = async (capsuleId: number, receipt: any) => {
    if (!SupabaseCapsuleService.isConfigured()) {
      console.warn('Supabase not configured, skipping indexing');
      return;
    }

    if (!capsuleData || !unlockData || !address) {
      console.warn('Missing data for Supabase indexing');
      return;
    }

    try {
      console.log('🗃️ Indexing capsule in Supabase:', capsuleId);

      const supabaseCapsule: InsertUserCapsule = {
        id: capsuleId,
        title: capsuleData.title,
        owner_address: address.toLowerCase(),
        recipient_address: capsuleData.recipient ? capsuleData.recipient.toLowerCase() : undefined,
        unlock_method: unlockData.method,
        content_type: capsuleData.type,
        metadata_uri: uploadResult?.metadataURI,
        is_unlocked: false,
        transaction_hash: receipt.transactionHash,
        block_number: Number(receipt.blockNumber),
      };

      const result = await SupabaseCapsuleService.insertCapsule(supabaseCapsule);
      
      if (result) {
        console.log('✅ Capsule indexed in Supabase successfully:', result);
        setSupabaseIndexed(true);
      } else {
        console.warn('⚠️ Failed to index capsule in Supabase');
      }
    } catch (error) {
      console.error('❌ Error indexing capsule in Supabase:', error);
      // Don't fail the entire process if Supabase indexing fails
    }
  };

  const generateContentHash = (content: string): `0x${string}` => {
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    return generateHexHash(content);
  };

  const getUnlockMethodId = (method: string): number => {
    const methods = {
      'passphrase': 0,      // PASSPHRASE
      'qa': 1,              // QA
      'payment': 2,         // PAYMENT
      'qrcode': 3,          // QRCODE
      'geolocation': 4,     // GEOLOCATION_SIMULATED
      'token': 5,           // TOKEN
      'quiz': 6,            // QUIZ
      'timed': 7            // TIMED
    };
    return methods[method as keyof typeof methods] || 0;
  };

  const transformUnlockRules = (unlockRules: UnlockRulesData) => {
    // Default values (zero values for unused parameters) - properly typed
    let unlockConditionHash: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000';
    let unlockAmount = 0n;
    let unlockTokenAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    let requiredNFTContract: `0x${string}` = '0x0000000000000000000000000000000000000000';
    let unlockTokenId = 0n;
    let unlockTimestamp = 0n;

    // Validate unlock rules
    if (!unlockRules || typeof unlockRules.method !== 'string') {
      throw new Error('Invalid unlock rules: method is required');
    }

    // Assign meaningful values based on unlock method
    switch (unlockRules.method) {
      case 'passphrase':
        if (unlockRules.passphrase) {
          unlockConditionHash = generateHexHash(unlockRules.passphrase);
        } else {
          throw new Error('Passphrase is required for passphrase unlock method');
        }
        break;

      case 'qa':
        if (unlockRules.personName && unlockRules.dateOfBirth && unlockRules.mothersName) {
          const combinedData = `${unlockRules.personName}${unlockRules.dateOfBirth}${unlockRules.mothersName}`;
          unlockConditionHash = generateHexHash(combinedData);
        } else {
          throw new Error('Person name, date of birth, and mother\'s name are required for Q&A unlock method');
        }
        break;

      case 'payment':
        if (unlockRules.unlockFee && unlockRules.unlockFee > 0) {
          try {
            unlockAmount = parseEther(unlockRules.unlockFee.toString());
          } catch (error) {
            throw new Error('Invalid unlock fee amount');
          }
        } else {
          throw new Error('Unlock fee must be greater than 0 for payment unlock method');
        }
        break;

      case 'qrcode':
        if (unlockRules.qrPhrase) {
          unlockConditionHash = generateHexHash(unlockRules.qrPhrase);
        } else {
          throw new Error('QR phrase is required for QR code unlock method');
        }
        break;

      case 'geolocation':
        if (unlockRules.location) {
          unlockConditionHash = generateHexHash(unlockRules.location);
        } else {
          throw new Error('Location is required for geolocation unlock method');
        }
        break;

      case 'token':
        // Handle separate ERC-20 and ERC-721 addresses with improved logic
        let hasERC20 = false;
        let hasERC721 = false;

        // Check for ERC-20 token address and amount
        if (unlockRules.erc20TokenAddress && isValidHexAddress(unlockRules.erc20TokenAddress)) {
          unlockTokenAddress = unlockRules.erc20TokenAddress;
          
          // Handle ERC-20 unlock amount
          if (unlockRules.erc20UnlockAmount && unlockRules.erc20UnlockAmount > 0) {
            try {
              // Convert the token amount to wei (assuming 18 decimals for most ERC-20 tokens)
              unlockAmount = parseEther(unlockRules.erc20UnlockAmount.toString());
              hasERC20 = true;
            } catch (error) {
              throw new Error('Invalid ERC-20 unlock amount');
            }
          }
        }

        // Check for ERC-721 contract address
        if (unlockRules.erc721ContractAddress && isValidHexAddress(unlockRules.erc721ContractAddress)) {
          requiredNFTContract = unlockRules.erc721ContractAddress;
          hasERC721 = true;
          
          // Set token ID if provided (for ERC-721), otherwise keep as 0
          if (unlockRules.unlockTokenId && unlockRules.unlockTokenId !== '') {
            try {
              unlockTokenId = BigInt(unlockRules.unlockTokenId);
            } catch (error) {
              throw new Error('Invalid token ID');
            }
          }
        }

        // Ensure at least one token requirement is specified
        if (!hasERC20 && !hasERC721) {
          throw new Error('At least one token requirement (ERC-20 with amount or ERC-721) must be specified for token unlock method');
        }

        // For backward compatibility with current contract, use ERC-20 address as fallback for NFT contract if not specified
        if (hasERC20 && !hasERC721) {
          requiredNFTContract = unlockTokenAddress;
        }

        // If only ERC-721 is specified, use it as the token address too for backward compatibility
        if (hasERC721 && !hasERC20) {
          unlockTokenAddress = requiredNFTContract;
        }

        break;

      case 'quiz':
        if (unlockRules.quizAnswer) {
          unlockConditionHash = generateHexHash(unlockRules.quizAnswer.toLowerCase());
        } else {
          throw new Error('Quiz answer is required for quiz unlock method');
        }
        break;

      case 'timed':
        if (unlockRules.unlockDate) {
          try {
            const unlockDate = new Date(unlockRules.unlockDate);
            if (isNaN(unlockDate.getTime())) {
              throw new Error('Invalid date format');
            }
            if (unlockDate.getTime() <= Date.now()) {
              throw new Error('Unlock date must be in the future');
            }
            unlockTimestamp = BigInt(Math.floor(unlockDate.getTime() / 1000));
          } catch (error) {
            throw new Error('Invalid unlock date');
          }
        } else {
          throw new Error('Unlock date is required for timed unlock method');
        }
        break;

      default:
        throw new Error(`Unknown unlock method: ${unlockRules.method}`);
    }

    return {
      unlockConditionHash,
      unlockAmount,
      unlockTokenAddress,
      requiredNFTContract,
      unlockTokenId,
      unlockTimestamp,
    };
  };

  const handleCreateCapsule = async () => {
    if (!isConnected) {
      setError2('Please connect your wallet first');
      return;
    }

    if (!capsuleData || !unlockData) {
      setError2('Missing capsule or unlock data');
      return;
    }

    // Check Pinata configuration
    if (!isPinataConfigured()) {
      setError2('Pinata is not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your .env file to upload to IPFS.');
      return;
    }

    // Null safety check for contract function
    if (!createCapsule) {
      setError2('Contract not ready. Please ensure your wallet is connected to the correct network.');
      return;
    }

    // 💰 Check minting fee
    if (!mintingFee) {
      setError2('Unable to fetch minting fee. Please try again.');
      return;
    }

    setIsCreating(true);
    setStep('uploading');
    setError2('');
    setTransactionSubmitted(false);
    setSuccessMessageShown(false);
    setSupabaseIndexed(false);

    try {
      // Step 1: Upload content to Pinata IPFS
      setIsUploading(true);
      setUploadProgress('Preparing content for upload...');

      console.log('Starting Pinata IPFS upload process...');
      
      // Prepare content for upload
      const textContent = capsuleData.type === 'text' ? capsuleData.message : undefined;
      const videoContent = capsuleData.type === 'video' ? (capsuleData.file || capsuleData.videoBlob) : undefined;
      
      setUploadProgress('Uploading to Pinata IPFS...');
      
      // Upload complete capsule to Pinata with life lesson
      const uploadResult = await uploadCompleteCapsule(
        capsuleData.title,
        capsuleData.message || `${capsuleData.type} capsule: ${capsuleData.title}`,
        capsuleData.type,
        unlockData.method,
        address!, // creator address
        capsuleData.recipient || undefined,
        textContent,
        videoContent,
        capsuleData.images,
        capsuleData.lifeLesson || undefined // NEW: Pass life lesson to upload
      );

      console.log('Pinata upload completed:', uploadResult);
      setUploadResult(uploadResult);
      setUploadProgress('Upload completed successfully!');
      setIsUploading(false);

      // Step 2: Create NFT capsule on blockchain
      setStep('creating');

      // Transform unlock rules to contract parameters
      const {
        unlockConditionHash,
        unlockAmount,
        unlockTokenAddress,
        requiredNFTContract,
        unlockTokenId,
        unlockTimestamp,
      } = transformUnlockRules(unlockData);

      // Generate content hash from the message/content
      const contentToHash = capsuleData.type === 'text' 
        ? capsuleData.message 
        : `video-${capsuleData.title}-${Date.now()}`;
      const contentHash = generateContentHash(contentToHash);

      // Determine recipient address with proper validation
      let recipientAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
      if (capsuleData.recipient && capsuleData.recipient.trim()) {
        if (isValidHexAddress(capsuleData.recipient.trim())) {
          recipientAddress = capsuleData.recipient.trim() as `0x${string}`;
        } else {
          throw new Error('Invalid recipient address format');
        }
      }

      console.log('🚀 Submitting transaction to blockchain with minting fee...');
      console.log('💰 Minting fee:', formatEther(mintingFee), 'ETH');
      setTransactionSubmitted(true);

      // Create NFT capsule on blockchain with minting fee
      const result = await createCapsule(
        recipientAddress,
        capsuleData.title,
        contentHash,
        capsuleData.type === 'text' ? 0 : 1, // ContentType enum: TEXT = 0, VIDEO = 1
        unlockData.method, // Pass method as string, will be converted to ID in hook
        unlockConditionHash,
        unlockAmount,
        unlockTokenAddress,
        requiredNFTContract,
        unlockTokenId,
        unlockTimestamp,
        uploadResult.metadataURI,
        mintingFee // 💰 Pass minting fee
      );

      console.log('📤 Transaction submitted with minting fee:', result);
      
      // The useEffect will handle the success state transition
      
    } catch (error: any) {
      console.error('❌ Error creating NFT capsule:', error);
      setError2(error.message || 'Failed to create NFT capsule. Please try again.');
      setStep('review');
      setIsCreating(false);
      setTransactionSubmitted(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseSuccessNotification = () => {
    console.log('🎯 Closing success notification and navigating to preview');
    setShowSuccessNotification(false);
    
    // Navigate to the vault preview to test the unlock process
    if (createdCapsuleId !== null) {
      localStorage.setItem('selectedCapsuleId', createdCapsuleId.toString());
      navigate('/preview');
    } else {
      // Fallback: navigate to preview anyway
      navigate('/preview');
    }
  };

  const handleTestUnlock = () => {
    if (createdCapsuleId !== null) {
      // Store the capsule ID for VaultPreview
      localStorage.setItem('selectedCapsuleId', createdCapsuleId.toString());
      navigate('/preview');
    } else {
      // Fallback: navigate to preview anyway
      navigate('/preview');
    }
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

  // Show loading if no data
  if (!capsuleData || !unlockData) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">Loading capsule data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalize Your Legacy NFT Capsule</h1>
          
          {step === 'review' && (
            <div className="space-y-8">
              {/* 💰 Minting Fee Display */}
              {mintingFee && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-blue-900">Minting Fee Required</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Minting Fee</label>
                      <p className="text-2xl font-bold text-blue-900">{formatEther(mintingFee)} ETH</p>
                      <p className="text-sm text-blue-600">Required to mint your NFT capsule</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Fee Recipient</label>
                      <p className="text-blue-900 font-mono text-sm">
                        {feeRecipient ? `${feeRecipient.slice(0, 6)}...${feeRecipient.slice(-4)}` : 'Loading...'}
                      </p>
                      <p className="text-sm text-blue-600">Platform fee collection address</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Note:</strong> This fee covers the cost of minting your NFT on the blockchain. 
                      Any excess payment will be automatically refunded to your wallet.
                    </p>
                  </div>
                </div>
              )}

              {/* NFT Information */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Hash className="h-6 w-6 mr-2" />
                  NFT Capsule Summary
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                    <p className="text-gray-900">{capsuleData.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                    <p className="text-gray-900 capitalize">{capsuleData.type} Message NFT</p>
                  </div>
                  
                  {capsuleData.recipient && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Recipient</label>
                      <p className="text-gray-900 font-mono text-sm">{capsuleData.recipient}</p>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Content Preview</label>
                    <p className="text-gray-900">
                      {capsuleData.message.length > 200 
                        ? `${capsuleData.message.substring(0, 200)}...` 
                        : capsuleData.message}
                    </p>
                  </div>

                  {/* NEW: Life Lesson Display */}
                  {capsuleData.lifeLesson && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Life Lesson or Connected Event</label>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-gray-900 italic">
                          "{capsuleData.lifeLesson}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Unlock Method Summary */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Unlock Method</h2>
                
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-lg font-medium text-gray-900">
                    {getMethodDisplayName(unlockData.method)}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  {unlockData.method === 'passphrase' && (
                    <p className="text-gray-600">Protected by a secret passphrase</p>
                  )}
                  {unlockData.method === 'qa' && (
                    <p className="text-gray-600">
                      Requires personal information: name, date of birth, and mother's name
                    </p>
                  )}
                  {unlockData.method === 'payment' && (
                    <p className="text-gray-600">
                      Requires payment of {unlockData.unlockFee} ETH to unlock
                    </p>
                  )}
                  {unlockData.method === 'qrcode' && (
                    <p className="text-gray-600">Requires scanning a QR code for the unlock phrase</p>
                  )}
                  {unlockData.method === 'geolocation' && (
                    <p className="text-gray-600">
                      Can only be unlocked in: {unlockData.location}
                    </p>
                  )}
                  {unlockData.method === 'token' && (
                    <div className="space-y-3">
                      <p className="text-gray-600 font-medium">Token Requirements:</p>
                      
                      {unlockData.erc20TokenAddress && unlockData.erc20UnlockAmount && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center mb-2">
                            <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-gray-900">ERC-20 Token</span>
                          </div>
                          <p className="text-sm text-gray-600 font-mono break-all mb-2">
                            {unlockData.erc20TokenAddress}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Required Amount:</strong> {unlockData.erc20UnlockAmount} tokens
                          </p>
                        </div>
                      )}
                      
                      {unlockData.erc721ContractAddress && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center mb-2">
                            <Wallet className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="font-medium text-gray-900">ERC-721 NFT</span>
                          </div>
                          <p className="text-sm text-gray-600 font-mono break-all">
                            {unlockData.erc721ContractAddress}
                          </p>
                          {unlockData.unlockTokenId && (
                            <p className="text-sm text-gray-600 mt-1">
                              Token ID: #{unlockData.unlockTokenId}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-amber-800 text-sm">
                          <strong>Note:</strong> This capsule uses single-step unlock - only the token ownership verification is required.
                        </p>
                      </div>
                    </div>
                  )}
                  {unlockData.method === 'quiz' && (
                    <p className="text-gray-600">Requires answering a quiz question correctly to unlock</p>
                  )}
                  {unlockData.method === 'timed' && unlockData.unlockDate && (
                    <p className="text-gray-600">
                      Will unlock on: {new Date(unlockData.unlockDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Supabase Integration Status */}
              {SupabaseCapsuleService.isConfigured() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-800">Enhanced Indexing Enabled</h3>
                      <p className="text-blue-700">Your capsule will be indexed in Supabase for faster loading and better search capabilities.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Connection Status */}
              {!isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-800">Wallet Not Connected</h3>
                      <p className="text-yellow-700">Please connect your wallet to mint the NFT capsule on the blockchain.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-green-800">Wallet Connected</h3>
                      <p className="text-green-700 font-mono text-sm">
                        NFT will be minted to: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      {mintingFee && (
                        <p className="text-green-700 text-sm mt-1">
                          💰 Minting fee: {formatEther(mintingFee)} ETH will be charged
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error2 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error2}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/unlock-rules')}
                  className="flex-1"
                >
                  Back to Edit
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateCapsule}
                  disabled={!isConnected || isCreating || isPending || !mintingFee}
                  className="flex-1"
                >
                  {isCreating || isPending ? 'Creating NFT...' : `Pay ${mintingFee ? formatEther(mintingFee) : '...'} ETH & Mint NFT`}
                </Button>
              </div>
            </div>
          )}

          {step === 'uploading' && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Cloud className="h-12 w-12 text-blue-600 mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Uploading to Pinata IPFS</h2>
              <p className="text-gray-600 mb-6">
                Your content is being uploaded to Pinata IPFS for permanent storage.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  {uploadProgress}
                </p>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Preparing Transaction</h2>
              <p className="text-gray-600 mb-6">
                Your content has been uploaded to Pinata IPFS. Now preparing the blockchain transaction...
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  Please wait while we prepare your NFT minting transaction with the required fee.
                </p>
                {mintingFee && (
                  <p className="text-blue-800 text-sm mt-2 font-medium">
                    💰 Minting fee: {formatEther(mintingFee)} ETH
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'transaction-pending' && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-orange-600 mx-auto mb-6 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-orange-100 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔄 Transaction Pending</h2>
              <p className="text-gray-600 mb-6">
                Please confirm the transaction in your wallet and wait for it to be processed on the blockchain.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
                  <p className="text-orange-800 font-medium">
                    ⚠️ Please check your wallet and confirm the transaction
                  </p>
                </div>
                <p className="text-orange-700 text-sm">
                  Do not close this page while the transaction is being processed. The success message will appear automatically once confirmed.
                </p>
                {mintingFee && (
                  <p className="text-orange-800 text-sm mt-2 font-medium">
                    💰 Transaction includes {formatEther(mintingFee)} ETH minting fee
                  </p>
                )}
              </div>
              
              {/* Show transaction hash if available */}
              {txHash && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                  <p className="text-xs font-mono text-gray-900 break-all">{txHash}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    You can track this transaction on the blockchain explorer
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="relative mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">🎉 NFT Capsule Created Successfully!</h2>
              <p className="text-gray-600 mb-8">
                Your legacy NFT capsule has been securely minted on the blockchain with content stored permanently on Pinata IPFS.
              </p>
              
              {createdCapsuleId !== null && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <p className="text-sm text-blue-600 mb-2">🎯 NFT Capsule ID:</p>
                  <p className="font-mono text-2xl text-blue-900 font-bold">#{createdCapsuleId}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    This ID has been saved for easy access in the Vault Preview
                  </p>
                </div>
              )}

              {/* Fee Payment Confirmation */}
              {mintingFee && (
                <div className="bg-green-50 rounded-lg p-4 mb-8">
                  <div className="flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">
                      ✅ Minting fee of {formatEther(mintingFee)} ETH successfully paid
                    </p>
                  </div>
                </div>
              )}

              {/* Supabase Indexing Status */}
              {SupabaseCapsuleService.isConfigured() && (
                <div className="bg-green-50 rounded-lg p-4 mb-8">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">
                      {supabaseIndexed ? '✅ Indexed in Supabase for fast access' : '🔄 Indexing in Supabase...'}
                    </p>
                  </div>
                </div>
              )}
              
              {txHash && (
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-600 mb-2">✅ Transaction Hash:</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{txHash}</p>
                </div>
              )}

              {uploadResult && (
                <div className="bg-blue-50 rounded-lg p-4 mb-8">
                  <p className="text-sm text-blue-600 mb-2">🌐 Pinata IPFS Metadata URI:</p>
                  <p className="font-mono text-sm text-blue-900 break-all">{uploadResult.metadataURI}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleTestUnlock}
                  className="w-full"
                >
                  🔓 Test Unlock Process
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/my-capsules')}
                  className="w-full"
                >
                  View My Capsules
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Return to Home
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  🎊 Success notification will auto-close in 10 seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Success Notification with QR Code - Only show after transaction success */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={handleCloseSuccessNotification}
        metadataURI={uploadResult?.metadataURI}
        txHash={txHash}
        title={capsuleData?.title || 'NFT Capsule'}
        capsuleId={createdCapsuleId || undefined}
      />
    </>
  );
};

export default FinalizeCapsule;