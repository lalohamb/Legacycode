const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  const address = await deployer.getAddress();
  const balance = await deployer.getBalance();

  console.log("🚀 Deploying MyTestToken...");
  console.log("💰 Deployer Address:", address);
  console.log("💰 Deployer ETH Balance:", ethers.utils.formatEther(balance), "ETH");

  // Token configuration
  const tokenName = "LegacyTest Token";
  const tokenSymbol = "LTT";
  const tokenDecimals = 18;
  const totalSupply = ethers.utils.parseUnits("1000000", tokenDecimals); // 1 million tokens

  console.log("\n📋 Token Configuration:");
  console.log("   Name:", tokenName);
  console.log("   Symbol:", tokenSymbol);
  console.log("   Decimals:", tokenDecimals);
  console.log("   Total Supply:", ethers.utils.formatUnits(totalSupply, tokenDecimals), tokenSymbol);

  // Deploy the contract
  const MyTestToken = await ethers.getContractFactory("MyTestToken");
  const token = await MyTestToken.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    totalSupply
  );

  await token.deployed();

  console.log("\n✅ MyTestToken deployed successfully!");
  console.log("📍 Contract Address:", token.address);
  console.log("🔗 Transaction Hash:", token.deployTransaction.hash);

  // Verify deployment
  const deployedName = await token.name();
  const deployedSymbol = await token.symbol();
  const deployedDecimals = await token.decimals();
  const deployedTotalSupply = await token.totalSupply();
  const deployerBalance = await token.balanceOf(address);

  console.log("\n🔍 Deployment Verification:");
  console.log("   Name:", deployedName);
  console.log("   Symbol:", deployedSymbol);
  console.log("   Decimals:", deployedDecimals);
  console.log("   Total Supply:", ethers.utils.formatUnits(deployedTotalSupply, deployedDecimals));
  console.log("   Deployer Balance:", ethers.utils.formatUnits(deployerBalance, deployedDecimals), deployedSymbol);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: token.address,
    deployerAddress: address,
    transactionHash: token.deployTransaction.hash,
    blockNumber: token.deployTransaction.blockNumber,
    tokenName: deployedName,
    tokenSymbol: deployedSymbol,
    tokenDecimals: deployedDecimals,
    totalSupply: deployedTotalSupply.toString(),
    deployedAt: new Date().toISOString()
  };

  console.log("\n💾 Deployment Info (save this for your records):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for using with LegacyCapsule
  console.log("\n📝 Instructions for LegacyCapsule Integration:");
  console.log("1. Copy the contract address:", token.address);
  console.log("2. Use this address in your LegacyCapsule unlock rules for token verification");
  console.log("3. The deployer account now has", ethers.utils.formatUnits(deployerBalance, deployedDecimals), tokenSymbol);
  console.log("4. You can mint more tokens using the mint() function if needed");
  console.log("5. Use this contract address as the 'erc20TokenAddress' in your unlock rules");

  // Example usage
  console.log("\n🔧 Example Usage:");
  console.log("   - Set unlock amount to:", ethers.utils.parseUnits("100", deployedDecimals).toString(), "wei (100 tokens)");
  console.log("   - Contract address for unlock rules:", token.address);
  console.log("   - Current deployer has enough tokens for testing");

  return {
    contractAddress: token.address,
    contract: token,
    deploymentInfo
  };
}

// Handle errors
main()
  .then((result) => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;