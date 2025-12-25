---
sidebar_position: 4
---

# Transaction（交易）

Transaction 资源提供发送交易和查询交易资讯的操作。

## 操作

### Send Transaction（发送交易）

发送原生代币（ETH）到地址。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **To**（接收者）（必需）：接收者地址
- **Value**（价值）（必需）：要发送的金额（以 ether 为单位）
- **Gas Limit**（Gas 限制）（可选）：使用的最大 Gas（未提供则自动估算）
- **Max Fee Per Gas**（每 Gas 最大费用）（可选）：每 Gas 的最大总费用（EIP-1559）
- **Max Priority Fee Per Gas**（每 Gas 最大优先费用）（可选）：每 Gas 的最大优先费用（EIP-1559）
- **Nonce**（可选）：交易 nonce（未提供则自动计算）
- **Data**（资料）（可选）：交易中包含的额外资料

**范例**：
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**输出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "100000000000000000",
  "gasLimit": "21000"
}
```

### Get Transaction（取得交易）

通过杂凑检索交易详情。

**所需凭证**：Ethereum RPC

**参数**：
- **Transaction Hash**（交易杂凑）（必需）：要查询的交易杂凑

**范例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**输出**：
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

### Get Transaction Receipt（取得交易收据）

取得交易收据，包括日志和状态。

**所需凭证**：Ethereum RPC

**参数**：
- **Transaction Hash**（交易杂凑）（必需）：要查询的交易杂凑

**使用场景**：
- 检查交易是否成功
- 检索交易发出的事件日志
- 取得交易使用的 Gas

**范例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**输出**：
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

### Wait For Transaction（等待交易）

等待交易在区块链上确认。

**所需凭证**：Ethereum RPC

**参数**：
- **Transaction Hash**（交易杂凑）（必需）：要等待的交易杂凑
- **Confirmations**（确认数）（可选）：要等待的确认数（预设：1）
- **Timeout**（逾时）（可选）：等待的最长时间（毫秒）（预设：60000）

**使用场景**：
- 确保交易在继续之前已确认
- 等待多次确认以提高安全性
- 处理工作流程中的交易时序

**范例**：
```json
{
  "hash": "0x1234567890abcdef...",
  "confirmations": 3,
  "timeout": 120000
}
```

**输出**：
```json
{
  "transactionHash": "0x1234567890abcdef...",
  "status": "success",
  "blockNumber": 12345678,
  "confirmations": 3
}
```

### Estimate Gas（估算 Gas）

估算交易所需的 Gas。

**所需凭证**：Ethereum RPC

**参数**：
- **To**（接收者）（必需）：接收者地址
- **Value**（价值）（可选）：金额（以 ether 为单位）
- **Data**（资料）（可选）：交易资料
- **From**（发送者）（可选）：发送者地址

**使用场景**：
- 发送前计算 Gas 成本
- 优化交易参数
- 预算交易费用

**范例**：
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**输出**：
```json
{
  "gasEstimate": "21000",
  "gasEstimateWithBuffer": "25200"
}
```

## 常见使用场景

### 发送 ETH 并等待确认

```
[Trigger] → [Send Transaction] → [Wait For Transaction] → [成功通知]
```

### 检查交易状态

```
[带 TX Hash 的 Trigger] → [Get Transaction Receipt] → [检查状态] → [动作]
```

### 发送前估算

```
[Trigger] → [Estimate Gas] → [计算成本] → [条件发送]
```

## EIP-1559 Gas 费用

现代以太坊交易使用 EIP-1559 Gas 定价，包含两个组成部分：

- **Max Fee Per Gas**：您愿意支付的最大总费用
- **Max Priority Fee Per Gas**：给矿工/验证者的小费

如果未指定，这些会根据当前网路状况自动计算。

## 提示

- **Gas 估算**：发送前始终估算 Gas 以避免失败
- **确认数**：对于高价值交易，等待多次确认（3-6 次）
- **逾时**：网路拥塞期间增加逾时
- **交易状态**：在假设成功之前始终检查收据状态
- **Nonce 管理**：除非需要特定顺序，否则让节点自动计算 nonce
- **价值格式**：价值以 ether 指定，而不是 wei
