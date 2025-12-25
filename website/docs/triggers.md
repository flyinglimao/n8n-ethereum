---
sidebar_position: 4
---

# Triggers

The Ethereum Trigger node allows you to monitor blockchain events and automatically trigger workflows when specific conditions are met. This node provides three types of triggers for different use cases.

## Trigger Types

### Event Trigger

Monitor smart contract events and trigger workflows when contracts emit specific events.

**Required Credentials**: Ethereum RPC

**Parameters**:

- **Contract Address** (optional): One or more contract addresses to monitor. Leave empty to monitor all contracts
- **Event ABI** (required): The ABI definition of the event(s) to monitor
- **Event Name** (optional): Specific event name to filter
- **Indexed Parameters** (optional): Filter events by indexed parameter values

**Features**:

- Monitor all contracts or specific addresses
- Support multiple contract addresses
- Support multiple event types
- Filter by indexed event parameters
- Automatic event log decoding

**Use Cases**:

- Monitor token transfers
- Track NFT minting/sales
- Listen for DAO votes
- Detect contract state changes

**Example - Monitor ERC20 Transfers**:

```json
{
  "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "eventAbi": {
    "name": "Transfer",
    "type": "event",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "value", "type": "uint256" }
    ]
  }
}
```

**Workflow Example**:

```
[Event Trigger: Transfer] → [Check if amount > 1000] → [Send Notification]
```

### Block Trigger

Trigger workflows when new blocks are created on the blockchain.

**Required Credentials**: Ethereum RPC

**Parameters**:

- **Polling Interval** (optional): How often to check for new blocks in seconds (default: 12)

**Features**:

- Real-time block monitoring
- Configurable polling interval
- Provides complete block information

**Use Cases**:

- Monitor blockchain progress
- Calculate block time
- Track network activity
- Trigger time-based operations

**Output Data**:

```json
{
  "number": "18500000",
  "hash": "0x...",
  "parentHash": "0x...",
  "timestamp": "1693526411",
  "miner": "0x...",
  "gasLimit": "30000000",
  "gasUsed": "12345678",
  "transactions": ["0x...", "0x..."]
}
```

**Workflow Example**:

```
[Block Trigger] → [Get Block Details] → [Store in Database]
```

### Transaction Trigger

Monitor transactions at specific addresses and trigger when transactions occur.

**Required Credentials**: Ethereum RPC

**Parameters**:

- **Address** (required): The Ethereum address(es) to monitor
- **Direction** (optional): Filter transaction direction
  - `both`: Monitor both incoming and outgoing (default)
  - `incoming`: Only incoming transactions
  - `outgoing`: Only outgoing transactions
- **Polling Interval** (optional): How often to check in seconds (default: 12)

**Features**:

- Monitor specific addresses
- Filter by transaction direction
- Support multiple addresses
- Automatic transaction detection

**Use Cases**:

- Monitor wallet activity
- Track payment receipts
- Alert on large transactions
- Detect suspicious activity

**Output Data**:

```json
{
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gasPrice": "20000000000",
  "blockNumber": "18500000",
  "direction": "incoming"
}
```

**Workflow Example**:

```
[Transaction Trigger] → [Check Amount] → [Update Accounting System]
```

## Common Patterns

### Event-Driven Workflows

Monitor contract events and react automatically:

```
[Event Trigger] → [Decode Event Data] → [Process] → [Take Action]
```

### Payment Monitoring

Track incoming payments to your wallet:

```
[Transaction Trigger: incoming] → [Verify Amount] → [Send Confirmation Email]
```

### Multi-Contract Monitoring

Monitor multiple contracts simultaneously:

```
[Event Trigger: Multiple Addresses] → [Identify Contract] → [Route to Handler]
```

### Block-Based Scheduling

Execute tasks on every N blocks:

```
[Block Trigger] → [Check Block Number % N == 0] → [Execute Task]
```

## Performance Considerations

### Polling Intervals

- **Block Trigger**: Default 12 seconds matches Ethereum block time
- **Transaction Trigger**: Adjust based on expected activity
- **Event Trigger**: Automatically polls based on block time

### Rate Limiting

- Use appropriate polling intervals to avoid RPC rate limits
- Consider using WebSocket connections for real-time monitoring
- Some RPC providers charge based on request volume

### Filtering

- Use indexed parameters to reduce data processing
- Filter at the trigger level when possible
- Specify contract addresses to reduce unnecessary checks

## Tips

- **Test on Testnet**: Always test triggers on testnets (Sepolia, Goerli) before mainnet
- **Error Handling**: Add error handling for network issues and RPC failures
- **Deduplication**: Triggers may occasionally fire twice; implement deduplication logic
- **Historical Data**: Triggers only monitor new events; use regular nodes for historical data
- **Gas Costs**: Triggers don't cost gas; they only monitor the blockchain
- **Multiple Triggers**: You can use multiple triggers in different workflows
- **ABI Format**: Ensure event ABIs are correctly formatted JSON

## Troubleshooting

### Trigger Not Firing

- Check RPC connection and credentials
- Verify contract address is correct
- Ensure event ABI matches the contract
- Check polling interval isn't too high
- Verify the event is actually being emitted

### Missing Events

- RPC provider may have rate limits
- Polling interval too high
- Network congestion causing delays
- Check RPC provider's block lag

### Duplicate Events

- Normal behavior during reorganizations
- Implement event ID tracking
- Use transaction hash for deduplication

## Next Steps

- Learn about [Account](resources/account) operations to query balances
- Explore [Contract](resources/contract) operations to interact with events
- See [Transaction](resources/transaction) for sending transactions in response to triggers
