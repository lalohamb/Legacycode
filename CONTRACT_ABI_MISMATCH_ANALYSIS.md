# Contract ABI Mismatch Analysis

## 🔍 Current Situation

### ABI File (`src/contracts/abi.ts`)
- Contract Name: `Legacycapsulefinalizedcorrected`
- Functions: Basic ERC721 + some custom functions
- Missing: Multi-step verification functions

### Actual Contract (`src/contracts/Legacycapsule.sol`)
- Contract Name: `Legacycapsulev03`
- Functions: Multi-step verification system
- Has: `submitPassphrase`, `verifyBirthdayTimestamp`, etc.

## 🚨 Critical Mismatches

### Missing Functions in ABI:
1. `submitPassphrase(uint256 capsuleId, bytes32 providedHash)`
2. `verifyBirthdayTimestamp(uint256 capsuleId)`
3. `verifyTokenOwnership(uint256 capsuleId)`
4. `verifyNFTOwnership(uint256 capsuleId)`
5. `verifyQRCode(uint256 capsuleId, bytes32 providedHash)`
6. `finalizeUnlock(uint256 capsuleId)`

### Different Function Signatures:
- ABI has `createCapsule` with different parameters
- ABI has `unlockCapsule` instead of multi-step process

## 🎯 Required ABI (Based on Legacycapsulev03.sol)

The correct ABI should include these functions:

```typescript
// Constructor
constructor()

// Main functions
createCapsule(
  address recipient,
  string memory title,
  string memory tokenURI,
  bytes32 contentHash,
  bytes32 passphraseHash,
  uint256 birthdayUnlockTimestamp,
  uint256 unlockAmount,
  address unlockTokenAddress,
  address requiredNFTContract,
  uint256 requiredNFTTokenId,
  bytes32 qrCodeHash
)

// Verification functions
submitPassphrase(uint256 capsuleId, bytes32 providedHash)
verifyBirthdayTimestamp(uint256 capsuleId)
verifyTokenOwnership(uint256 capsuleId)
verifyNFTOwnership(uint256 capsuleId)
verifyQRCode(uint256 capsuleId, bytes32 providedHash)
finalizeUnlock(uint256 capsuleId)

// View functions
isCapsuleUnlocked(uint256 capsuleId)
getContentHash(uint256 capsuleId)
capsules(uint256) // Struct getter
nextTokenId()

// ERC721 functions
ownerOf(uint256 tokenId)
tokenURI(uint256 tokenId)
// ... other standard ERC721 functions
```

## 🛠️ Fix Options

### Option 1: Update ABI (Recommended)
- Generate ABI from deployed `Legacycapsulev03` contract
- Replace current `abi.ts` content
- Update all frontend calls to match

### Option 2: Deploy Matching Contract
- Deploy a contract that matches current ABI
- Would require creating new contract file
- Not recommended as current contract is more advanced

### Option 3: Hybrid Approach
- Keep current ABI for basic functions
- Add missing functions manually
- Risk of inconsistencies

## 🎯 Impact on Frontend

### Currently Broken:
- All multi-step verification calls in `VaultPreview.tsx`
- Contract creation calls in `FinalizeCapsule.tsx`
- Capsule data reading in `MyCapsules.tsx`

### Will Work After Fix:
- Complete multi-step unlock flow
- Proper capsule creation
- Accurate capsule listing
- All contract interactions

## 📋 Next Steps

1. **Deploy the Legacycapsulev03 contract**
2. **Extract ABI from artifacts folder**
3. **Update abi.ts file** (requires permission)
4. **Test all contract interactions**
5. **Update any remaining parameter mismatches**

The ABI mismatch is the primary blocker preventing the application from working correctly.