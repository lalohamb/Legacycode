import { keccak256, toBytes, stringToHex, parseEther } from 'viem';

// Type guard to ensure proper hex string format
function isValidHexAddress(address: string | undefined): address is `0x${string}` {
  return typeof address === 'string' && 
         address.length === 42 && 
         address.startsWith('0x') &&
         /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Safe hex string generation
function generateHexHash(input: string): `0x${string}` {
  try {
    return keccak256(toBytes(stringToHex(input)));
  } catch (error) {
    console.error('Error generating hex hash for input:', input, error);
    throw new Error('Failed to generate hash from input string');
  }
}

export function transformUnlockRules(formData: any) {
  // Default values (zero values for unused parameters) - properly typed
  let unlockConditionHash: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000';
  let unlockAmount = 0n;
  let unlockTokenAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
  let requiredNFTContract: `0x${string}` = '0x0000000000000000000000000000000000000000';
  let unlockTokenId = 0n;
  let unlockTimestamp = 0n;

  console.log('Transforming unlock rules for method:', formData.method, formData);

  // Validate form data
  if (!formData || typeof formData.method !== 'string') {
    throw new Error('Invalid form data: method is required');
  }

  switch (formData.method) {
    case 'passphrase':
      if (formData.passphrase && typeof formData.passphrase === 'string') {
        unlockConditionHash = generateHexHash(formData.passphrase);
        console.log('Passphrase hash generated:', unlockConditionHash);
      } else {
        throw new Error('Passphrase is required for passphrase unlock method');
      }
      break;

    case 'qa':
      if (formData.personName && formData.dateOfBirth && formData.mothersName) {
        const combinedData = `${formData.personName}${formData.dateOfBirth}${formData.mothersName}`;
        unlockConditionHash = generateHexHash(combinedData);
        console.log('Q&A combined data:', combinedData);
        console.log('Q&A hash generated:', unlockConditionHash);
      } else {
        throw new Error('Person name, date of birth, and mother\'s name are required for Q&A unlock method');
      }
      break;

    case 'payment':
      if (formData.unlockFee && formData.unlockFee > 0) {
        try {
          unlockAmount = parseEther(formData.unlockFee.toString());
          console.log('Payment amount set:', unlockAmount.toString(), 'Wei (', formData.unlockFee, 'ETH)');
        } catch (error) {
          throw new Error('Invalid unlock fee amount. Must be a valid number.');
        }
      } else {
        throw new Error('Unlock fee must be greater than 0 for payment unlock method');
      }
      break;

    case 'qrcode':
      if (formData.qrPhrase && typeof formData.qrPhrase === 'string') {
        unlockConditionHash = generateHexHash(formData.qrPhrase);
        console.log('QR phrase hash generated:', unlockConditionHash);
      } else {
        throw new Error('QR phrase is required for QR code unlock method');
      }
      break;

    case 'geolocation':
      if (formData.location && typeof formData.location === 'string') {
        unlockConditionHash = generateHexHash(formData.location);
        console.log('Location hash generated:', unlockConditionHash);
      } else {
        throw new Error('Location is required for geolocation unlock method');
      }
      break;

    case 'token':
      // Handle separate ERC-20 and ERC-721 addresses with improved logic
      let hasERC20 = false;
      let hasERC721 = false;

      // Check for ERC-20 token address and amount
      if (formData.erc20TokenAddress && isValidHexAddress(formData.erc20TokenAddress)) {
        unlockTokenAddress = formData.erc20TokenAddress;
        
        // Handle ERC-20 unlock amount
        if (formData.erc20UnlockAmount && formData.erc20UnlockAmount > 0) {
          try {
            // Convert the token amount to wei (assuming 18 decimals for most ERC-20 tokens)
            unlockAmount = parseEther(formData.erc20UnlockAmount.toString());
            hasERC20 = true;
            console.log('ERC-20 token address set:', unlockTokenAddress);
            console.log('ERC-20 unlock amount set:', unlockAmount.toString(), 'Wei (', formData.erc20UnlockAmount, 'tokens)');
          } catch (error) {
            throw new Error('Invalid ERC-20 unlock amount. Must be a valid number.');
          }
        } else {
          console.warn('ERC-20 token address provided but no unlock amount specified');
        }
      }

      // Check for ERC-721 contract address
      if (formData.erc721ContractAddress && isValidHexAddress(formData.erc721ContractAddress)) {
        requiredNFTContract = formData.erc721ContractAddress;
        hasERC721 = true;
        
        // Set token ID if provided (for ERC-721), otherwise keep as 0
        if (formData.unlockTokenId && formData.unlockTokenId !== '') {
          try {
            unlockTokenId = BigInt(formData.unlockTokenId);
            console.log('ERC-721 contract and token ID set:', requiredNFTContract, unlockTokenId.toString());
          } catch (error) {
            throw new Error('Invalid token ID. Must be a valid number.');
          }
        } else {
          console.log('ERC-721 contract set (any token from collection):', requiredNFTContract);
        }
      }

      // Ensure at least one token requirement is specified
      if (!hasERC20 && !hasERC721) {
        throw new Error('At least one token requirement (ERC-20 with amount or ERC-721) must be specified for token unlock method');
      }

      // For backward compatibility with current contract, use ERC-20 address as fallback for NFT contract if not specified
      if (hasERC20 && !hasERC721) {
        requiredNFTContract = unlockTokenAddress;
        console.log('Using ERC-20 address as NFT contract for backward compatibility:', requiredNFTContract);
      }

      // If only ERC-721 is specified, use it as the token address too for backward compatibility
      if (hasERC721 && !hasERC20) {
        unlockTokenAddress = requiredNFTContract;
        console.log('Using ERC-721 address as token address for backward compatibility:', unlockTokenAddress);
      }

      break;

    case 'quiz':
      if (formData.quizAnswer && typeof formData.quizAnswer === 'string') {
        unlockConditionHash = generateHexHash(formData.quizAnswer.toLowerCase());
        console.log('Quiz answer hash generated:', unlockConditionHash);
      } else {
        throw new Error('Quiz answer is required for quiz unlock method');
      }
      break;

    case 'timed':
      if (formData.unlockDate) {
        try {
          const unlockDate = new Date(formData.unlockDate);
          if (isNaN(unlockDate.getTime())) {
            throw new Error('Invalid date format');
          }
          if (unlockDate.getTime() <= Date.now()) {
            throw new Error('Unlock date must be in the future');
          }
          unlockTimestamp = BigInt(Math.floor(unlockDate.getTime() / 1000));
          console.log('Unlock timestamp set:', unlockTimestamp.toString(), 'for date:', formData.unlockDate);
        } catch (error) {
          throw new Error('Invalid unlock date. Must be a valid future date.');
        }
      } else {
        throw new Error('Unlock date is required for timed unlock method');
      }
      break;

    default:
      throw new Error(`Unknown unlock method: ${formData.method}`);
  }

  const result = {
    unlockConditionHash,
    unlockAmount,
    unlockTokenAddress,
    requiredNFTContract,
    unlockTokenId,
    unlockTimestamp,
  };

  console.log('Final transformed unlock rules:', result);
  return result;
}