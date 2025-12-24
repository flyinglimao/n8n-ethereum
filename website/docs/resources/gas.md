---
sidebar_position: 6
---

# Gas

Gas resource provides operations for querying gas prices and fee information.

## Operations

### Get Gas Price

Retrieve the current legacy gas price.

**Required Credentials**: Ethereum RPC

**Parameters**: None

**Example Output**:
```json
{
  "gasPrice": "20000000000"
}
```

### Get Fee History

Analyze historical fee data for EIP-1559 optimization.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Block Count** (required): Number of blocks to query
- **Newest Block** (optional): Starting block (default: latest)
- **Reward Percentiles** (optional): Array of percentiles to calculate

**Use Cases**:
- Optimize EIP-1559 gas fees
- Analyze fee trends
- Predict optimal transaction timing

**Example**:
```json
{
  "blockCount": 10,
  "rewardPercentiles": [25, 50, 75]
}
```

### Estimate Max Priority Fee

Estimate the maximum priority fee for transactions.

**Required Credentials**: Ethereum RPC

**Parameters**: None

**Example Output**:
```json
{
  "maxPriorityFeePerGas": "2000000000"
}
```

## Common Use Cases

### Dynamic Fee Calculation

```
[Trigger] → [Get Fee History] → [Calculate Optimal Fee] → [Send Transaction]
```

### Gas Price Monitoring

```
[Schedule Trigger] → [Get Gas Price] → [Check Threshold] → [Alert]
```

## Tips

- **EIP-1559**: Most modern networks use EIP-1559 pricing (base fee + priority fee)
- **Legacy Gas**: Some networks still use legacy gas pricing
- **Fee History**: Use for smart fee estimation based on network conditions
- **Network Congestion**: Fees increase during high network usage
