---
sidebar_position: 12
---

# Custom RPC

The Custom RPC resource allows you to send raw RPC requests directly to the Ethereum node, enabling access to any RPC method including standard, extended, or custom methods not covered by other resources.

## Operations

### Request

Send a custom RPC request with any method and parameters.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **RPC Method** (required): The RPC method name (e.g., `eth_getBalance`, `debug_traceTransaction`)
- **RPC Parameters** (optional): Parameters for the RPC method as a JSON array

**Example - Get Balance**:
```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]
}
```

**Output**:
```json
{
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"],
  "result": "0x1bc16d674ec80000"
}
```

**Example - Get Storage At**:
```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"]
}
```

**Output**:
```json
{
  "method": "eth_getStorageAt",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"],
  "result": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

## Common Use Cases

### Debug Transactions

Use debug RPC methods to trace transaction execution:

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": ["0x123...", {"tracer": "callTracer"}]
}
```

### Access Archive Data

Query historical state data from archive nodes:

```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x1"]
}
```

### Use Custom Methods

Access node-specific or custom RPC methods:

```json
{
  "rpcMethod": "eth_feeHistory",
  "rpcParams": [4, "latest", [25, 50, 75]]
}
```

### Get Storage Slot

Read specific storage slots from contracts:

```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0xContractAddress", "0x0", "latest"]
}
```

## Supported RPC Methods

### Standard Ethereum Methods

- **eth_getBalance**: Get account balance
- **eth_getStorageAt**: Get storage at position
- **eth_getTransactionCount**: Get transaction count (nonce)
- **eth_getCode**: Get contract code
- **eth_call**: Execute contract call
- **eth_estimateGas**: Estimate gas usage
- **eth_getBlockByNumber**: Get block by number
- **eth_getBlockByHash**: Get block by hash
- **eth_getTransactionByHash**: Get transaction by hash
- **eth_getTransactionReceipt**: Get transaction receipt
- **eth_getLogs**: Get event logs
- **eth_gasPrice**: Get current gas price
- **eth_feeHistory**: Get historical fee data
- **eth_getProof**: Get Merkle proof

### Debug Methods (Geth)

- **debug_traceTransaction**: Trace transaction execution
- **debug_traceCall**: Trace call execution
- **debug_traceBlockByNumber**: Trace all transactions in a block
- **debug_traceBlockByHash**: Trace block by hash

### Trace Methods (Parity/OpenEthereum)

- **trace_transaction**: Trace transaction
- **trace_block**: Trace block
- **trace_replayTransaction**: Replay transaction
- **trace_call**: Trace call

### Custom Methods

- Any custom RPC methods exposed by your Ethereum node
- Network-specific methods (e.g., Arbitrum, Optimism extensions)
- Custom indexer or middleware methods

## Examples

### Example 1: Get Block Transaction Count

```json
{
  "rpcMethod": "eth_getBlockTransactionCountByNumber",
  "rpcParams": ["latest"]
}
```

### Example 2: Trace Transaction with Call Tracer

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": [
    "0x1234567890abcdef...",
    {
      "tracer": "callTracer",
      "tracerConfig": {
        "onlyTopCall": false
      }
    }
  ]
}
```

### Example 3: Get Proof

```json
{
  "rpcMethod": "eth_getProof",
  "rpcParams": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    ["0x0"],
    "latest"
  ]
}
```

### Example 4: Batch Multiple Calls

You can use n8n's batch processing to send multiple RPC requests in sequence:

```
Input items → Custom RPC (multiple methods) → Process results
```

## Tips

- **Method Names**: Use exact RPC method names as specified in the Ethereum JSON-RPC specification
- **Parameters**: Always provide parameters as a JSON array, even for single parameters
- **Node Support**: Not all nodes support all methods (e.g., debug methods require full node)
- **Archive Nodes**: Historical state queries require archive nodes
- **Custom Headers**: Use the RPC credential to set custom headers for authentication
- **Error Handling**: Enable "Continue on Fail" to handle unsupported methods gracefully
- **Rate Limits**: Be mindful of RPC provider rate limits when making multiple requests

## When to Use Custom RPC

Use Custom RPC when you need to:

- Access methods not available in other resources
- Use debug or trace methods for transaction analysis
- Query historical state data with specific block parameters
- Access node-specific or network-specific RPC methods
- Prototype new functionality before dedicated resource support
- Work with custom or extended RPC APIs

For standard operations, prefer using dedicated resources (Account, Block, Transaction, etc.) as they provide better type safety and parameter validation.
