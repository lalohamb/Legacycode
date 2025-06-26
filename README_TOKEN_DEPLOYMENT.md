# ERC-20 Test Token Deployment Guide

This guide explains how to deploy and use the MyTestToken ERC-20 contract for testing the LegacyCapsule token verification features.

## 🚀 Quick Start

### 1. Deploy to Hardhat Local Network

```bash
# Start Hardhat local node (in a separate terminal)
npx hardhat node

# Deploy the token
npm run deploy:token:hardhat
```

### 2. Deploy to Sepolia Testnet

```bash
# Make sure you have SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file
npm run deploy:token:sepolia
```

## 📋 Token Details

- **Name**: LegacyTest Token
- **Symbol**: LTT
- **Decimals**: 18
- **Initial Supply**: 1,000,000 LTT
- **Features**: Mintable, Burnable, Ownable

## 🔧 Contract Features

### Basic ERC-20 Functions
- `transfer()` - Transfer tokens
- `approve()` - Approve spending
- `balanceOf()` - Check balance
- `totalSupply()` - Get total supply

### Owner Functions
- `mint(address to, uint256 amount)` - Mint new tokens
- `airdrop(address[] recipients, uint256[] amounts)` - Batch mint to multiple addresses
- `transferOwnershipWithTokens(address newOwner, uint256 amount)` - Transfer ownership with tokens

### User Functions
- `burn(uint256 amount)` - Burn your own tokens
- `burnFrom(address from, uint256 amount)` - Burn tokens from approved account

## 🧪 Testing with LegacyCapsule

### 1. After Deployment
1. Copy the deployed contract address from the console output
2. Use this address as the `erc20TokenAddress` in your LegacyCapsule unlock rules
3. The deployer account will have 1,000,000 LTT tokens

### 2. Setting Up Token Requirements
When creating a capsule with token requirements:

```javascript
// Example unlock rules for 100 tokens
const unlockRules = {
  method: 'token',
  erc20TokenAddress: '0x...', // Your deployed token address
  // User needs 100 LTT tokens to unlock
};
```

### 3. Testing Token Verification
1. Deploy the token contract
2. Create a LegacyCapsule with token requirements
3. Ensure your wallet has enough LTT tokens
4. Try to unlock the capsule - it should verify your token balance

## 💡 Useful Commands

### Check Token Balance
```bash
npx hardhat console --network hardhat
```

```javascript
const token = await ethers.getContractAt("MyTestToken", "CONTRACT_ADDRESS");
const balance = await token.balanceOf("WALLET_ADDRESS");
console.log("Balance:", ethers.utils.formatEther(balance), "LTT");
```

### Mint More Tokens
```javascript
const token = await ethers.getContractAt("MyTestToken", "CONTRACT_ADDRESS");
await token.mint("RECIPIENT_ADDRESS", ethers.utils.parseEther("1000"));
```

### Transfer Tokens
```javascript
const token = await ethers.getContractAt("MyTestToken", "CONTRACT_ADDRESS");
await token.transfer("RECIPIENT_ADDRESS", ethers.utils.parseEther("100"));
```

## 🔗 Integration with LegacyCapsule

### Current Contract Behavior
The Legacycapsulev03 contract requires:
1. ERC-20 token ownership verification
2. The token address is set during capsule creation
3. Users must own the required amount to pass verification

### Example Integration
```solidity
// In your LegacyCapsule creation
createCapsule(
    recipient,
    title,
    tokenURI,
    contentHash,
    passphraseHash,
    birthdayUnlockTimestamp,
    unlockAmount, // Amount of LTT tokens required
    unlockTokenAddress, // Your deployed LTT contract address
    requiredNFTContract,
    requiredNFTTokenId,
    qrCodeHash
);
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Insufficient token balance"**
   - Make sure your wallet has enough LTT tokens
   - Check the required amount vs your balance

2. **"Contract not found"**
   - Verify the contract address is correct
   - Ensure you're on the right network

3. **"Transaction failed"**
   - Check gas limits
   - Verify you have enough ETH for gas

### Getting Test Tokens

If you need more test tokens:
```bash
npx hardhat console --network hardhat
```

```javascript
const [owner] = await ethers.getSigners();
const token = await ethers.getContractAt("MyTestToken", "CONTRACT_ADDRESS");
await token.mint(owner.address, ethers.utils.parseEther("10000"));
```

## 📝 Notes

- The deployer account receives all initial tokens
- You can mint additional tokens as needed for testing
- The contract is ownable, so only the deployer can mint initially
- Use the `airdrop` function to distribute tokens to multiple test accounts
- Remember to save the contract address for use in your LegacyCapsule configuration

## 🔐 Security Notes

- This is a test token for development only
- Do not use in production without proper security audits
- The owner has unlimited minting power
- Consider implementing caps or time locks for production use