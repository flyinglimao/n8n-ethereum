---
sidebar_position: 2
---

# Account（账户）

Account 资源提供查询以太坊账户（地址）信息的操作。

## 操作

### Get Balance（获取余额）

检索账户的原生代币余额（ETH）。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（可选）：要查询的以太坊地址。如果未提供，使用 Account 凭证中的钱包地址
- **Format**（格式）：选择输出格式
  - `wei`：wei 单位的原始余额（默认）
  - `gwei`：gwei 单位的余额（1 gwei = 10^9 wei）
  - `ether`：ether 单位的余额（1 ether = 10^18 wei）
- **Block**（区块）：要查询的区块号（默认：latest）

**示例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "format": "ether"
}
```

**输出**：
```json
{
  "balance": "1.234567890123456789"
}
```

### Get Transaction Count（获取交易计数）

获取从账户发送的交易数量（也称为 nonce）。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（可选）：要查询的以太坊地址。如果未提供，使用 Account 凭证中的钱包地址
- **Block**（区块）：要查询的区块号（默认：latest）

**使用场景**：
- 确定发送交易的下一个 nonce
- 检查账户发送了多少交易
- 验证账户活动

**示例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**输出**：
```json
{
  "transactionCount": 42
}
```

### Get Code（获取代码）

检索存储在地址上的字节码。如果地址不是合约，则返回空。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（必需）：要查询的以太坊地址
- **Block**（区块）：要查询的区块号（默认：latest）

**使用场景**：
- 检查地址是否为智能合约
- 检索合约字节码以进行验证
- 验证合约部署

**示例**：
```json
{
  "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

**输出**：
```json
{
  "code": "0x608060405234801561001057600080fd5b50..."
}
```

如果不是合约：
```json
{
  "code": "0x"
}
```

## 常见使用场景

### 检查钱包余额

在执行交易之前监控您的钱包余额：

```
[Schedule Trigger] → [Ethereum: Account - Get Balance] → [Condition] → [Alert if Low]
```

### 验证合约部署

检查合约是否成功部署：

```
[Deploy Contract] → [Wait For Transaction] → [Get Code] → [Verify Code Exists]
```

### 获取交易的下一个 Nonce

在发送交易之前检索正确的 nonce：

```
[Trigger] → [Get Transaction Count] → [Use in Send Transaction]
```

## 提示

- **地址格式**：所有地址应为有效的以太坊地址（0x 后跟 40 个十六进制字符）
- **可选地址**：未提供地址时，节点使用 Account 凭证中的钱包地址
- **余额格式**：使用 `ether` 格式获得人类可读的余额，使用 `wei` 进行精确计算
- **合约检测**：如果 `getCode` 返回非空值（不是 "0x"），则地址为合约
