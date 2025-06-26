# Quick Fix Guide - Get LegacyCode Working

## 🚀 Step 1: Deploy Contracts (5 minutes)

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:token:hardhat
npm run deploy:capsule:hardhat
```

**Save the contract addresses from the output!**

## 🔧 Step 2: Update Environment Variables (2 minutes)

Create/update your `.env` file:

```env
# Contract Addresses (from deployment output)
VITE_CONTRACT_ADDRESS=0x... # LegacyCapsule address
VITE_TEST_TOKEN_ADDRESS=0x... # MyTestToken address

# Pinata Configuration (optional for testing)
VITE_PINATA_API_KEY=your_key_here
VITE_PINATA_SECRET_API_KEY=your_secret_here

# IPFS Gateway
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 🎯 Step 3: Generate Correct ABI (3 minutes)

After deploying, the ABI will be in `artifacts/src/contracts/Legacycapsulev03.sol/Legacycapsulev03.json`.

**Note**: The current ABI file is restricted from modification. You'll need to:
1. Copy the ABI from the artifacts folder
2. Update the import in components to use the correct ABI

## 🧪 Step 4: Test Basic Flow (10 minutes)

1. **Start Frontend**:
   ```bash
   npm run dev
   ```

2. **Connect Wallet**:
   - Use MetaMask or wallet connector
   - Connect to Hardhat network (localhost:8545, Chain ID: 31337)
   - Import one of the test accounts from `npx hardhat node` output

3. **Create Test Capsule**:
   - Go to "Create Capsule"
   - Fill in basic info (title, message)
   - Skip Pinata upload for now (will show warning but still work)
   - Continue to unlock rules

4. **Set Simple Unlock Rules**:
   - Choose any unlock method
   - Fill in required fields
   - Continue to finalize

5. **Test Multi-Step Unlock**:
   - Go to "Vault Preview"
   - Try the 5-step verification process
   - Use demo values: passphrase="demo123", qr="unlock-phrase"

## 🔍 Expected Issues and Workarounds

### Issue 1: ABI Mismatch
**Symptom**: "Function not found" errors
**Workaround**: Use the deployment artifacts ABI instead of the current one

### Issue 2: Pinata Not Configured
**Symptom**: Upload warnings
**Workaround**: Skip Pinata for testing, use local storage data

### Issue 3: Multi-Step Confusion
**Symptom**: UI shows single method but requires all 5 steps
**Expected**: This is current contract behavior - all capsules require 5-step verification

### Issue 4: Token Verification Fails
**Symptom**: Token/NFT verification steps fail
**Solution**: Make sure your connected wallet has MyTestToken balance

## 🎯 Success Criteria

You'll know it's working when:
1. ✅ Contracts deploy without errors
2. ✅ Frontend connects to wallet
3. ✅ Can create a capsule (even with warnings)
4. ✅ Can see capsule in "My Capsules"
5. ✅ Can start multi-step unlock process
6. ✅ At least passphrase verification works

## 🚨 If Still Not Working

The main blocker is likely the ABI mismatch. The current `abi.ts` file references a different contract than what you're deploying. You'll need to either:

1. **Option A**: Update the ABI file (requires permission to modify restricted files)
2. **Option B**: Deploy the contract that matches the current ABI
3. **Option C**: Create a new ABI file with a different name and update imports

**Recommendation**: Ask to modify the restricted files configuration so we can update the ABI to match your deployed contract.