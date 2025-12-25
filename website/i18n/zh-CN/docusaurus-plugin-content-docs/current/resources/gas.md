---
sidebar_position: 6
---

# Gas

Gas 资源提供查询 Gas 价格和费用资讯的操作。

## 操作

### Get Gas Price（取得 Gas 价格）

检索当前的传统 Gas 价格。

**所需凭证**：Ethereum RPC

**参数**：无

**输出范例**：
```json
{
  "gasPrice": "20000000000"
}
```

### Get Fee History（取得费用历史）

分析历史费用资料以优化 EIP-1559。

**所需凭证**：Ethereum RPC

**参数**：
- **Block Count**（区块数）（必需）：要查询的区块数
- **Newest Block**（最新区块）（可选）：起始区块（预设：latest）
- **Reward Percentiles**（奖励百分位数）（可选）：要计算的百分位数阵列

**使用场景**：
- 优化 EIP-1559 Gas 费用
- 分析费用趋势
- 预测最佳交易时机

**范例**：
```json
{
  "blockCount": 10,
  "rewardPercentiles": [25, 50, 75]
}
```

### Estimate Max Priority Fee（估算最大优先费用）

估算交易的最大优先费用。

**所需凭证**：Ethereum RPC

**参数**：无

**输出范例**：
```json
{
  "maxPriorityFeePerGas": "2000000000"
}
```

## 常见使用场景

### 动态费用计算

```
[Trigger] → [Get Fee History] → [计算最佳费用] → [发送交易]
```

### Gas 价格监控

```
[Schedule Trigger] → [Get Gas Price] → [检查阈值] → [警报]
```

## 提示

- **EIP-1559**：大多数现代网路使用 EIP-1559 定价（基础费用 + 优先费用）
- **传统 Gas**：某些网路仍使用传统 Gas 定价
- **费用历史**：用于根据网路状况智慧估算费用
- **网路拥塞**：高网路使用期间费用会增加
