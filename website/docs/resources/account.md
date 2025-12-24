---
sidebar_position: 2
---

# Account

Account resource provides operations to query information about Ethereum accounts (addresses).

## Operations

### Get Balance

Retrieve the native token balance (ETH) of an account.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Address** (optional): The Ethereum address to query. If not provided, uses the wallet address from Account credential
- **Format**: Choose output format
  - `wei`: Raw balance in wei (default)
  - `gwei`: Balance in gwei (1 gwei = 10^9 wei)
  - `ether`: Balance in ether (1 ether = 10^18 wei)
- **Block**: Block number to query (default: latest)

**Example**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "format": "ether"
}
```

**Output**:
```json
{
  "balance": "1.234567890123456789"
}
```

### Get Transaction Count

Get the number of transactions sent from an account (also known as nonce).

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Address** (optional): The Ethereum address to query. If not provided, uses the wallet address from Account credential
- **Block**: Block number to query (default: latest)

**Use Cases**:
- Determine the next nonce for sending transactions
- Check how many transactions an account has sent
- Verify account activity

**Example**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Output**:
```json
{
  "transactionCount": 42
}
```

### Get Code

Retrieve the bytecode stored at an address. Returns empty if the address is not a contract.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Address** (required): The Ethereum address to query
- **Block**: Block number to query (default: latest)

**Use Cases**:
- Check if an address is a smart contract
- Retrieve contract bytecode for verification
- Verify contract deployment

**Example**:
```json
{
  "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

**Output**:
```json
{
  "code": "0x608060405234801561001057600080fd5b50..."
}
```

If not a contract:
```json
{
  "code": "0x"
}
```

## Common Use Cases

### Check Wallet Balance

Monitor your wallet balance before executing transactions:

```
[Schedule Trigger] → [Ethereum: Account - Get Balance] → [Condition] → [Alert if Low]
```

### Verify Contract Deployment

Check if a contract was successfully deployed:

```
[Deploy Contract] → [Wait For Transaction] → [Get Code] → [Verify Code Exists]
```

### Get Next Nonce for Transactions

Retrieve the correct nonce before sending a transaction:

```
[Trigger] → [Get Transaction Count] → [Use in Send Transaction]
```

## Tips

- **Address Format**: All addresses should be valid Ethereum addresses (0x followed by 40 hex characters)
- **Optional Address**: When address is not provided, the node uses the wallet address from the Account credential
- **Balance Formatting**: Use `ether` format for human-readable balances, `wei` for precise calculations
- **Contract Detection**: An address is a contract if `getCode` returns a non-empty value (not "0x")
