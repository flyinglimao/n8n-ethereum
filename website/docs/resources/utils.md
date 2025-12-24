---
sidebar_position: 11
---

# Utils

Utils resource provides utility functions for formatting, encoding, validation, and other helper operations.

## Operations

### Format Units

Convert wei to human-readable format.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Value** (required): The value in wei
- **Decimals** (optional): Number of decimals (default: 18)

**Example**:
```json
{
  "value": "1000000000000000000",
  "decimals": 18
}
```

**Output**:
```json
{
  "formatted": "1.0"
}
```

### Parse Units

Convert human-readable format to wei.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Value** (required): The human-readable value
- **Decimals** (optional): Number of decimals (default: 18)

**Example**:
```json
{
  "value": "1.5",
  "decimals": 18
}
```

**Output**:
```json
{
  "parsed": "1500000000000000000"
}
```

### Get Chain ID

Retrieve the current chain identifier.

**Required Credentials**: Ethereum RPC

**Parameters**: None

**Example Output**:
```json
{
  "chainId": 1
}
```

**Common Chain IDs**:
- `1`: Ethereum Mainnet
- `5`: Goerli Testnet
- `11155111`: Sepolia Testnet
- `137`: Polygon Mainnet
- `56`: BNB Smart Chain
- `42161`: Arbitrum One
- `10`: Optimism

### Validate Address

Validate and checksum an Ethereum address.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Address** (required): The address to validate

**Example**:
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

**Output**:
```json
{
  "valid": true,
  "checksummed": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Encode Function Data

Encode function call data from ABI.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ABI** (required): Function ABI
- **Function Name** (required): Name of the function
- **Arguments** (optional): Function arguments

**Use Cases**:
- Prepare transaction data
- Create multicall payloads
- Encode contract interactions

### Decode Function Data

Decode function call data using ABI.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ABI** (required): Function ABI
- **Data** (required): The encoded data to decode

**Use Cases**:
- Analyze transaction input
- Debug contract calls
- Parse transaction data

### Encode Event Topics

Encode event topics for log filtering.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Event ABI** (required): Event ABI
- **Arguments** (optional): Indexed parameters

### Decode Event Log

Decode event log data using ABI.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Event ABI** (required): Event ABI
- **Topics** (required): Log topics
- **Data** (required): Log data

**Use Cases**:
- Parse event logs
- Extract event parameters
- Understand emitted events

### Get Contract Address

Calculate CREATE or CREATE2 deployment addresses.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **From** (required): Deployer address
- **Nonce** (optional): Transaction nonce (for CREATE)
- **Bytecode Hash** (optional): Keccak256 hash of bytecode (for CREATE2)
- **Salt** (optional): Salt for CREATE2

**Use Cases**:
- Predict contract deployment addresses
- Verify deployment addresses
- Calculate CREATE2 addresses

## Common Use Cases

### Format Token Amounts

```
[Get Balance] → [Format Units] → [Display to User]
```

### Validate User Input

```
[User Input] → [Validate Address] → [Continue if Valid]
```

### Decode Transaction Data

```
[Get Transaction] → [Decode Function Data] → [Understand Call]
```

### Parse Event Logs

```
[Get Logs] → [Decode Event Log] → [Process Events]
```

## Tips

- **Decimals**: ETH uses 18 decimals, but tokens can use any (commonly 6, 8, or 18)
- **Checksumming**: Always use checksummed addresses for display
- **Chain ID**: Use to verify you're on the correct network
- **Encoding**: Encode data before sending raw transactions
- **CREATE2**: Deterministic addresses useful for counterfactual deployments
- **Event Decoding**: Automatically handles indexed vs non-indexed parameters
