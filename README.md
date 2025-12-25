# n8n-nodes-ethereum

[![npm version](https://badge.fury.io/js/%40flyinglimao%2Fn8n-nodes-ethereum.svg)](https://www.npmjs.com/package/@0xlimao/n8n-nodes-ethereum)

Comprehensive Ethereum blockchain integration for n8n with a unified node structure using viem. This community node package provides two powerful nodes: **Ethereum** (regular node) and **Ethereum Trigger** (trigger node) for interacting with Ethereum and EVM-compatible blockchains.

## ⚠️ Disclaimer

> **WARNING**: This package is currently in early development and **has not been thoroughly tested or audited**. Please use at your own risk.
>
> - ❌ Not production-ready
> - ⚠️ May contain bugs or security vulnerabilities
> - 🔍 Always verify transaction details before execution
> - 💰 Test with small amounts first
> - 🛡️ Conduct your own security review
>
> **By using this package, you acknowledge these risks and agree that you are solely responsible for any losses or damages.**

## Features

- ✨ **Unified Node Structure**: Single Ethereum node with Resource/Operation pattern for cleaner UX
- 🔐 **Secure Credentials**: Separate RPC and Account credentials with optional wallet for read operations
- 🔄 **10 Resource Types**: Account, Block, Transaction, Contract, ERC20, ERC721, ERC1155, ENS, Gas, Utils
- ⚡ **Trigger Support**: Monitor new blocks, contract events, and transactions in real-time
- 🌐 **Multi-Chain**: Supports Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Fantom, Base, and custom networks
- 🪙 **Complete Token Standards**: ERC20, ERC721, ERC1155 with automatic ABI handling
- 📦 **Built with viem**: Modern, type-safe TypeScript library for Ethereum interactions

## Installation

```bash
npm install @0xlimao/n8n-nodes-ethereum
```

## Credentials

### Ethereum RPC

Connection details for the Ethereum node.

**Fields:**

- **Chain**: Select from supported chains (Ethereum, Polygon, BSC, etc.) or choose Custom
- **RPC URL** (required): HTTP(S) or WebSocket endpoint (e.g., `https://mainnet.infura.io/v3/YOUR-API-KEY`)
- **Custom Headers** (optional): JSON object for API authentication (e.g., `{"Authorization": "Bearer token"}`)

### Ethereum Account

Wallet credentials for signing transactions. **Optional** for read operations.

**Fields:**

- **Private Key** (optional): 64-character hex private key (with or without 0x prefix)
- **Mnemonic Phrase** (optional): 12 or 24-word seed phrase
- **Account Index**: Derivation index for mnemonic (default: 0)

**Note**: At least one of Private Key or Mnemonic is required for write operations. Read operations don't need this credential.

## Triggers

### Event Trigger

Activates workflow when a smart contract emits specific events.

**Features:**

- Monitor all contracts (no address required)
- Support multiple contract addresses
- Support multiple event types

### Block Trigger

Triggers when a new block is created on the blockchain.

### Transaction Trigger

Triggers when transactions occur at specified addresses.

**Features:**

- Monitor specific addresses
- Filter for incoming transactions only
- Filter for outgoing transactions only
- Monitor both incoming and outgoing (default)

## Nodes

### Account Operations

- **Get Balance**: Retrieve native token balance with formatting options (wei/gwei/ether)
- **Get Transaction Count**: Get account nonce for transaction sequencing
- **Get Code**: Check if address is a smart contract

### Block Operations

- **Get Block**: Retrieve detailed block information with optional full transactions
- **Get Block Number**: Get current blockchain height with caching support

### Transaction Operations

- **Send Transaction**: Send native tokens with EIP-1559 gas support
- **Get Transaction**: Retrieve transaction details by hash
- **Get Transaction Receipt**: Get transaction receipt with event logs
- **Wait For Transaction**: Wait for confirmations with configurable timeout
- **Estimate Gas**: Estimate gas requirements with buffer

### Contract Operations

- **Read Contract**: Call view/pure functions with dynamic parameter inputs
- **Write Contract**: Execute state-changing contract functions
- **Deploy Contract**: Deploy smart contracts with constructor arguments
- **Multicall**: Batch multiple read operations efficiently
- **Simulate Contract**: Test contract calls without sending transactions
- **Get Logs**: Query historical event logs with automatic decoding

### ERC20 Token Standard (9 nodes)

- **Get Balance**: Token balance with automatic decimal formatting
- **Transfer**: Send tokens with decimal conversion
- **Approve**: Approve spending with unlimited option
- **Transfer From**: Transfer using allowance
- **Get Allowance**: Check approved amounts
- **Get Total Supply**: Query total token supply
- **Get Decimals**: Retrieve token decimals
- **Get Name**: Get token name
- **Get Symbol**: Get token symbol

### ERC721 NFT Standard (9 nodes)

- **Get Balance**: NFT count for address
- **Owner Of**: Get owner of specific token ID
- **Transfer From**: Transfer NFT ownership
- **Safe Transfer From**: Safe transfer with receiver validation
- **Approve**: Approve NFT transfer
- **Set Approval For All**: Approve operator for all NFTs
- **Get Approved**: Get approved address for token
- **Is Approved For All**: Check operator approval status
- **Token URI**: Get token metadata URI

### ERC1155 Multi-Token Standard (7 nodes)

- **Balance Of**: Get balance for specific token ID
- **Balance Of Batch**: Batch balance queries
- **Safe Transfer From**: Safe transfer single token type
- **Safe Batch Transfer From**: Batch transfer multiple token types
- **Set Approval For All**: Approve operator
- **Is Approved For All**: Check operator approval
- **URI**: Get token metadata URI

### Gas Operations

- **Get Gas Price**: Retrieve current gas price (legacy)
- **Get Fee History**: Analyze historical fees for EIP-1559 optimization
- **Estimate Max Priority Fee**: Estimate priority fee for transactions

### ENS Operations

- **Get ENS Address**: Resolve ENS name to Ethereum address
- **Get ENS Name**: Reverse resolve address to ENS name
- **Get ENS Avatar**: Retrieve avatar URI for ENS name
- **Get ENS Text**: Get text records (email, twitter, url, etc.)
- **Get ENS Resolver**: Get resolver contract address

### Signature Operations

- **Sign Message**: Personal message signing with wallet
- **Sign Typed Data**: EIP-712 structured data signing
- **Verify Message**: Verify personal message signatures
- **Verify Typed Data**: Verify EIP-712 signatures
- **Recover Address**: Recover signer address from signature
- **Hash Message**: Keccak256 hash of messages
- **Hash Typed Data**: Hash typed data for signing

### Utility Operations

- **Format Units**: Convert wei to human-readable format
- **Parse Units**: Convert human-readable to wei
- **Get Chain ID**: Retrieve current chain identifier
- **Validate Address**: Validate and checksum Ethereum addresses
- **Encode Function Data**: Encode function call data from ABI
- **Decode Function Data**: Decode function call data using ABI
- **Encode Event Topics**: Encode event topics for log filtering
- **Decode Event Log**: Decode event log data using ABI
- **Get Contract Address**: Calculate CREATE/CREATE2 deployment addresses

### Advanced Operations

- **Get Storage At**: Read raw storage slots from contracts
- **Call**: Make raw contract calls with custom data
- **Get Proof**: Generate Merkle proofs for account state and storage

## Usage Examples

### Monitor Contract Events and Send Notifications

```
[Event Trigger] → [Process Data] → [Send Notification]
```

### Periodically Read Contract State

```
[Schedule Trigger] → [Read Contract] → [Store Data]
```

### Execute Contract Operation and Wait for Confirmation

```
[Trigger] → [Write Contract] → [Wait Transaction] → [Post-processing]
```

## Supported Networks

The package includes pre-configured support for 18 major Ethereum-compatible networks:

**Ethereum:**

- Mainnet
- Sepolia (testnet)
- Goerli (testnet)
- Holesky (testnet)

**Layer 2 & Scaling:**

- Arbitrum One
- Arbitrum Sepolia
- Optimism
- Optimism Sepolia
- Base
- Base Sepolia

**Sidechains & Alternative L1s:**

- Polygon (Matic)
- Polygon Amoy (testnet)
- BNB Smart Chain (BSC)
- BSC Testnet
- Avalanche C-Chain
- Avalanche Fuji (testnet)

**Additional Networks:**

- Gnosis Chain
- Celo

You can also add custom networks by configuring the RPC endpoint directly.

## License

MIT License

---

## Contributing

Issues and Pull Requests are welcome!

## Related Links

- [n8n Official Website](https://n8n.io)
- [Ethereum Developer Documentation](https://ethereum.org/developers)
