# n8n Ethereum Integration Tests

This document explains how to set up and run integration tests for n8n-nodes-ethereum.

## Prerequisites

- Node.js v22+
- npm
- n8n CLI (`npm install -g n8n`)

## Directory Structure

```
tests/
├── README.md                    # This document
├── n8n.test.ts                  # Main integration test file
├── workflows/                   # n8n workflow JSON files
│   └── *.json
├── credentials/                 # n8n credential JSON files
│   ├── ethereum-rpc.json
│   └── ethereum-account.json
└── scripts/                     # Test helper scripts
    ├── setup.mjs                # Imports credentials/workflows via API
    ├── start-hardhat-network.mjs  # Starts local Hardhat node
    ├── deploy-contracts.mjs     # Deploys test contracts
    └── vitest-setup.mjs         # vitest globalSetup
```

## First-time Setup (Run only once)

### 1. Create an n8n user account

```bash
# Start n8n
npm run test:n8n
```

Open your browser to `http://localhost:5678`, create a user account, then close n8n (Ctrl+C).

### 2. Install Ethereum Nodes into n8n

```bash
# Create n8n custom nodes directory
mkdir -p /tmp/.test-n8n/.n8n/custom

# Navigate to the directory and install this project
cd /tmp/.test-n8n/.n8n/custom
npm init -y
npm install /path/to/n8n-ethereum  # Replace with the actual project path

# For example:
# npm install ~/Code/n8n-ethereum
```

### 3. Create an API Key

1. Start n8n: `npm run test:n8n`
2. Go to `http://localhost:5678`
3. Navigate to **Settings** → **API**
4. Create a new API Key
5. Copy the API Key and set it as an environment variable:

```bash
export N8N_API_KEY="your-api-key-here"
```

Alternatively, you can directly modify the `API_KEY` constant in `tests/scripts/setup.mjs`.

## Running Tests

### Method One: Manual Step-by-Step Execution

```bash
# Terminal 1: Start n8n
npm run test:n8n

# Terminal 2: Start Hardhat node
npm run test:node

# Terminal 3: Run setup (optional, vitest will run it automatically)
npm run test:setup

# Terminal 3: Run tests
npm run test
```

### Method Two: Simply Run Tests (assuming n8n and Hardhat are already running)

```bash
npm run test
```

Vitest's `globalSetup` will automatically:
1. Check if n8n and Hardhat are running
2. Delete existing workflows
3. Create new credentials
4. Import all workflows
5. Activate all workflows

## npm Scripts

| Command             | Description                                    |
|---------------------|------------------------------------------------|
| `npm run test:n8n`    | Starts n8n with test configuration             |
| `npm run test:node`   | Starts a local Hardhat node                    |
| `npm run test:setup`  | Imports credentials and workflows via API      |
| `npm run test:deploy` | Deploys test contracts (ERC20/721/1155)      |
| `npm run test`      | Runs all tests                                 |

## Test Architecture

### Action Nodes Tests

Use a webhook to trigger a workflow and verify the returned result:

```
[Webhook] → [Ethereum Node] → [Respond to Webhook]
```

The test script sends a POST request to the webhook and verifies the returned JSON data.

### Trigger Nodes Tests

Set up a local HTTP server to receive events sent by n8n:

```
[Ethereum Trigger] → [HTTP Request to Test Server]
```

When a blockchain event occurs, n8n will send data to the test script's server.

## Troubleshooting

### n8n cannot find Ethereum nodes

Confirm that they are correctly installed in the n8n custom nodes directory:

```bash
ls /tmp/.test-n8n/.n8n/custom/node_modules/@0xlimao/n8n-nodes-ethereum
```

If not present, please re-run the installation steps.

### Webhook returns 404

Confirm that workflows are active. You can check this in the n8n UI or re-run `npm run test:setup`.

### Hardhat connection failed

Confirm that the Hardhat node is running:

```bash
curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

It should return something like: `{"jsonrpc":"2.0","id":1,"result":"0x0"}`

### API Key expired

n8n API Keys have an expiration time. If tests fail with authentication errors, please create a new API Key.

## Notes

- The `/credentials` endpoint of n8n Community Edition does not support GET requests, so existing credentials cannot be queried.
- Each `setup` run creates new credentials; old ones remain in n8n (but do not affect tests).
- Tests related to ERC20/721/1155 require deploying test contracts to the local Hardhat network.