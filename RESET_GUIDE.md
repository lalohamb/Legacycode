# 🔄 Reset Hardhat and MetaMask Guide

## 🏗️ **Reset Hardhat Local Node**

### Method 1: Restart the Node (Recommended)
```bash
# 1. Stop the current Hardhat node (Ctrl+C in the terminal)
# 2. Restart with a clean state
npx hardhat node
```

### Method 2: Clear Hardhat Cache (If needed)
```bash
# Stop the node first, then:
npx hardhat clean
rm -rf cache/
rm -rf artifacts/
npx hardhat node
```

### Method 3: Reset with Fresh Accounts
```bash
# This will generate new test accounts
npx hardhat node --reset
```

## 🦊 **Reset MetaMask**

### Option A: Reset Account (Recommended for Development)
1. **Open MetaMask**
2. **Click your account icon** (top right)
3. **Settings** → **Advanced**
4. **Scroll down** to "Reset Account"
5. **Click "Reset Account"** - This clears transaction history and nonce

### Option B: Clear Activity & Nonce Data
1. **MetaMask Settings** → **Advanced**
2. **Clear activity and nonce data**
3. **Confirm the reset**

### Option C: Switch Networks Back and Forth
1. **Switch to Mainnet** (or any other network)
2. **Switch back to Localhost 8545**
3. This often resolves sync issues

## 🔗 **Re-add Hardhat Network to MetaMask**

If you need to re-add the network:

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

## 📋 **Complete Reset Workflow**

### Step 1: Stop Everything
```bash
# Stop Hardhat node (Ctrl+C)
# Close MetaMask
```

### Step 2: Reset Hardhat
```bash
npx hardhat clean
npx hardhat node
```

### Step 3: Reset MetaMask
- Reset Account in MetaMask settings
- Or clear activity & nonce data

### Step 4: Redeploy Contracts
```bash
# In a new terminal:
npm run deploy:token:hardhat
npm run deploy:capsule:hardhat
```

### Step 5: Update Environment
```bash
# Update your .env file with new contract addresses
VITE_CONTRACT_ADDRESS=0x... # New LegacyCapsule address
VITE_TEST_TOKEN_ADDRESS=0x... # New MyTestToken address
```

### Step 6: Clear Browser Data (Optional)
- Clear localStorage: `localStorage.clear()` in browser console
- Or use incognito/private browsing mode

## 🎯 **Quick Reset Script**

Create this script for easy resets:

```bash
#!/bin/bash
# save as reset-dev.sh

echo "🔄 Resetting development environment..."

# Clean Hardhat
echo "🏗️ Cleaning Hardhat..."
npx hardhat clean

# Start fresh node in background
echo "🚀 Starting fresh Hardhat node..."
npx hardhat node &
HARDHAT_PID=$!

# Wait for node to start
sleep 3

# Deploy contracts
echo "📦 Deploying contracts..."
npm run deploy:token:hardhat
npm run deploy:capsule:hardhat

echo "✅ Reset complete!"
echo "🦊 Don't forget to reset MetaMask account!"
echo "🔧 Update your .env file with new contract addresses"
```

## 🚨 **Common Issues & Solutions**

### Issue: "Nonce too high" error
**Solution:** Reset MetaMask account

### Issue: "Contract not found" error  
**Solution:** Redeploy contracts and update .env

### Issue: Old transaction data showing
**Solution:** Clear MetaMask activity data

### Issue: Wrong account balance
**Solution:** Switch MetaMask networks back and forth

## 🗃️ **Reset Supabase Tables**

Since you mentioned you can reset Supabase tables:

```sql
-- In Supabase SQL Editor:
DELETE FROM user_capsules;
-- Or truncate for faster reset:
TRUNCATE user_capsules;
```

## ⚡ **Pro Tips**

1. **Always reset in this order:** Hardhat → MetaMask → Redeploy → Update .env
2. **Use incognito mode** for testing to avoid cache issues
3. **Keep a backup** of your .env file with working addresses
4. **Reset MetaMask first** if you're getting transaction errors
5. **Check the console** for specific error messages to target the right reset

## 🔍 **Verify Reset Success**

After resetting, verify:
- [ ] Hardhat node shows fresh accounts
- [ ] MetaMask shows 10,000 ETH on test accounts  
- [ ] Contract addresses are updated in .env
- [ ] Frontend connects without errors
- [ ] Can create new capsules successfully

This should resolve the sync issues between your Hardhat node and Supabase!