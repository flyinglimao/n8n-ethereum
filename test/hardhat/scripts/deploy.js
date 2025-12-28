const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting contract deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  const deployedContracts = {};

  // Deploy TestContract
  console.log("📦 Deploying TestContract...");
  const TestContract = await hre.ethers.getContractFactory("TestContract");
  const testContract = await TestContract.deploy(42, "Hello from n8n-ethereum!");
  await testContract.waitForDeployment();
  const testContractAddress = await testContract.getAddress();
  console.log("✅ TestContract deployed to:", testContractAddress);
  deployedContracts.TestContract = testContractAddress;

  // Deploy TestERC20
  console.log("\n📦 Deploying TestERC20...");
  const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
  const testERC20 = await TestERC20.deploy(
    "Test Token",
    "TEST",
    18,
    hre.ethers.parseEther("1000000") // 1M tokens
  );
  await testERC20.waitForDeployment();
  const testERC20Address = await testERC20.getAddress();
  console.log("✅ TestERC20 deployed to:", testERC20Address);
  deployedContracts.TestERC20 = testERC20Address;

  // Deploy TestERC721
  console.log("\n📦 Deploying TestERC721...");
  const TestERC721 = await hre.ethers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy("Test NFT", "TNFT");
  await testERC721.waitForDeployment();
  const testERC721Address = await testERC721.getAddress();
  console.log("✅ TestERC721 deployed to:", testERC721Address);
  deployedContracts.TestERC721 = testERC721Address;

  // Mint some NFTs
  console.log("🎨 Minting initial NFTs...");
  await testERC721.mint(deployer.address, "ipfs://QmTest1");
  await testERC721.mint(deployer.address, "ipfs://QmTest2");
  await testERC721.mint(deployer.address, "ipfs://QmTest3");
  console.log("✅ Minted 3 NFTs");

  // Deploy TestERC1155
  console.log("\n📦 Deploying TestERC1155...");
  const TestERC1155 = await hre.ethers.getContractFactory("TestERC1155");
  const testERC1155 = await TestERC1155.deploy("ipfs://QmBase/");
  await testERC1155.waitForDeployment();
  const testERC1155Address = await testERC1155.getAddress();
  console.log("✅ TestERC1155 deployed to:", testERC1155Address);
  deployedContracts.TestERC1155 = testERC1155Address;

  // Mint some ERC1155 tokens
  console.log("🎨 Minting initial ERC1155 tokens...");
  await testERC1155.mint(deployer.address, 1, 100, "ipfs://QmToken1");
  await testERC1155.mint(deployer.address, 2, 50, "ipfs://QmToken2");
  await testERC1155.mintBatch(
    deployer.address,
    [3, 4, 5],
    [10, 20, 30],
    ["ipfs://QmToken3", "ipfs://QmToken4", "ipfs://QmToken5"]
  );
  console.log("✅ Minted ERC1155 tokens");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts
  };

  const outputPath = path.join(__dirname, "../deployed-contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", outputPath);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deployedContracts, null, 2));
  console.log("=".repeat(60) + "\n");

  return deployedContracts;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
