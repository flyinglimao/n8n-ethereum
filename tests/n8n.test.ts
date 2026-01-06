/**
 * Comprehensive n8n Ethereum Node Integration Tests
 *
 * This file tests all Ethereum node operations via n8n workflows.
 * Each workflow corresponds to a JSON file in tests/workflows/.
 *
 * Prerequisites:
 * 1. Run `npm run test:node` to start a local Hardhat network
 * 2. Run `npm run test:n8n` to start n8n with test configuration
 * 3. Import all workflows from tests/workflows/ into n8n
 * 4. Configure Ethereum RPC credential to point to local Hardhat network
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createServer, type Server } from "http";

const N8N_WEBHOOK_BASE = "http://localhost:5678/webhook";
const TEST_SERVER_PORT = 3333;

/**
 * Helper function to make webhook requests
 */
async function callWorkflow(
  webhookPath: string,
  body: Record<string, unknown> = {}
): Promise<Response> {
  const response = await fetch(`${N8N_WEBHOOK_BASE}/${webhookPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response;
}


// ============================================
//          Account Resource Tests
// ============================================

describe("Account Resource", () => {
  describe("Get Balance", () => {
    it("should return the balance of an address", async () => {
      const response = await callWorkflow("get-balance");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("balance");
      expect(result).toHaveProperty("balanceInEth");
      expect(typeof result.balance).toBe("string");
      expect(typeof result.balanceInEth).toBe("string");
    });
  });

  describe("Get Transaction Count", () => {
    it("should return the nonce of an address", async () => {
      const response = await callWorkflow("get-transaction-count");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("transactionCount");
      expect(typeof result.transactionCount).toBe("string");
    });
  });

  describe("Get Code", () => {
    it("should return bytecode for contract address", async () => {
      const response = await callWorkflow("get-code");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("isContract");
      expect(typeof result.code).toBe("string");
      expect(typeof result.isContract).toBe("boolean");
    });
  });

  describe("Get Current Address", () => {
    it("should return the current wallet address", async () => {
      const response = await callWorkflow("get-current-address");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("address");
      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

// ============================================
//          Block Resource Tests
// ============================================

describe("Block Resource", () => {
  describe("Get Block", () => {
    it("should return block data", async () => {
      const response = await callWorkflow("get-block");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("number");
      expect(result).toHaveProperty("hash");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("gasUsed");
    });
  });

  describe("Get Block Number", () => {
    it("should return the latest block number", async () => {
      const response = await callWorkflow("get-block-number");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("blockNumber");
      expect(typeof result.blockNumber).toBe("string");
    });
  });
});

// ============================================
//          Transaction Resource Tests
// ============================================

describe("Transaction Resource", () => {
  // Helper to send a test transaction using viem
  async function sendTestTransaction(): Promise<string> {
    const { createWalletClient, createPublicClient, http } = await import("viem");
    const { hardhat } = await import("viem/chains");
    const { privateKeyToAccount } = await import("viem/accounts");

    const account = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    const walletClient = createWalletClient({
      account,
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    const hash = await walletClient.sendTransaction({
      to: account.address,
      value: 1n,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  describe("Get Transaction", () => {
    it("should return transaction data", async () => {
      const txHash = await sendTestTransaction();
      const response = await callWorkflow("get-transaction", { transactionHash: txHash });

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("hash");
      expect(result).toHaveProperty("from");
      expect(result.hash.toLowerCase()).toBe(txHash.toLowerCase());
    });
  });

  describe("Get Transaction Receipt", () => {
    it("should return transaction receipt", async () => {
      const txHash = await sendTestTransaction();
      const response = await callWorkflow("get-tx-receipt", { transactionHash: txHash });

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("transactionHash");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("gasUsed");
      expect(result.transactionHash.toLowerCase()).toBe(txHash.toLowerCase());
    });
  });

  describe("Estimate Gas", () => {
    it("should estimate gas for a transaction", async () => {
      const response = await callWorkflow("estimate-gas");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("estimatedGas");
      expect(typeof result.estimatedGas).toBe("string");
    });
  });
});

// ============================================
//          Contract Resource Tests
// ============================================

describe("Contract Resource", () => {
  describe("Contract Read", () => {
    it("should read data from a contract", async () => {
      const response = await callWorkflow("contract-read");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("result");
    });
  });

  describe("Contract Get Logs", () => {
    it("should get logs from a contract", async () => {
      const response = await callWorkflow("contract-get-logs");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("logs");
      expect(Array.isArray(result.logs)).toBe(true);
    });
  });
});

// ============================================
//          ERC20 Resource Tests
// ============================================

describe("ERC20 Resource", () => {
  describe("Get Balance", () => {
    it("should return ERC20 token balance", async () => {
      const response = await callWorkflow("erc20-balance");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("balance");
      expect(result).toHaveProperty("balanceFormatted");
    });
  });

  describe("Get Token Info", () => {
    it("should return ERC20 token information", async () => {
      const response = await callWorkflow("erc20-token-info");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("symbol");
      expect(result).toHaveProperty("decimals");
      expect(result).toHaveProperty("totalSupply");
    });
  });

  describe("Get Allowance", () => {
    it("should return ERC20 allowance", async () => {
      const response = await callWorkflow("erc20-allowance");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("allowance");
      expect(result).toHaveProperty("allowanceFormatted");
    });
  });
});

// ============================================
//          ERC721 Resource Tests
// ============================================

describe("ERC721 Resource", () => {
  describe("Get Balance", () => {
    it("should return ERC721 NFT balance", async () => {
      const response = await callWorkflow("erc721-balance");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("balance");
    });
  });

  describe("Owner Of", () => {
    it("should return owner of NFT token", async () => {
      const response = await callWorkflow("erc721-owner-of");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("owner");
      expect(result.owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Token URI", () => {
    it("should return NFT token URI", async () => {
      const response = await callWorkflow("erc721-token-uri");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("tokenURI");
    });
  });
});

// ============================================
//          ERC1155 Resource Tests
// ============================================

describe("ERC1155 Resource", () => {
  describe("Balance Of", () => {
    it("should return ERC1155 token balance", async () => {
      const response = await callWorkflow("erc1155-balance");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("balance");
    });
  });

  describe("URI", () => {
    it("should return ERC1155 token URI", async () => {
      const response = await callWorkflow("erc1155-uri");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("uri");
    });
  });
});

// ============================================
//          Gas Resource Tests
// ============================================

describe("Gas Resource", () => {
  describe("Get Gas Price", () => {
    it("should return current gas price", async () => {
      const response = await callWorkflow("get-gas-price");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("gasPrice");
      expect(result).toHaveProperty("gasPriceGwei");
    });
  });

  describe("Get Fee History", () => {
    it("should return fee history", async () => {
      const response = await callWorkflow("get-fee-history");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("baseFeePerGas");
      expect(result).toHaveProperty("reward");
    });
  });

  describe("Estimate Max Priority Fee", () => {
    it("should estimate max priority fee", async () => {
      const response = await callWorkflow("estimate-priority-fee");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("maxPriorityFeePerGas");
    });
  });
});

// ============================================
//          Utils Resource Tests
// ============================================

describe("Utils Resource", () => {
  describe("Format Units", () => {
    it("should format wei to decimal", async () => {
      const response = await callWorkflow("format-units");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("formatted");
      expect(result.formatted).toBe("1");
    });
  });

  describe("Parse Units", () => {
    it("should parse decimal to wei", async () => {
      const response = await callWorkflow("parse-units");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("parsed");
      expect(result.parsed).toBe("1500000000000000000");
    });
  });

  describe("Validate Address", () => {
    it("should validate Ethereum address", async () => {
      const response = await callWorkflow("validate-address");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("isValid");
      expect(result.isValid).toBe(true);
    });
  });

  describe("Get Chain ID", () => {
    it("should return chain ID", async () => {
      const response = await callWorkflow("get-chain-id");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("chainId");
    });
  });

  describe("Keccak256", () => {
    it("should hash data with keccak256", async () => {
      const response = await callWorkflow("keccak256");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("hash");
      expect(result.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });
});

// ============================================
//          Custom RPC Resource Tests
// ============================================

describe("Custom RPC Resource", () => {
  describe("Request", () => {
    it("should execute custom RPC request", async () => {
      const response = await callWorkflow("custom-rpc");

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result).toHaveProperty("result");
    });
  });
});

// ============================================
//          Trigger Node Tests
// ============================================

describe("Trigger Nodes", () => {
  let server: Server;
  const { EventEmitter } = require("events");
  const eventBus = new EventEmitter();

  beforeAll(async () => {
    // Create a server to receive trigger events
    server = createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const event: Record<string, unknown> = JSON.parse(body);
          // Broadcast event to all listeners
          eventBus.emit("event", event);
        } catch {
          // Ignore parse errors
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "received" }));
      });
    });

    await new Promise<void>((resolve) =>
      server.listen(TEST_SERVER_PORT, resolve)
    );
  });

  afterAll(() => {
    server.close();
    eventBus.removeAllListeners();
  });

  /**
   * Helper to wait for an event with timeout and filter
   */
  function waitForEvent(
    timeoutMs: number,
    filter: (event: Record<string, unknown>) => boolean
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        eventBus.removeListener("event", handler);
        reject(new Error(`Timeout: No matching event received within ${timeoutMs}ms`));
      }, timeoutMs);

      function handler(event: Record<string, unknown>) {
        if (filter(event)) {
          clearTimeout(timeout);
          eventBus.removeListener("event", handler);
          resolve(event);
        }
        // If filter doesn't match, keep listening for more events
      }

      eventBus.on("event", handler);
    });
  }

  describe("Block Trigger", () => {
    it(
      "should receive new block events",
      async () => {
        // Start waiting for event before triggering
        const eventPromise = waitForEvent(65000, event => {
          return 'number' in event && !('eventName' in event);
        }); // 65 seconds (trigger polls every minute)

        // Send a transaction to mine a block
        const { createWalletClient, http } = await import("viem");
        const { hardhat } = await import("viem/chains");
        const { privateKeyToAccount } = await import("viem/accounts");
        const account = privateKeyToAccount(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        );
        const walletClient = createWalletClient({
          account,
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });
        await walletClient.sendTransaction({ to: account.address, value: 1n });

        // Wait for the event (will resolve when received or reject on timeout)
        const event = await eventPromise as Record<string, unknown>;
        expect(event).toHaveProperty("number");
        expect(event).toHaveProperty("hash");
      },
      70000 // 70 second test timeout
    );
  });

  describe("Contract Event Trigger", () => {
    it(
      "should receive contract events when triggered",
      async () => {
        // Start waiting for contract event (filter for events with eventName)
        const eventPromise = waitForEvent(65000, (event) => {
          return "eventName" in event;
        });

        // Fixed ERC20 address from Hardhat deployment
        const erc20Address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

        // Send ERC20 transfer to trigger Transfer event
        const { createWalletClient, createPublicClient, http } = await import("viem");
        const { hardhat } = await import("viem/chains");
        const { privateKeyToAccount } = await import("viem/accounts");

        const account = privateKeyToAccount(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        );
        const walletClient = createWalletClient({
          account,
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });
        const publicClient = createPublicClient({
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });

        // ERC20 transfer ABI
        const erc20Abi = [
          {
            name: "transfer",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ] as const;

        // Transfer 1 token to trigger the Transfer event
        const hash = await walletClient.writeContract({
          address: erc20Address as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [account.address, 1n],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Wait for the contract event (will resolve when received or reject on timeout)
        const event = (await eventPromise) as Record<string, unknown>;
        expect(event).toHaveProperty("eventName");
        expect(event.eventName).toBe("Transfer");
      },
      70000 // 70 second test timeout
    );
  });

  describe("Transaction Trigger", () => {
    it(
      "should receive transaction events",
      async () => {
        // Start waiting for event before triggering
        const eventPromise = waitForEvent(65000, event => {
          return 'hash' in event && !('number' in event) && !('eventName' in event);
        }); // 65 seconds (trigger polls every minute)

        // Send a transaction to trigger the event
        const { createWalletClient, http } = await import("viem");
        const { hardhat } = await import("viem/chains");
        const { privateKeyToAccount } = await import("viem/accounts");

        const account = privateKeyToAccount(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        );
        const walletClient = createWalletClient({
          account,
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });

        await walletClient.sendTransaction({ to: account.address, value: 1n });

        // Wait for the event (will resolve when received or reject on timeout)
        const event = await eventPromise as Record<string, unknown>;
        expect(event).toHaveProperty("hash");
      },
      70000 // 70 second test timeout
    );
  });
});

// ============================================
//          Workflow File Validation Tests
// ============================================

describe("Workflow File Validation", () => {
  const fs = require("fs");
  const path = require("path");

  const workflowDir = path.join(__dirname, "workflows");

  it("should have valid JSON workflow files", () => {
    const files = fs.readdirSync(workflowDir);
    const jsonFiles = files.filter((f: string) => f.endsWith(".json"));

    expect(jsonFiles.length).toBeGreaterThan(0);

    for (const file of jsonFiles) {
      const content = fs.readFileSync(path.join(workflowDir, file), "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();

      const workflow = JSON.parse(content);
      expect(workflow).toHaveProperty("name");
      expect(workflow).toHaveProperty("nodes");
      expect(workflow).toHaveProperty("connections");
      expect(Array.isArray(workflow.nodes)).toBe(true);
    }
  });

  it("should have all required workflow files", () => {
    const requiredWorkflows = [
      // Triggers
      "Block Trigger.json",
      "Contract Event Trigger.json",
      "Transaction Trigger.json",
      // Account
      "Get Balance.json",
      "Get Transaction Count.json",
      "Get Code.json",
      "Get Current Address.json",
      // Block
      "Get Block.json",
      "Get Block Number.json",
      // Transaction
      "Get Transaction.json",
      "Get Transaction Receipt.json",
      "Estimate Gas.json",
      // Contract
      "Contract Read.json",
      "Contract Get Logs.json",
      // ERC20
      "ERC20 Get Balance.json",
      "ERC20 Get Token Info.json",
      "ERC20 Get Allowance.json",
      // ERC721
      "ERC721 Get Balance.json",
      "ERC721 Owner Of.json",
      "ERC721 Token URI.json",
      // ERC1155
      "ERC1155 Balance Of.json",
      "ERC1155 URI.json",
      // Gas
      "Get Gas Price.json",
      "Get Fee History.json",
      "Estimate Max Priority Fee.json",
      // Utils
      "Format Units.json",
      "Parse Units.json",
      "Validate Address.json",
      "Get Chain ID.json",
      "Keccak256.json",
      // Custom RPC
      "Custom RPC Request.json",
    ];

    const files = fs.readdirSync(workflowDir);

    for (const workflow of requiredWorkflows) {
      expect(files).toContain(workflow);
    }
  });
});
