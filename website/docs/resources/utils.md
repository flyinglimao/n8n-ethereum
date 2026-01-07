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

**Example**:
```json
{
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```

**Output**:
```json
{
  "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```

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

**Example**:
```json
{
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```

**Output**:
```json
{
  "functionName": "transfer",
  "args": {
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "1000000000000000000"
  }
}
```

### Encode Event Topics

Encode event topics for log filtering.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Event ABI** (required): Event ABI
- **Arguments** (optional): Indexed parameters

**Example**:
```json
{
  "eventAbi": "{\"name\":\"Transfer\",\"type\":\"event\",\"inputs\":[{\"name\":\"from\",\"type\":\"address\",\"indexed\":true},{\"name\":\"to\",\"type\":\"address\",\"indexed\":true},{\"name\":\"value\",\"type\":\"uint256\"}]}",
  "args": {
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

**Output**:
```json
{
  "topics": [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb"
  ]
}
```

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

**Example**:
```json
{
  "eventAbi": "{\"name\":\"Transfer\",\"type\":\"event\",\"inputs\":[{\"name\":\"from\",\"type\":\"address\",\"indexed\":true},{\"name\":\"to\",\"type\":\"address\",\"indexed\":true},{\"name\":\"value\",\"type\":\"uint256\"}]}",
  "topics": [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb",
    "0x0000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d"
  ],
  "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```

**Output**:
```json
{
  "event": "Transfer",
  "args": {
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
    "value": "1000000000000000000"
  }
}
```

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

**Example (CREATE)**:
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "nonce": 5
}
```

**Output**:
```json
{
  "address": "0x1234567890123456789012345678901234567890"
}
```

**Example (CREATE2)**:
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "bytecodeHash": "0x1234567890abcdef...",
  "salt": "0x0000000000000000000000000000000000000000000000000000000000000001"
}
```

**Output**:
```json
{
  "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
}
```

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
