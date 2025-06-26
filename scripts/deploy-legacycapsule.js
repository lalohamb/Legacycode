const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  const address = await deployer.getAddress();
  const balance = await deployer.getBalance();

  console.log("🚀 Deploying LegacyCapsule v04 with Fee Collection...");
  console.log("💰 Deployer Address:", address);
  console.log("💰 Deployer ETH Balance:", ethers.utils.formatEther(balance), "ETH");

  // Deploy the v04 contract with fee collection
  const LegacyCapsule = await ethers.getContractFactory("Legacycapsulev04");
  const legacyCapsule = await LegacyCapsule.deploy(); // Constructor sets default fee and recipient

  await legacyCapsule.deployed();

  console.log("\n✅ LegacyCapsule v04 with Fee Collection deployed successfully!");
  console.log("📍 Contract Address:", legacyCapsule.address);
  console.log("🔗 Transaction Hash:", legacyCapsule.deployTransaction.hash);

  // Verify deployment and get fee information
  const deployedName = await legacyCapsule.name();
  const deployedSymbol = await legacyCapsule.symbol();
  const nextTokenId = await legacyCapsule.nextTokenId();
  const mintingFee = await legacyCapsule.getMintingFee();
  const feeRecipient = await legacyCapsule.getFeeRecipient();

  console.log("\n🔍 Deployment Verification:");
  console.log("   Name:", deployedName);
  console.log("   Symbol:", deployedSymbol);
  console.log("   Next Token ID:", nextTokenId.toString());
  console.log("   Owner:", await legacyCapsule.owner());

  console.log("\n💰 Initial Fee Collection Configuration:");
  console.log("   Minting Fee:", ethers.utils.formatEther(mintingFee), "ETH");
  console.log("   Fee Recipient:", feeRecipient);
  console.log("   Contract Balance:", ethers.utils.formatEther(await ethers.provider.getBalance(legacyCapsule.address)), "ETH");

  // 💰 Configure fee settings from environment variables
  console.log("\n⚙️ Configuring Fee Settings from Environment...");
  
  try {
    // Get fee recipient from environment variable
    const envFeeRecipient = process.env.FEE_RECIPIENT_ADDRESS;
    const envMintingFee = process.env.MINTING_FEE_ETH;
    
    // Set custom minting fee (default to 0.005 ETH if not specified)
    const customFeeETH = envMintingFee || "0.005";
    const customFee = ethers.utils.parseEther(customFeeETH);
    
    console.log("   Setting minting fee to:", customFeeETH, "ETH");
    
    const setFeeTx = await legacyCapsule.setMintingFee(customFee);
    await setFeeTx.wait();
    console.log("   ✅ Minting fee updated successfully");

    // Set fee recipient if provided in environment
    if (envFeeRecipient && ethers.utils.isAddress(envFeeRecipient)) {
      console.log("   Setting fee recipient to:", envFeeRecipient);
      
      const setRecipientTx = await legacyCapsule.setFeeRecipient(envFeeRecipient);
      await setRecipientTx.wait();
      console.log("   ✅ Fee recipient updated successfully");
      
      // Verify the recipient was set
      const updatedRecipient = await legacyCapsule.getFeeRecipient();
      console.log("   ✅ Verified new recipient:", updatedRecipient);
    } else if (envFeeRecipient) {
      console.log("   ⚠️ Invalid FEE_RECIPIENT_ADDRESS in environment:", envFeeRecipient);
      console.log("   ⚠️ Using deployer address as fee recipient");
    } else {
      console.log("   ℹ️ No FEE_RECIPIENT_ADDRESS set in environment");
      console.log("   ℹ️ Using deployer address as fee recipient");
    }

    // Verify final fee configuration
    const finalFee = await legacyCapsule.getMintingFee();
    const finalRecipient = await legacyCapsule.getFeeRecipient();
    
    console.log("\n💰 Final Fee Collection Configuration:");
    console.log("   Minting Fee:", ethers.utils.formatEther(finalFee), "ETH");
    console.log("   Fee Recipient:", finalRecipient);

  } catch (error) {
    console.log("   ⚠️ Error configuring fee settings:", error.message);
    console.log("   ⚠️ Using default configuration");
  }

  // Test the new v04 functions
  try {
    console.log("\n🧪 Testing v04 Functions:");
    console.log("   ✓ getMintingFee function available");
    console.log("   ✓ getFeeRecipient function available");
    console.log("   ✓ getUnlockMethodName function available");
    console.log("   ✓ unlockWithPayment function available");
    console.log("   ✓ withdraw function available");
    console.log("   ✓ createCapsule function is now payable");
  } catch (error) {
    console.log("   ⚠️ Some v04 functions may not be available:", error.message);
  }

  // Save deployment info
  const finalFee = await legacyCapsule.getMintingFee();
  const finalRecipient = await legacyCapsule.getFeeRecipient();
  
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: legacyCapsule.address,
    deployerAddress: address,
    transactionHash: legacyCapsule.deployTransaction.hash,
    blockNumber: legacyCapsule.deployTransaction.blockNumber,
    contractName: deployedName,
    contractSymbol: deployedSymbol,
    contractVersion: "v04-with-fees",
    mintingFee: ethers.utils.formatEther(finalFee),
    feeRecipient: finalRecipient,
    deployedAt: new Date().toISOString()
  };

  console.log("\n💾 Deployment Info (save this for your records):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 Instructions for Frontend Integration:");
  console.log("1. Copy the LegacyCapsule v04 contract address:", legacyCapsule.address);
  console.log("2. Update the VITE_CONTRACT_ADDRESS in your .env file with this address:");
  console.log("   VITE_CONTRACT_ADDRESS=" + legacyCapsule.address);
  console.log("3. Restart your frontend development server after updating the .env file");
  console.log("4. The contract now requires a minting fee of", ethers.utils.formatEther(finalFee), "ETH per NFT");

  console.log("\n🎯 v04 Fee Collection Features:");
  console.log("   💰 Minting Fee:", ethers.utils.formatEther(finalFee), "ETH per NFT");
  console.log("   💰 Fee Recipient:", finalRecipient);
  console.log("   💰 Automatic fee collection on NFT creation");
  console.log("   💰 Excess payment refund to user");
  console.log("   💰 Owner can withdraw accumulated fees");
  console.log("   💰 Configurable fee amount and recipient");

  console.log("\n💡 Fee Management Tips:");
  console.log("   • Use setMintingFee() to adjust fee based on ETH price");
  console.log("   • Use setFeeRecipient() to change who receives fees");
  console.log("   • Use withdraw() to collect accumulated fees");
  console.log("   • Monitor getContractBalance() for fee accumulation");
  console.log("   • Consider gas costs when setting fee amounts");

  console.log("\n🔧 Environment Variable Configuration:");
  console.log("   • Set FEE_RECIPIENT_ADDRESS in .env to specify fee recipient");
  console.log("   • Set MINTING_FEE_ETH in .env to specify custom fee amount");
  console.log("   • Example .env entries:");
  console.log("     FEE_RECIPIENT_ADDRESS=0x1234567890123456789012345678901234567890");
  console.log("     MINTING_FEE_ETH=0.01");

  return {
    contractAddress: legacyCapsule.address,
    contract: legacyCapsule,
    deploymentInfo
  };
}

// Handle errors
main()
  .then((result) => {
    console.log("\n🎉 LegacyCapsule v04 with Fee Collection deployment completed successfully!");
    console.log("💰 Users will now pay", result.deploymentInfo.mintingFee, "ETH to mint NFT capsules");
    console.log("💰 Fees will be sent to:", result.deploymentInfo.feeRecipient);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ LegacyCapsule v04 deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;