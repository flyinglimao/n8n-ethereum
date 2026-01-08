# @0xlimao/n8n-ethereum-test

Test environment for n8n-nodes-ethereum using Hardhat local network.

This package contains:
- Smart contracts for testing (ERC20, ERC721, ERC1155)
- Hardhat network setup scripts
- Test workflows
- Integration test suite

## Prerequisites

- Running n8n instance
- n8n API key configured

## Usage

### Start Hardhat Network

```bash
pnpm node
```

This will:
1. Compile contracts
2. Start Hardhat network on port 8545
3. Ready for contract deployment

### Deploy Test Contracts

```bash
pnpm deploy
```

### Run Tests

```bash
pnpm test
```

### Setup n8n Environment

```bash
N8N_API_KEY=your-key pnpm test:setup
```

This will:
1. Create credentials in n8n
2. Deploy contracts to Hardhat network
3. Import workflows
4. Activate trigger workflows

## Package Structure

- `contracts/` - Solidity test contracts
- `scripts/` - Deployment and setup scripts
- `tests/` - Test files and workflow definitions
- `hardhat.config.js` - Hardhat configuration (ES Module)

## ES Module

This package uses ES Modules (`"type": "module"`) to support Hardhat's requirements, while the main package uses CommonJS for n8n compatibility.
