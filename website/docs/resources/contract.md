---
sidebar_position: 4
---

# Contract

Contract resource provides operations for interacting with smart contracts on the Ethereum blockchain.

## Operations

### Read Contract

Call a read-only (view/pure) function on a smart contract.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Contract Address** (required): The smart contract address
- **ABI** (required): Contract ABI (Application Binary Interface) in JSON format
- **Function Name** (required): Name of the function to call
- **Function Arguments** (optional): Arguments for the function in JSON array format
- **Block** (optional): Block number to query (default: latest)

**Example**:
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"balanceOf\",\"type\":\"function\",\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}]}]",
  "functionName": "balanceOf",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\"]"
}
```

**Output**:
```json
{
  "result": "1000000000000000000"
}
```

### Write Contract

Execute a state-changing function on a smart contract.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Contract Address** (required): The smart contract address
- **ABI** (required): Contract ABI in JSON format
- **Function Name** (required): Name of the function to call
- **Function Arguments** (optional): Arguments for the function in JSON array format
- **Value** (optional): ETH to send with transaction (in ether)
- **Gas Limit** (optional): Maximum gas to use
- **Max Fee Per Gas** (optional): Maximum total fee per gas
- **Max Priority Fee Per Gas** (optional): Maximum priority fee per gas

**Example**:
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```

**Output**:
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

### Deploy Contract

Deploy a new smart contract to the blockchain.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Bytecode** (required): Contract bytecode (from compilation)
- **ABI** (required): Contract ABI
- **Constructor Arguments** (optional): Arguments for constructor
- **Value** (optional): ETH to send with deployment
- **Gas Limit** (optional): Maximum gas to use

**Example**:
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"_name\",\"type\":\"string\"}]}]",
  "args": "[\"MyToken\"]"
}
```

**Output**:
```json
{
  "hash": "0x1234567890abcdef...",
  "contractAddress": "0xNewContractAddress..."
}
```

### Multicall

Batch multiple read operations into a single call for efficiency.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Calls** (required): Array of calls to execute
  - Each call contains: contract address, ABI, function name, arguments

**Use Cases**:
- Read multiple values from one or more contracts in a single call
- Reduce RPC calls and improve performance
- Ensure all reads are from the same block

**Example**:
```json
{
  "calls": [
    {
      "address": "0x...",
      "abi": "[...]",
      "functionName": "balanceOf",
      "args": "[\"0x...\"]"
    },
    {
      "address": "0x...",
      "abi": "[...]",
      "functionName": "totalSupply",
      "args": "[]"
    }
  ]
}
```

### Simulate Contract

Test a contract call without sending a transaction.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Contract Address** (required): The smart contract address
- **ABI** (required): Contract ABI
- **Function Name** (required): Name of the function
- **Function Arguments** (optional): Arguments for the function
- **Value** (optional): ETH to simulate sending
- **From** (optional): Address to simulate call from

**Use Cases**:
- Test transactions before sending
- Verify contract behavior
- Check for revert reasons

### Get Logs

Query historical event logs from smart contracts.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Contract Address** (optional): Filter by contract address
- **Event ABI** (required): ABI of the event to decode
- **From Block** (optional): Starting block number
- **To Block** (optional): Ending block number
- **Topics** (optional): Filter by indexed event parameters

**Use Cases**:
- Query historical events
- Track token transfers
- Monitor contract activity

**Example**:
```json
{
  "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "eventAbi": "{\"name\":\"Transfer\",\"type\":\"event\",\"inputs\":[{\"name\":\"from\",\"type\":\"address\",\"indexed\":true},{\"name\":\"to\",\"type\":\"address\",\"indexed\":true},{\"name\":\"value\",\"type\":\"uint256\"}]}",
  "fromBlock": "18000000",
  "toBlock": "18000100"
}
```

## Common Use Cases

### Read Contract State

```
[Schedule Trigger] → [Read Contract] → [Store Data]
```

### Execute Contract Function

```
[Trigger] → [Write Contract] → [Wait For Transaction] → [Success Handler]
```

### Deploy and Initialize Contract

```
[Trigger] → [Deploy Contract] → [Wait For Transaction] → [Write Contract] → [Initialize]
```

### Query Historical Events

```
[Schedule Trigger] → [Get Logs] → [Process Events] → [Store in Database]
```

## ABI Format

The ABI (Application Binary Interface) defines the contract's interface. You can get it from:

- Contract verification on Etherscan
- Compiler output (Hardhat, Foundry, etc.)
- Contract documentation

**Minimal ABI Example**:
```json
[
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [
      {"name": "", "type": "bool"}
    ]
  }
]
```

## Tips

- **ABI Requirements**: Only include the functions/events you need in the ABI
- **Arguments Format**: Always provide arguments as a JSON array string
- **Gas Estimation**: For write operations, let the node estimate gas unless you have specific requirements
- **Multicall**: Use for batch reads to save RPC calls and ensure consistency
- **Event Filtering**: Use indexed parameters in events for efficient filtering
- **Simulation**: Always simulate complex transactions before executing
- **Block Numbers**: For historical queries, be aware of RPC provider's block range limits
