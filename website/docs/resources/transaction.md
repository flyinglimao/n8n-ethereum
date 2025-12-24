---
sidebar_position: 3
---

# Transaction

Transaction resource provides operations for sending transactions and querying transaction information.

## Operations

### Send Transaction

Send native tokens (ETH) to an address.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **To** (required): Recipient address
- **Value** (required): Amount to send in ether
- **Gas Limit** (optional): Maximum gas to use (auto-estimated if not provided)
- **Max Fee Per Gas** (optional): Maximum total fee per gas (EIP-1559)
- **Max Priority Fee Per Gas** (optional): Maximum priority fee per gas (EIP-1559)
- **Nonce** (optional): Transaction nonce (auto-calculated if not provided)
- **Data** (optional): Additional data to include in transaction

**Example**:
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**Output**:
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "100000000000000000",
  "gasLimit": "21000"
}
```

### Get Transaction

Retrieve details of a transaction by its hash.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Transaction Hash** (required): The transaction hash to query

**Example**:
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**Output**:
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0x...",
  "to": "0x...",
  "value": "100000000000000000",
  "gasLimit": "21000",
  "gasPrice": "20000000000",
  "nonce": 5,
  "blockNumber": 12345678,
  "blockHash": "0x...",
  "transactionIndex": 10
}
```

### Get Transaction Receipt

Get the receipt of a transaction, including logs and status.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Transaction Hash** (required): The transaction hash to query

**Use Cases**:
- Check if transaction was successful
- Retrieve event logs emitted by the transaction
- Get gas used by the transaction

**Example**:
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**Output**:
```json
{
  "transactionHash": "0x1234567890abcdef...",
  "status": "success",
  "blockNumber": 12345678,
  "gasUsed": "21000",
  "effectiveGasPrice": "20000000000",
  "logs": [],
  "contractAddress": null
}
```

### Wait For Transaction

Wait for a transaction to be confirmed on the blockchain.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Transaction Hash** (required): The transaction hash to wait for
- **Confirmations** (optional): Number of confirmations to wait for (default: 1)
- **Timeout** (optional): Maximum time to wait in milliseconds (default: 60000)

**Use Cases**:
- Ensure transaction is confirmed before proceeding
- Wait for multiple confirmations for security
- Handle transaction timing in workflows

**Example**:
```json
{
  "hash": "0x1234567890abcdef...",
  "confirmations": 3,
  "timeout": 120000
}
```

**Output**:
```json
{
  "transactionHash": "0x1234567890abcdef...",
  "status": "success",
  "blockNumber": 12345678,
  "confirmations": 3
}
```

### Estimate Gas

Estimate the gas required for a transaction.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **To** (required): Recipient address
- **Value** (optional): Amount in ether
- **Data** (optional): Transaction data
- **From** (optional): Sender address

**Use Cases**:
- Calculate gas costs before sending
- Optimize transaction parameters
- Budget for transaction fees

**Example**:
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**Output**:
```json
{
  "gasEstimate": "21000",
  "gasEstimateWithBuffer": "25200"
}
```

## Common Use Cases

### Send ETH and Wait for Confirmation

```
[Trigger] → [Send Transaction] → [Wait For Transaction] → [Success Notification]
```

### Check Transaction Status

```
[Trigger with TX Hash] → [Get Transaction Receipt] → [Check Status] → [Action]
```

### Estimate Before Sending

```
[Trigger] → [Estimate Gas] → [Calculate Cost] → [Conditional Send]
```

## EIP-1559 Gas Fees

Modern Ethereum transactions use EIP-1559 gas pricing with two components:

- **Max Fee Per Gas**: Maximum total fee you're willing to pay
- **Max Priority Fee Per Gas**: Tip to miners/validators

If not specified, these are automatically calculated based on current network conditions.

## Tips

- **Gas Estimation**: Always estimate gas before sending to avoid failures
- **Confirmations**: For high-value transactions, wait for multiple confirmations (3-6)
- **Timeout**: Increase timeout during network congestion
- **Transaction Status**: Always check receipt status before assuming success
- **Nonce Management**: Let the node auto-calculate nonces unless you need specific ordering
- **Value Format**: Value is specified in ether, not wei
