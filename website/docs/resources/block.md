---
sidebar_position: 3
---

# Block

Block resource provides operations for querying blockchain block information.

## Operations

### Get Block

Retrieve detailed information about a specific block.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Block Number or Hash** (optional): Block number or hash to query (default: latest)
- **Include Transactions** (optional): Include full transaction objects (default: false)

**Example**:
```json
{
  "blockNumber": "18000000"
}
```

**Output**:
```json
{
  "number": "18000000",
  "hash": "0x...",
  "parentHash": "0x...",
  "timestamp": "1693526411",
  "miner": "0x...",
  "gasLimit": "30000000",
  "gasUsed": "12345678",
  "transactions": ["0x...", "0x..."]
}
```

### Get Block Number

Get the current blockchain height (latest block number).

**Required Credentials**: Ethereum RPC

**Parameters**: None

**Use Cases**:
- Monitor blockchain progress
- Sync application state
- Calculate block ranges for queries

**Example Output**:
```json
{
  "blockNumber": "18500000"
}
```

## Common Use Cases

### Monitor New Blocks

```
[Schedule Trigger] → [Get Block Number] → [Check if Changed] → [Process New Block]
```

### Query Historical Block Data

```
[Trigger] → [Get Block] → [Process Block Data] → [Store]
```

## Tips

- **Block Identifiers**: Can use block number, block hash, or special tags (latest, earliest, pending)
- **Full Transactions**: Enable to get complete transaction objects instead of just hashes
- **Caching**: Block data is immutable once confirmed, safe to cache
- **Rate Limits**: Some RPC providers charge more for blocks with full transactions
