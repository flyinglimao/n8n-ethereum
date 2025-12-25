---
sidebar_position: 3
---

# Block（区块）

Block 资源提供查询区块链区块资讯的操作。

## 操作

### Get Block（取得区块）

检索特定区块的详细资讯。

**所需凭证**：Ethereum RPC

**参数**：
- **Block Number or Hash**（区块号或杂凑）（可选）：要查询的区块号或杂凑（预设：latest）
- **Include Transactions**（包含交易）（可选）：包含完整交易物件（预设：false）

**范例**：
```json
{
  "blockNumber": "18000000"
}
```

**输出**：
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

### Get Block Number（取得区块号）

取得当前区块链高度（最新区块号）。

**所需凭证**：Ethereum RPC

**参数**：无

**使用场景**：
- 监控区块链进度
- 同步应用程式状态
- 计算查询的区块范围

**输出范例**：
```json
{
  "blockNumber": "18500000"
}
```

## 常见使用场景

### 监控新区块

```
[Schedule Trigger] → [Get Block Number] → [检查是否变更] → [处理新区块]
```

### 查询历史区块资料

```
[Trigger] → [Get Block] → [处理区块资料] → [储存]
```

## 提示

- **区块识别符**：可以使用区块号、区块杂凑或特殊标签（latest、earliest、pending）
- **完整交易**：启用以取得完整交易物件而不是仅杂凑
- **快取**：区块资料一旦确认就是不可变的，可以安全快取
- **速率限制**：某些 RPC 提供商对包含完整交易的区块收取更多费用
