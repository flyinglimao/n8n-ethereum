/**
 * Deploy Test Contracts Script
 *
 * Deploys test ERC20, ERC721, and ERC1155 contracts to the local Hardhat network.
 * Returns the deployed contract addresses.
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(dirname(__dirname));

// Hardhat's default first account private key
const DEFAULT_PRIVATE_KEY =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function getContractArtifact(contractName) {
    const artifactPath = join(
        projectRoot,
        "artifacts",
        "contracts",
        `${contractName}.sol`,
        `${contractName}.json`
    );

    const content = await readFile(artifactPath, "utf-8");
    return JSON.parse(content);
}

export async function deployContracts() {
    console.log("Deploying test contracts...");

    // Compile contracts first
    console.log("Compiling contracts...");
    execSync("npx hardhat compile", { cwd: projectRoot, stdio: "inherit" });

    // Setup clients
    const publicClient = createPublicClient({
        chain: hardhat,
        transport: http("http://127.0.0.1:8545"),
    });

    const account = privateKeyToAccount(DEFAULT_PRIVATE_KEY);
    const walletClient = createWalletClient({
        account,
        chain: hardhat,
        transport: http("http://127.0.0.1:8545"),
    });

    const deployedAddresses = {};

    // Deploy TestERC20
    console.log("Deploying TestERC20...");
    const erc20Artifact = await getContractArtifact("TestERC20");
    const erc20Hash = await walletClient.deployContract({
        abi: erc20Artifact.abi,
        bytecode: erc20Artifact.bytecode,
    });
    const erc20Receipt = await publicClient.waitForTransactionReceipt({
        hash: erc20Hash,
    });
    deployedAddresses.erc20 = erc20Receipt.contractAddress;
    console.log(`  TestERC20 deployed at: ${deployedAddresses.erc20}`);

    // Deploy TestERC721
    console.log("Deploying TestERC721...");
    const erc721Artifact = await getContractArtifact("TestERC721");
    const erc721Hash = await walletClient.deployContract({
        abi: erc721Artifact.abi,
        bytecode: erc721Artifact.bytecode,
    });
    const erc721Receipt = await publicClient.waitForTransactionReceipt({
        hash: erc721Hash,
    });
    deployedAddresses.erc721 = erc721Receipt.contractAddress;
    console.log(`  TestERC721 deployed at: ${deployedAddresses.erc721}`);

    // Mint ERC721 token for testing (token ID 0)
    console.log("  Minting ERC721 token #0...");
    const mintHash = await walletClient.writeContract({
        address: deployedAddresses.erc721,
        abi: erc721Artifact.abi,
        functionName: "mint",
        args: [account.address],
    });
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log("  ERC721 token #0 minted to deployer");

    // Deploy TestERC1155
    console.log("Deploying TestERC1155...");
    const erc1155Artifact = await getContractArtifact("TestERC1155");
    const erc1155Hash = await walletClient.deployContract({
        abi: erc1155Artifact.abi,
        bytecode: erc1155Artifact.bytecode,
    });
    const erc1155Receipt = await publicClient.waitForTransactionReceipt({
        hash: erc1155Hash,
    });
    deployedAddresses.erc1155 = erc1155Receipt.contractAddress;
    console.log(`  TestERC1155 deployed at: ${deployedAddresses.erc1155}`);

    console.log("\nAll contracts deployed successfully!");
    return deployedAddresses;
}

// Allow running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    deployContracts()
        .then((addresses) => {
            console.log("\nDeployed contract addresses:");
            console.log(JSON.stringify(addresses, null, 2));
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
