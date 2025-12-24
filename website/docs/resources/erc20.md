---
sidebar_position: 5
---

# ERC20

ERC20 resource provides convenient operations for interacting with ERC20 token contracts without manually specifying ABIs.

## Overview

ERC20 is the most common token standard on Ethereum. This resource automatically handles the ERC20 ABI, making it easy to interact with any ERC20 token.

**Common ERC20 Tokens**:
- USDT (Tether)
- USDC (USD Coin)
- DAI (Dai Stablecoin)
- WETH (Wrapped Ether)
- And thousands more...

## Operations

### Get Balance

Get the token balance of an address.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **Owner Address** (required): Address to check balance for
- **Format Decimals** (optional): Format output using token decimals (default: true)

**Example**:
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "formatDecimals": true
}
```

**Output**:
```json
{
  "balance": "1000.50",
  "decimals": 6,
  "rawBalance": "1000500000"
}
```

### Transfer

Transfer tokens to another address.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **To** (required): Recipient address
- **Amount** (required): Amount to transfer (in token units, will be converted using decimals)

**Example**:
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100.5"
}
```

**Output**:
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}
```

### Approve

Approve another address to spend tokens on your behalf.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **Spender** (required): Address to approve
- **Amount** (required): Amount to approve (use "unlimited" for max approval)

**Use Cases**:
- Approve DEX contracts to swap tokens
- Approve staking contracts to deposit tokens
- Set spending limits for contracts

**Example**:
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  "amount": "unlimited"
}
```

### Transfer From

Transfer tokens using an allowance (requires prior approval).

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **From** (required): Address to transfer from
- **To** (required): Recipient address
- **Amount** (required): Amount to transfer

**Use Cases**:
- Pull payments
- Contract-based token transfers
- Automated payment systems

### Get Allowance

Check how much a spender is allowed to spend on behalf of an owner.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **Owner** (required): Token owner address
- **Spender** (required): Spender address
- **Format Decimals** (optional): Format output using token decimals

**Example**:
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d"
}
```

### Get Total Supply

Get the total supply of tokens.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address
- **Format Decimals** (optional): Format output using token decimals

### Get Decimals

Get the number of decimals the token uses.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address

**Output**:
```json
{
  "decimals": 6
}
```

### Get Name

Get the token name.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address

**Output**:
```json
{
  "name": "USD Coin"
}
```

### Get Symbol

Get the token symbol.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Token Address** (required): The ERC20 token contract address

**Output**:
```json
{
  "symbol": "USDC"
}
```

## Common Use Cases

### Monitor Token Balance

```
[Schedule Trigger] → [ERC20: Get Balance] → [Check Threshold] → [Alert]
```

### Automated Token Transfer

```
[Trigger] → [ERC20: Transfer] → [Wait For Transaction] → [Notification]
```

### Approve and Deposit to DeFi

```
[Trigger] → [ERC20: Approve] → [Wait] → [Contract: Write - Deposit] → [Wait]
```

### Check Allowance Before Transfer From

```
[Trigger] → [ERC20: Get Allowance] → [Conditional] → [ERC20: Transfer From]
```

## Common Token Addresses

### Ethereum Mainnet

- **USDT**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **DAI**: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Polygon

- **USDT**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **WMATIC**: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`

## Tips

- **Decimals**: Most tokens use 18 decimals, but some (like USDC, USDT) use 6
- **Format Decimals**: Enable this to get human-readable amounts
- **Unlimited Approval**: Use "unlimited" for amount to approve max uint256
- **Check Balance**: Always check balance before transfers
- **Gas Costs**: Token transfers cost more gas than ETH transfers
- **Approval Pattern**: Most DeFi interactions require approve → interact pattern
- **Token Address**: Always verify token addresses on Etherscan or official sources
