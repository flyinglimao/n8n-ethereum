/**
 * Vitest Global Setup
 *
 * This file is executed before all tests run.
 * It sets up the n8n environment by importing credentials and workflows.
 *
 * Note: Hardhat network must be started separately before running tests.
 */

import { setup, teardown } from "./setup.mjs";

export default async function globalSetup() {
    console.log("\n");
    console.log("=".repeat(60));
    console.log("Running Vitest Global Setup");
    console.log("=".repeat(60));

    // Check if n8n is running
    try {
        const response = await fetch("http://localhost:5678/healthz");
        if (!response.ok) {
            throw new Error("n8n health check failed");
        }
        console.log("✓ n8n is running");
    } catch (error) {
        console.error("\n❌ n8n is not running!");
        console.error("Please start n8n first with: npm run test:n8n");
        throw new Error("n8n must be running before tests can execute");
    }

    // Check if Hardhat is running
    try {
        const response = await fetch("http://127.0.0.1:8545", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_blockNumber",
                params: [],
                id: 1,
            }),
        });
        if (!response.ok) {
            throw new Error("Hardhat RPC check failed");
        }
        console.log("✓ Hardhat node is running");
    } catch (error) {
        console.error("\n❌ Hardhat node is not running!");
        console.error("Please start Hardhat first with: npm run test:node");
        throw new Error("Hardhat node must be running before tests can execute");
    }

    // Setup n8n environment
    await setup();

    // Return teardown function
    return async () => {
        console.log("\n");
        console.log("=".repeat(60));
        console.log("Running Vitest Global Teardown");
        console.log("=".repeat(60));
        await teardown();
    };
}
