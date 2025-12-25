---
sidebar_position: 2
---

# Account（帐户）

Account 资源提供查询以太坊帐户（地址）资讯的操作。

## 操作

### Get Current Address（取得目前地址）

从 Account 凭证取得目前连接的钱包地址。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：无

**使用场景**：
- 识别正在使用的钱包地址
- 显示目前帐户资讯
- 验证连接的是哪个帐户

**范例输出**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Get Balance（取得余额）

检索帐户的原生代币余额（ETH）。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（可选）：要查询的以太坊地址。如果未提供，使用 Account 凭证中的钱包地址
- **Format**（格式）：选择输出格式
  - `wei`：wei 单位的原始余额（预设）
  - `gwei`：gwei 单位的余额（1 gwei = 10^9 wei）
  - `ether`：ether 单位的余额（1 ether = 10^18 wei）
- **Block**（区块）：要查询的区块号（预设：latest）

**范例**：
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

### Get Transaction Count（取得交易计数）

取得从帐户传送的交易数量（也称为 nonce）。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（可选）：要查询的以太坊地址。如果未提供，使用 Account 凭证中的钱包地址
- **Block**（区块）：要查询的区块号（预设：latest）

**使用场景**：
- 确定传送交易的下一个 nonce
- 检查帐户传送了多少交易
- 验证帐户活动

**范例**：
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

### Get Code（取得程式码）

检索储存在地址上的字节码。如果地址不是合约，则返回空。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（必需）：要查询的以太坊地址
- **Block**（区块）：要查询的区块号（预设：latest）

**使用场景**：
- 检查地址是否为智慧合约
- 检索合约字节码以进行验证
- 验证合约部署

**范例**：
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

### 取得交易的下一个 Nonce

在传送交易之前检索正确的 nonce：

```
[Trigger] → [Get Transaction Count] → [Use in Send Transaction]
```

## 提示

- **地址格式**：所有地址应为有效的以太坊地址（0x 后跟 40 个十六进位字元）
- **可选地址**：未提供地址时，节点使用 Account 凭证中的钱包地址
- **余额格式**：使用 `ether` 格式取得人类可读的余额，使用 `wei` 进行精确计算
- **合约检测**：如果 `getCode` 返回非空值（不是 "0x"），则地址为合约
