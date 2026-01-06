# n8n Ethereum Integration Tests

This document explains how to set up and run integration tests for n8n-nodes-ethereum.

## Prerequisites

- Node.js v22+
- npm
- n8n CLI (`npm install -g n8n`)

## First-time Setup

### 1. Create n8n User Account

```bash
npm run test:n8n
```

Open `http://localhost:5678`, create a user account, then stop n8n (Ctrl+C).

### 2. Install Ethereum Nodes

```bash
mkdir -p /tmp/.test-n8n/.n8n/custom
cd /tmp/.test-n8n/.n8n/custom
npm init -y
npm install /path/to/n8n-ethereum  # Replace with actual project path
```

### 3. Create API Key

1. Start n8n: `npm run test:n8n`
2. Go to `http://localhost:5678`
3. Navigate to **Settings** → **API**
4. Create a new API Key
5. Set environment variable:

```bash
export N8N_API_KEY='your-api-key-here'
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run test:n8n` | Start n8n with test configuration |
| `npm run test:node` | Start local Hardhat node |
| `npm run test:setup` | Import credentials and workflows via API |
| `npm run test` | Run all tests |

## Test Architecture

### Contract Addresses (Fixed)

When Hardhat restarts cleanly, contracts deploy to deterministic addresses:

| Contract | Address |
|----------|---------|
| TestERC20 | `0x5fbdb2315678afecb367f032d93f642f64180aa3` |
| TestERC721 | `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512` |
| TestERC1155 | `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9` |

### Action Node Tests

```
[Webhook] → [Ethereum Node] → [Respond to Webhook]
```

Test sends POST request to webhook and verifies returned JSON.

### Trigger Node Tests

```
[Ethereum Trigger] → [HTTP Request to localhost:3333]
```

Test creates HTTP server, triggers blockchain event, and waits for callback.

## Directory Structure

```
tests/
├── README.md                     # This document
├── n8n.test.ts                   # Main integration test file
├── workflows/                    # n8n workflow JSON files
│   └── *.json
├── credentials/                  # n8n credential JSON files
│   ├── ethereum-rpc.json
│   └── ethereum-account.json
└── scripts/
    ├── setup.mjs                 # Imports credentials/workflows via API
    ├── start-hardhat-network.mjs # Starts local Hardhat node
    ├── deploy-contracts.mjs      # Deploys test contracts
    └── vitest-setup.mjs          # Vitest global setup
```

## Troubleshooting

### N8N_API_KEY not set

```
❌ N8N_API_KEY environment variable is not set!
```

Create an API key in n8n Settings → API and set:
```bash
export N8N_API_KEY='your-api-key-here'
```

### n8n cannot find Ethereum nodes

Verify installation:
```bash
ls /tmp/.test-n8n/.n8n/custom/node_modules/@0xlimao/n8n-nodes-ethereum
```

### Webhook returns 404

Workflows may not be active. Re-run:
```bash
npm run test:setup
```

### Hardhat connection failed

Verify Hardhat is running:
```bash
curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Trigger tests timeout

Trigger workflows poll every minute. Tests wait up to 65 seconds.
Ensure n8n and Hardhat are both running before starting tests.

## Notes

- n8n Community Edition `/credentials` endpoint doesn't support GET
- Each `test:setup` creates new credentials (old ones remain but don't affect tests)
- Trigger tests take ~60 seconds each due to polling interval