import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { legacyCapsuleABI } from '../contracts/abi';
import { decodeEventLog, keccak256, toBytes, stringToHex, parseEther } from 'viem';

// Load contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

// Type guard to ensure proper hex string format
function isValidHexAddress(address: string | undefined): address is `0x${string}` {
  return typeof address === 'string' && 
         address.length === 42 && 
         address.startsWith('0x') &&
         /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Type guard for hex strings
function isValidHexString(hex: string | undefined): hex is `0x${string}` {
  return typeof hex === 'string' && 
         hex.startsWith('0x') &&
         /^0x[a-fA-F0-9]*$/.test(hex);
}

export function useCapsuleContract() {
  // Validate contract address
  const isValidAddress = isValidHexAddress(CONTRACT_ADDRESS);

  const { 
    data: createHash, 
    writeContract: writeCreateCapsule, 
    error: createError,
    isPending: isCreatePending 
  } = useWriteContract();

  const { 
    data: passphraseHash, 
    writeContract: writeSubmitPassphrase, 
    error: passphraseError,
    isPending: isPassphrasePending 
  } = useWriteContract();

  const { 
    data: birthdayHash, 
    writeContract: writeVerifyBirthday, 
    error: birthdayError,
    isPending: isBirthdayPending 
  } = useWriteContract();

  const { 
    data: tokenHash, 
    writeContract: writeVerifyToken, 
    error: tokenError,
    isPending: isTokenPending 
  } = useWriteContract();

  const { 
    data: nftHash, 
    writeContract: writeVerifyNFT, 
    error: nftError,
    isPending: isNFTPending 
  } = useWriteContract();

  const { 
    data: qrHash, 
    writeContract: writeVerifyQR, 
    error: qrError,
    isPending: isQRPending 
  } = useWriteContract();

  const { 
    data: finalizeHash, 
    writeContract: writeFinalizeUnlock, 
    error: finalizeError,
    isPending: isFinalizePending 
  } = useWriteContract();

  const { 
    data: paymentHash, 
    writeContract: writeUnlockWithPayment, 
    error: paymentError,
    isPending: isPaymentPending 
  } = useWriteContract();

  const { 
    data: transferHash, 
    writeContract: writeTransferCapsule, 
    error: transferError,
    isPending: isTransferPending 
  } = useWriteContract();

  const { 
    data: createReceipt, 
    isSuccess: isCreateSuccess 
  } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { 
    data: passphraseReceipt, 
    isSuccess: isPassphraseSuccess 
  } = useWaitForTransactionReceipt({
    hash: passphraseHash,
  });

  const { 
    data: birthdayReceipt, 
    isSuccess: isBirthdaySuccess 
  } = useWaitForTransactionReceipt({
    hash: birthdayHash,
  });

  const { 
    data: tokenReceipt, 
    isSuccess: isTokenSuccess 
  } = useWaitForTransactionReceipt({
    hash: tokenHash,
  });

  const { 
    data: nftReceipt, 
    isSuccess: isNFTSuccess 
  } = useWaitForTransactionReceipt({
    hash: nftHash,
  });

  const { 
    data: qrReceipt, 
    isSuccess: isQRSuccess 
  } = useWaitForTransactionReceipt({
    hash: qrHash,
  });

  const { 
    data: finalizeReceipt, 
    isSuccess: isFinalizeSuccess 
  } = useWaitForTransactionReceipt({
    hash: finalizeHash,
  });

  const { 
    data: paymentReceipt, 
    isSuccess: isPaymentSuccess 
  } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  const { 
    data: transferReceipt, 
    isSuccess: isTransferSuccess 
  } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Function to extract capsule ID from transaction receipt
  const extractCapsuleIdFromReceipt = (receipt: any): number | null => {
    if (!receipt || !receipt.logs) {
      console.log('No receipt or logs found');
      return null;
    }

    try {
      // Look for CapsuleCreated event in the logs
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: legacyCapsuleABI,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === 'CapsuleCreated') {
            const capsuleId = Number(decodedLog.args.capsuleId);
            console.log('Extracted capsule ID from receipt:', capsuleId);
            return capsuleId;
          }
        } catch (decodeError) {
          // Skip logs that don't match our ABI
          continue;
        }
      }
    } catch (error) {
      console.error('Error extracting capsule ID from receipt:', error);
    }

    return null;
  };

  // Helper function to get unlock method ID from string
  const getUnlockMethodId = (method: string): number => {
    const methods = {
      'passphrase': 0,      // PASSPHRASE
      'qa': 1,              // QA
      'payment': 2,         // PAYMENT
      'qrcode': 3,          // QRCODE
      'geolocation': 4,     // GEOLOCATION
      'token': 5,           // TOKEN
      'quiz': 6,            // QUIZ
      'timed': 7            // TIMED
    };
    return methods[method as keyof typeof methods] || 0;
  };

  if (!isValidAddress) {
    console.error('Valid contract address not found. Please set VITE_CONTRACT_ADDRESS in your .env file');
    console.log('Current CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
    return {
      createCapsule: null,
      submitPassphrase: null,
      verifyBirthdayTimestamp: null,
      verifyTokenOwnership: null,
      verifyNFTOwnership: null,
      verifyQRCode: null,
      finalizeUnlock: null,
      unlockWithPayment: null,
      transferCapsule: null,
      getCapsuleOwner: null,
      getTokenURI: null,
      getCapsuleData: null,
      getCapsuleCounter: null,
      getContentHash: null,
      getUnlockMethodName: null,
      getMintingFee: null,
      getFeeRecipient: null,
      isSuccess: false,
      txHash: undefined,
      contractAddress: undefined,
      error: 'Contract address not configured. Please deploy a contract and set VITE_CONTRACT_ADDRESS in your .env file.',
      isPending: false,
      isTransferring: false,
      createReceipt: null,
      extractCapsuleIdFromReceipt: null,
      verificationStatuses: {
        passphrase: { isSuccess: false, isPending: false, error: null },
        birthday: { isSuccess: false, isPending: false, error: null },
        token: { isSuccess: false, isPending: false, error: null },
        nft: { isSuccess: false, isPending: false, error: null },
        qr: { isSuccess: false, isPending: false, error: null },
        finalize: { isSuccess: false, isPending: false, error: null },
        payment: { isSuccess: false, isPending: false, error: null },
      },
    };
  }

  return {
    createCapsule: async (
      recipient: `0x${string}`,
      title: string,
      contentHash: `0x${string}`,
      contentType: number,
      unlockMethod: string,
      unlockConditionHash: `0x${string}`,
      unlockAmount: bigint,
      unlockTokenAddress: `0x${string}`,
      requiredNFTContract: `0x${string}`,
      unlockTokenId: bigint,
      unlockTimestamp: bigint,
      metadataURI: string,
      mintingFee: bigint
    ) => {
      // Validate hex string parameters
      if (!isValidHexString(contentHash)) {
        throw new Error('Invalid content hash format. Must be a valid hex string.');
      }
      if (!isValidHexAddress(recipient)) {
        throw new Error('Invalid recipient address format. Must be a valid Ethereum address.');
      }
      if (!isValidHexString(unlockConditionHash)) {
        throw new Error('Invalid unlock condition hash format. Must be a valid hex string.');
      }
      if (!isValidHexAddress(unlockTokenAddress)) {
        throw new Error('Invalid unlock token address format. Must be a valid Ethereum address.');
      }
      if (!isValidHexAddress(requiredNFTContract)) {
        throw new Error('Invalid required NFT contract address format. Must be a valid Ethereum address.');
      }

      try {
        const unlockMethodId = getUnlockMethodId(unlockMethod);
        
        console.log('🚀 Creating NFT capsule with v04 contract params (with minting fee):', {
          recipient,
          title,
          contentHash,
          contentType,
          unlockMethod,
          unlockMethodId,
          unlockConditionHash: unlockConditionHash.toString(),
          unlockAmount: unlockAmount.toString(),
          unlockTokenAddress,
          requiredNFTContract,
          unlockTokenId: unlockTokenId.toString(),
          unlockTimestamp: unlockTimestamp.toString(),
          metadataURI,
          mintingFee: mintingFee.toString()
        });
        
        // Use v04 contract function signature (with contentType and unlockMethod parameters) + minting fee
        const result = await writeCreateCapsule({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'createCapsule',
          args: [
            recipient,
            title,
            metadataURI,
            contentHash,
            contentType, // ContentType enum (0 = TEXT, 1 = VIDEO)
            unlockMethodId, // UnlockMethod enum (0-7)
            unlockConditionHash, // passphraseHash
            unlockTimestamp, // birthdayUnlockTimestamp
            unlockAmount,
            unlockTokenAddress,
            requiredNFTContract, // requiredNFTContract
            unlockTokenId, // requiredNFTTokenId
            unlockConditionHash, // qrCodeHash (using same hash for simplicity)
          ],
          value: mintingFee, // 💰 Send minting fee with transaction
        });

        console.log('📤 Transaction submitted successfully with minting fee:', result);
        return result;
      } catch (error) {
        console.error('❌ Error creating capsule:', error);
        
        // Enhanced error handling for better debugging
        if (error instanceof Error) {
          if (error.message.includes('user rejected')) {
            throw new Error('Transaction was rejected by user');
          } else if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient funds for transaction and minting fee');
          } else if (error.message.includes('Insufficient minting fee')) {
            throw new Error('Insufficient minting fee sent with transaction');
          } else if (error.message.includes('execution reverted')) {
            throw new Error('Contract execution failed - please check your parameters and minting fee');
          } else if (error.message.includes('network')) {
            throw new Error('Network error - please check your connection');
          }
        }
        
        throw new Error(`Failed to create capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    submitPassphrase: async (capsuleId: bigint, passphrase: string) => {
      try {
        const passphraseHash = keccak256(toBytes(stringToHex(passphrase)));
        console.log('Submitting passphrase for capsule:', capsuleId.toString());
        
        return writeSubmitPassphrase({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'submitPassphrase',
          args: [capsuleId, passphraseHash],
        });
      } catch (error) {
        console.error('Error submitting passphrase:', error);
        throw new Error(`Failed to submit passphrase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    verifyBirthdayTimestamp: async (capsuleId: bigint) => {
      try {
        console.log('Verifying birthday timestamp for capsule:', capsuleId.toString());
        
        return writeVerifyBirthday({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'verifyBirthdayTimestamp',
          args: [capsuleId],
        });
      } catch (error) {
        console.error('Error verifying birthday:', error);
        throw new Error(`Failed to verify birthday: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    verifyTokenOwnership: async (capsuleId: bigint) => {
      try {
        console.log('Verifying token ownership for capsule:', capsuleId.toString());
        
        return writeVerifyToken({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'verifyTokenOwnership',
          args: [capsuleId],
        });
      } catch (error) {
        console.error('Error verifying token ownership:', error);
        throw new Error(`Failed to verify token ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    verifyNFTOwnership: async (capsuleId: bigint) => {
      try {
        console.log('Verifying NFT ownership for capsule:', capsuleId.toString());
        
        return writeVerifyNFT({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'verifyNFTOwnership',
          args: [capsuleId],
        });
      } catch (error) {
        console.error('Error verifying NFT ownership:', error);
        throw new Error(`Failed to verify NFT ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    verifyQRCode: async (capsuleId: bigint, qrPhrase: string) => {
      try {
        const qrHash = keccak256(toBytes(stringToHex(qrPhrase)));
        console.log('Verifying QR code for capsule:', capsuleId.toString());
        
        return writeVerifyQR({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'verifyQRCode',
          args: [capsuleId, qrHash],
        });
      } catch (error) {
        console.error('Error verifying QR code:', error);
        throw new Error(`Failed to verify QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    finalizeUnlock: async (capsuleId: bigint) => {
      try {
        console.log('Finalizing unlock for capsule:', capsuleId.toString());
        
        return writeFinalizeUnlock({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'finalizeUnlock',
          args: [capsuleId],
        });
      } catch (error) {
        console.error('Error finalizing unlock:', error);
        throw new Error(`Failed to finalize unlock: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    unlockWithPayment: async (capsuleId: bigint, paymentAmount: bigint) => {
      try {
        console.log('Unlocking with payment for capsule:', capsuleId.toString(), 'Amount:', paymentAmount.toString());
        
        return writeUnlockWithPayment({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'unlockWithPayment',
          args: [capsuleId],
          value: paymentAmount,
        });
      } catch (error) {
        console.error('Error unlocking with payment:', error);
        throw new Error(`Failed to unlock with payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    transferCapsule: async (from: `0x${string}`, to: `0x${string}`, tokenId: bigint) => {
      if (!isValidHexAddress(from) || !isValidHexAddress(to)) {
        throw new Error('Invalid address format for transfer.');
      }

      try {
        console.log('Transferring NFT capsule:', { from, to, tokenId: tokenId.toString() });
        
        return writeTransferCapsule({
          address: CONTRACT_ADDRESS,
          abi: legacyCapsuleABI,
          functionName: 'safeTransferFrom',
          args: [from, to, tokenId],
        });
      } catch (error) {
        console.error('Error transferring capsule:', error);
        throw new Error(`Failed to transfer capsule: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getCapsuleOwner: (tokenId: bigint, options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'ownerOf',
        args: [tokenId],
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getTokenURI: (tokenId: bigint, options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'tokenURI',
        args: [tokenId],
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getCapsuleData: (tokenId: bigint, options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'capsules',
        args: [tokenId],
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getCapsuleCounter: (options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'nextTokenId',
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getContentHash: (capsuleId: bigint, options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'getContentHash',
        args: [capsuleId],
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getUnlockMethodName: (capsuleId: bigint, options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'getUnlockMethodName',
        args: [capsuleId],
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    // 💰 New fee-related functions
    getMintingFee: (options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'getMintingFee',
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    getFeeRecipient: (options?: { enabled?: boolean }) => {
      return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: legacyCapsuleABI,
        functionName: 'getFeeRecipient',
        query: {
          enabled: options?.enabled ?? true,
        },
      });
    },

    isSuccess: isCreateSuccess || isPassphraseSuccess || isBirthdaySuccess || isTokenSuccess || isNFTSuccess || isQRSuccess || isFinalizeSuccess || isPaymentSuccess || isTransferSuccess,
    txHash: createReceipt?.transactionHash || passphraseReceipt?.transactionHash || birthdayReceipt?.transactionHash || tokenReceipt?.transactionHash || nftReceipt?.transactionHash || qrReceipt?.transactionHash || finalizeReceipt?.transactionHash || paymentReceipt?.transactionHash || transferReceipt?.transactionHash,
    contractAddress: CONTRACT_ADDRESS,
    error: createError || passphraseError || birthdayError || tokenError || nftError || qrError || finalizeError || paymentError || transferError ? `Contract interaction failed: ${(createError || passphraseError || birthdayError || tokenError || nftError || qrError || finalizeError || paymentError || transferError)?.message}` : null,
    isPending: isCreatePending || isPassphrasePending || isBirthdayPending || isTokenPending || isNFTPending || isQRPending || isFinalizePending || isPaymentPending,
    isTransferring: isTransferPending, // New granular transfer pending state
    createReceipt,
    extractCapsuleIdFromReceipt,
    verificationStatuses: {
      passphrase: { 
        isSuccess: isPassphraseSuccess, 
        isPending: isPassphrasePending, 
        error: passphraseError?.message || null,
        txHash: passphraseReceipt?.transactionHash
      },
      birthday: { 
        isSuccess: isBirthdaySuccess, 
        isPending: isBirthdayPending, 
        error: birthdayError?.message || null,
        txHash: birthdayReceipt?.transactionHash
      },
      token: { 
        isSuccess: isTokenSuccess, 
        isPending: isTokenPending, 
        error: tokenError?.message || null,
        txHash: tokenReceipt?.transactionHash
      },
      nft: { 
        isSuccess: isNFTSuccess, 
        isPending: isNFTPending, 
        error: nftError?.message || null,
        txHash: nftReceipt?.transactionHash
      },
      qr: { 
        isSuccess: isQRSuccess, 
        isPending: isQRPending, 
        error: qrError?.message || null,
        txHash: qrReceipt?.transactionHash
      },
      finalize: { 
        isSuccess: isFinalizeSuccess, 
        isPending: isFinalizePending, 
        error: finalizeError?.message || null,
        txHash: finalizeReceipt?.transactionHash
      },
      payment: { 
        isSuccess: isPaymentSuccess, 
        isPending: isPaymentPending, 
        error: paymentError?.message || null,
        txHash: paymentReceipt?.transactionHash
      },
    },
  };
}