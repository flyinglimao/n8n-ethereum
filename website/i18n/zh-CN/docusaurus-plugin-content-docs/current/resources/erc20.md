---
sidebar_position: 5
---

# ERC20

ERC20 资源提供便捷的操作，无需手动指定 ABI 即可与 ERC20 代币合约互动。

## 概述

ERC20 是以太坊上最常见的代币标准。此资源自动处理 ERC20 ABI，使与任何 ERC20 代币的互动变得简单。

**常见的 ERC20 代币**：
- USDT（Tether）
- USDC（USD Coin）
- DAI（Dai Stablecoin）
- WETH（Wrapped Ether）
- 以及数千种其他代币...

## 操作

### Get Balance（取得余额）

取得地址的代币余额。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **Owner Address**（所有者地址）（必需）：要检查余额的地址
- **Format Decimals**（格式化小数）（可选）：使用代币小数格式化输出（预设：true）

**范例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "formatDecimals": true
}
```

**输出**：
```json
{
  "balance": "1000.50",
  "decimals": 6,
  "rawBalance": "1000500000"
}
```

### Transfer（转帐）

将代币转移到另一个地址。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **To**（接收者）（必需）：接收者地址
- **Amount**（数量）（必需）：要转帐的数量（以代币单位表示，将使用小数进行转换）

**范例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100.5"
}
```

**输出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}
```

### Approve（授权）

授权另一个地址代表您花费代币。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **Spender**（花费者）（必需）：要授权的地址
- **Amount**（数量）（必需）：要授权的数量（使用 "unlimited" 取得最大授权）

**使用场景**：
- 授权 DEX 合约交换代币
- 授权质押合约存入代币
- 为合约设定支出限制

**范例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  "amount": "unlimited"
}
```

### Transfer From（从...转帐）

使用授权转移代币（需要事先授权）。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **From**（来源）（必需）：转帐来源地址
- **To**（接收者）（必需）：接收者地址
- **Amount**（数量）（必需）：要转帐的数量

**使用场景**：
- 拉取支付
- 基于合约的代币转帐
- 自动支付系统

### Get Allowance（取得授权额度）

检查花费者被允许代表所有者花费多少。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **Owner**（所有者）（必需）：代币所有者地址
- **Spender**（花费者）（必需）：花费者地址
- **Format Decimals**（格式化小数）（可选）：使用代币小数格式化输出

**范例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d"
}
```

### Get Total Supply（取得总供应量）

取得代币的总供应量。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址
- **Format Decimals**（格式化小数）（可选）：使用代币小数格式化输出

### Get Decimals（取得小数位数）

取得代币使用的小数位数。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址

**输出**：
```json
{
  "decimals": 6
}
```

### Get Name（取得名称）

取得代币名称。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址

**输出**：
```json
{
  "name": "USD Coin"
}
```

### Get Symbol（取得符号）

取得代币符号。

**所需凭证**：Ethereum RPC

**参数**：
- **Token Address**（代币地址）（必需）：ERC20 代币合约地址

**输出**：
```json
{
  "symbol": "USDC"
}
```

## 常见使用场景

### 监控代币余额

```
[Schedule Trigger] → [ERC20: Get Balance] → [Check Threshold] → [Alert]
```

### 自动代币转帐

```
[Trigger] → [ERC20: Transfer] → [Wait For Transaction] → [Notification]
```

### 授权并存入 DeFi

```
[Trigger] → [ERC20: Approve] → [Wait] → [Contract: Write - Deposit] → [Wait]
```

### 在 Transfer From 之前检查授权额度

```
[Trigger] → [ERC20: Get Allowance] → [Conditional] → [ERC20: Transfer From]
```

## 常见代币地址

### 以太坊主网

- **USDT**：`0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC**：`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **DAI**：`0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **WETH**：`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Polygon

- **USDT**：`0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **USDC**：`0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **WMATIC**：`0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`

## 提示

- **小数位数**：大多数代币使用 18 位小数，但有些（如 USDC、USDT）使用 6 位
- **格式化小数**：启用此选项以取得人类可读的数量
- **无限授权**：使用 "unlimited" 作为数量以授权最大 uint256
- **检查余额**：在转帐前始终检查余额
- **Gas 成本**：代币转帐比 ETH 转帐消耗更多 Gas
- **授权模式**：大多数 DeFi 互动需要 授权 → 互动 模式
- **代币地址**：始终在 Etherscan 或官方来源验证代币地址
