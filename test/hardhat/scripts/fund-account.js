const hre = require("hardhat");

// Fixed private key for testing (Hardhat account #0)
// This is a well-known test private key - NEVER use in production!
const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  console.log("💰 Funding test account...\n");

  const [funder] = await hre.ethers.getSigners();
  console.log("💵 Funder account:", funder.address);
  console.log("💰 Funder balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(funder.address)), "ETH");

  // Get the test account from private key
  const testWallet = new hre.ethers.Wallet(TEST_PRIVATE_KEY, hre.ethers.provider);
  console.log("\n🔑 Test account:", testWallet.address);
  console.log("🔑 Private key:", TEST_PRIVATE_KEY);

  const initialBalance = await hre.ethers.provider.getBalance(testWallet.address);
  console.log("💰 Initial balance:", hre.ethers.formatEther(initialBalance), "ETH");

  // Fund the test account with 10,000 ETH
  const fundAmount = hre.ethers.parseEther("10000");
  console.log("\n📤 Sending", hre.ethers.formatEther(fundAmount), "ETH to test account...");

  const tx = await funder.sendTransaction({
    to: testWallet.address,
    value: fundAmount
  });

  console.log("⏳ Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  const finalBalance = await hre.ethers.provider.getBalance(testWallet.address);
  console.log("💰 Final balance:", hre.ethers.formatEther(finalBalance), "ETH");

  console.log("\n" + "=".repeat(60));
  console.log("📋 TEST ACCOUNT INFO");
  console.log("=".repeat(60));
  console.log("Address:", testWallet.address);
  console.log("Private Key:", TEST_PRIVATE_KEY);
  console.log("Balance:", hre.ethers.formatEther(finalBalance), "ETH");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  });
