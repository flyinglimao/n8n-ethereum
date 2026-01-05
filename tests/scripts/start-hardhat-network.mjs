/**
 * Start Hardhat Network Script
 *
 * This script starts a local Hardhat network for testing.
 * It compiles contracts and optionally deploys test contracts.
 *
 * Usage:
 *   node tests/scripts/start-hardhat-network.mjs
 */

import { spawn, execSync } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(dirname(__dirname));

console.log("Starting Hardhat Network...");
console.log("Project root:", projectRoot);

// Compile contracts first
console.log("\nCompiling contracts...");
try {
    execSync("npx hardhat compile", {
        cwd: projectRoot,
        stdio: "inherit",
    });
} catch (error) {
    console.error("Failed to compile contracts:", error.message);
    process.exit(1);
}

// Start hardhat node
console.log("\nStarting Hardhat node on port 8545...");

const hardhatProcess = spawn("npx", ["hardhat", "node"], {
    cwd: projectRoot,
    stdio: ["inherit", "pipe", "pipe"],
});

let started = false;

hardhatProcess.stdout.on("data", (data) => {
    const output = data.toString();
    process.stdout.write(output);

    if (!started && output.includes("Started HTTP")) {
        started = true;
        console.log("\n=== Hardhat node is ready! ===\n");
    }
});

hardhatProcess.stderr.on("data", (data) => {
    process.stderr.write(data.toString());
});

hardhatProcess.on("error", (error) => {
    console.error("Failed to start Hardhat node:", error);
    process.exit(1);
});

hardhatProcess.on("exit", (code) => {
    console.log(`Hardhat node exited with code ${code}`);
    process.exit(code);
});

// Handle termination
process.on("SIGINT", () => {
    console.log("\nShutting down Hardhat node...");
    hardhatProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
    console.log("\nShutting down Hardhat node...");
    hardhatProcess.kill("SIGTERM");
});
