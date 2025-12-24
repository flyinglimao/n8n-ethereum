---
sidebar_position: 1
---

# Resources Overview

The Ethereum node provides access to various blockchain resources. Each resource contains specific operations for interacting with different aspects of the Ethereum blockchain.

## Available Resources

### Core Blockchain Resources

- **[Account](account)**: Query account balances, transaction counts, and contract code
- **[Block](block)**: Retrieve block information and current blockchain height
- **[Transaction](transaction)**: Send transactions, check status, and estimate gas costs
- **[Gas](gas)**: Get gas prices and fee history for optimal transaction pricing

### Smart Contract Resources

- **[Contract](contract)**: Read from and write to smart contracts, deploy new contracts, and query event logs
- **[ERC20](erc20)**: Interact with ERC20 token contracts (transfers, approvals, balances)
- **[ERC721](erc721)**: Manage ERC721 NFT operations (transfers, ownership, metadata)
- **[ERC1155](erc1155)**: Work with ERC1155 multi-token standard (batch operations, balances)

### Utility Resources

- **[ENS](ens)**: Resolve Ethereum Name Service domains and reverse lookups
- **[Signature](signature)**: Sign and verify messages and typed data (EIP-712)
- **[Utils](utils)**: Utility functions for formatting, encoding, and validation

## Resource Selection

When using the Ethereum node:

1. Select a **Resource** from the dropdown
2. Choose an **Operation** within that resource
3. Configure the operation-specific parameters
4. Add required credentials (RPC for all, Account for write operations)

## Quick Reference

### Read Operations (RPC Only)

These operations only require the **Ethereum RPC** credential:

| Resource | Operations |
|----------|------------|
| Account | Get Balance, Get Transaction Count, Get Code |
| Block | Get Block, Get Block Number |
| Transaction | Get Transaction, Get Transaction Receipt |
| Contract | Read Contract, Multicall, Simulate Contract, Get Logs |
| ERC20 | Get Balance, Get Allowance, Get Total Supply, Get Decimals, Get Name, Get Symbol |
| ERC721 | Get Balance, Owner Of, Get Approved, Is Approved For All, Token URI |
| ERC1155 | Balance Of, Balance Of Batch, Is Approved For All, URI |
| ENS | All operations |
| Gas | All operations |
| Utils | Most operations |

### Write Operations (RPC + Account)

These operations require both **Ethereum RPC** and **Ethereum Account** credentials:

| Resource | Operations |
|----------|------------|
| Transaction | Send Transaction, Wait For Transaction |
| Contract | Write Contract, Deploy Contract |
| ERC20 | Transfer, Approve, Transfer From |
| ERC721 | Transfer From, Safe Transfer From, Approve, Set Approval For All |
| ERC1155 | Safe Transfer From, Safe Batch Transfer From, Set Approval For All |
| Signature | Sign Message, Sign Typed Data |

## Common Patterns

### Reading Blockchain Data

```
[Schedule Trigger] → [Ethereum: Contract - Read Contract] → [Process Data]
```

### Executing Transactions

```
[Trigger] → [Ethereum: Contract - Write Contract] → [Ethereum: Transaction - Wait For Transaction] → [Notification]
```

### Token Operations

```
[Trigger] → [Ethereum: ERC20 - Transfer] → [Ethereum: Transaction - Wait For Transaction] → [Store Result]
```

### Event Monitoring

```
[Ethereum Trigger: Event] → [Process Event Data] → [Action]
```

## Next Steps

Explore each resource in detail to learn about specific operations and parameters:

- Start with [Account](account) for basic blockchain queries
- Learn about [Transactions](transaction) for sending ETH
- Dive into [Contract](contract) for smart contract interactions
- Explore token standards: [ERC20](erc20), [ERC721](erc721), [ERC1155](erc1155)
