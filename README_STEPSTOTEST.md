# To set up your Hardhat environment for testing and then test your application, follow these steps:
# The Plan
## Part 1: Hardhat Environment Setup
    1. Install Hardhat and Dependencies:
        ◦ Ensure you have Node.js and npm installed.
        ◦ Navigate to your project's root directory in the terminal.
        ◦ Run npm install to install all project dependencies, including Hardhat and its plugins, which are listed in package.json as devDependencies.
    2. Review Hardhat Configuration:
        ◦ Open the hardhat.config.js file.
        ◦ Verify that the networks section includes a hardhat entry configured for a local development network. The current configuration already sets up a local Hardhat network with chainId: 31337 and provides test accounts with ample ETH.
    3. Start Hardhat Local Node:
        ◦ Open a new terminal window.
        ◦ Run the command npx hardhat node.
        ◦ This will start a local blockchain node, providing you with a list of 20 test accounts and their private keys. Keep this terminal window open as long as you are testing your application, as it serves as your local blockchain.

## Part 2: Deploying Contracts to Hardhat Local Network
    1. Create LegacyCapsule Deployment Script:
        ◦ Create a new file named scripts/deploy-legacycapsule.js.
        ◦ Add the following content to this new file:
       const hre = require("hardhat");
       const { ethers } = hre;
       
       async function main() {
         const [deployer] = await ethers.getSigners();
       
         console.log("🚀 Deploying LegacyCapsule contract...");
         console.log("💰 Deployer Address:", deployer.address);
       
         const LegacyCapsule = await ethers.getContractFactory("Legacycapsulev03");
         const legacyCapsule = await LegacyCapsule.deploy(deployer.address); // Pass deployer as initialOwner
       
         await legacyCapsule.deployed();
       
         console.log("\n✅ LegacyCapsule deployed successfully!");
         console.log("📍 Contract Address:", legacyCapsule.address);
         console.log("🔗 Transaction Hash:", legacyCapsule.deployTransaction.hash);
       
         console.log("\n📝 Instructions for Frontend Integration:");
         console.log("1. Copy the LegacyCapsule contract address:", legacyCapsule.address);
         console.log("2. Update the VITE_CONTRACT_ADDRESS in your .env file with this address.");
       
         return {
           contractAddress: legacyCapsule.address,
           contract: legacyCapsule,
         };
       }
       
       main()
         .then(() => process.exit(0))
         .catch((error) => {
           console.error(error);
           process.exit(1);
         });
       Open deploy-legacycapsule.js
       
    2. Add Deployment Script to package.json:
        ◦ Open the package.json file.
        ◦ Add a new script entry under the scripts section:
       "deploy:capsule:hardhat": "npx hardhat run scripts/deploy-legacycapsule.js --network hardhat",
       Open package.json
    3. Deploy LegacyCapsule Contract:
        ◦ In a new terminal window (separate from the one running npx hardhat node), run: npm run deploy:capsule:hardhat
        ◦ Note down the LegacyCapsule contract address from the output.
    4. Deploy MyTestToken Contract:
        ◦ In the same terminal window, run: npm run deploy:token:hardhat
        ◦ Note down the MyTestToken contract address from the output. This address will be used for testing token and NFT ownership. The deployer account (the first account listed by npx hardhat node) will automatically receive all initial tokens.

## Part 3: Running the Frontend Application
    1. Configure Environment Variables:
        ◦ Open your .env file.
        ◦ Update the VITE_CONTRACT_ADDRESS variable with the LegacyCapsule contract address you noted in the previous step.
        ◦ Save the .env file.
    2. Start Frontend Development Server:
        ◦ In a new terminal window, run: npm run dev
        ◦ This will start your React application. Once it's running, open your web browser and navigate to the URL provided (usually http://localhost:5173).

## Part 4: Testing the Application (Multi-Step Unlock)
    1. Connect Wallet:
        ◦ In your browser, click "Connect Wallet" in the header.
        ◦ Connect to the "Hardhat" network using one of the test accounts provided by your npx hardhat node terminal (e.g., the first account, which is the deployer and owns the MyTestToken tokens).
    2. Create a New Capsule with Token Requirements:
        ◦ Navigate to the "Create Capsule" page.
        ◦ Fill in a Title and Message (e.g., "Test Multi-Step Unlock").
        ◦ For Capsule Type, select "Text Message".
        ◦ Click "Upload & Continue to Unlock Rules".
        ◦ On the "Set Capsule Unlock Rules" page, select the "Token" unlock method.
        ◦ In the "ERC-20 Token" section, enter the MyTestToken contract address you deployed earlier into the ERC-20 Token Contract Address field.
        ◦ In the "ERC-721 NFT" section, enter the same MyTestToken contract address into the ERC-721 NFT Contract Address field.
        ◦ For Specific Token ID, enter 1. (This means your connected wallet needs to own token ID 1 of your MyTestToken contract).
        ◦ Click "Next: Finalize Capsule".
    3. Finalize Capsule:
        ◦ Review the capsule details.
        ◦ Click "Mint NFT Capsule".
        ◦ Confirm the transaction in your wallet.
        ◦ Once the transaction is confirmed, you will see a success notification. Note the Capsule ID.
    4. Test Multi-Step Unlock Process:
        ◦ Click "Test Unlock Process" on the success notification, or navigate to the "Vault Preview" page and manually enter the Capsule ID you just created.
        ◦ On the "Vault Preview" page, you will see the "Multi-Step Unlock Required" warning and a list of 5 verification steps.
        ◦ Step 1: Passphrase Verification:
            ▪ In the input field, type demo123.
            ▪ Click "Verify Passphrase". Confirm the transaction in your wallet.
        ◦ Step 2: Birthday Timestamp:
            ▪ Click "Verify Birthday". Confirm the transaction in your wallet. (This step will pass if the current time is past the default birthdayUnlockTimestamp set in the contract, which is usually a past date for testing purposes).
        ◦ Step 3: Token Ownership:
            ▪ Click "Verify Token Ownership". Confirm the transaction in your wallet. (This will check if your connected wallet owns the required amount of MyTestToken).
        ◦ Step 4: NFT Ownership:
            ▪ Click "Verify NFT Ownership". Confirm the transaction in your wallet. (This will check if your connected wallet owns MyTestToken with Token ID 1).
        ◦ Step 5: QR Code Verification:
            ▪ The QR code displayed will encode the phrase unlock-phrase.
            ▪ In the input field, type unlock-phrase.
            ▪ Click "Verify QR Code". Confirm the transaction in your wallet.
        ◦ Finalize Unlock:
            ▪ Once all 5 steps show as "Verified", the "Finalize Unlock" button will become active.
            ▪ Click "Finalize Unlock". Confirm the transaction in your wallet.
    5. Verify Unlocked Content:
        ◦ After successful finalization, the capsule content (your message) should be displayed, indicating that the multi-step unlock process was successful.
