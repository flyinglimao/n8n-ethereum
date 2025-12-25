---
sidebar_position: 5
---

# ERC20

ERC20 資源提供便捷的操作，無需手動指定 ABI 即可與 ERC20 代幣合約互動。

## 概述

ERC20 是以太坊上最常見的代幣標準。此資源自動處理 ERC20 ABI，使與任何 ERC20 代幣的互動變得簡單。

**常見的 ERC20 代幣**：
- USDT（Tether）
- USDC（USD Coin）
- DAI（Dai Stablecoin）
- WETH（Wrapped Ether）
- 以及數千種其他代幣...

## 操作

### Get Balance（取得餘額）

取得地址的代幣餘額。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **Owner Address**（所有者地址）（必需）：要檢查餘額的地址
- **Format Decimals**（格式化小數）（可選）：使用代幣小數格式化輸出（預設：true）

**範例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "formatDecimals": true
}
```

**輸出**：
```json
{
  "balance": "1000.50",
  "decimals": 6,
  "rawBalance": "1000500000"
}
```

### Transfer（轉帳）

將代幣轉移到另一個地址。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **To**（接收者）（必需）：接收者地址
- **Amount**（數量）（必需）：要轉帳的數量（以代幣單位表示，將使用小數進行轉換）

**範例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100.5"
}
```

**輸出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}
```

### Approve（授權）

授權另一個地址代表您花費代幣。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **Spender**（花費者）（必需）：要授權的地址
- **Amount**（數量）（必需）：要授權的數量（使用 "unlimited" 取得最大授權）

**使用場景**：
- 授權 DEX 合約交換代幣
- 授權質押合約存入代幣
- 為合約設定支出限制

**範例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  "amount": "unlimited"
}
```

### Transfer From（從...轉帳）

使用授權轉移代幣（需要事先授權）。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **From**（來源）（必需）：轉帳來源地址
- **To**（接收者）（必需）：接收者地址
- **Amount**（數量）（必需）：要轉帳的數量

**使用場景**：
- 拉取支付
- 基於合約的代幣轉帳
- 自動支付系統

### Get Allowance（取得授權額度）

檢查花費者被允許代表所有者花費多少。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **Owner**（所有者）（必需）：代幣所有者地址
- **Spender**（花費者）（必需）：花費者地址
- **Format Decimals**（格式化小數）（可選）：使用代幣小數格式化輸出

**範例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d"
}
```

### Get Total Supply（取得總供應量）

取得代幣的總供應量。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址
- **Format Decimals**（格式化小數）（可選）：使用代幣小數格式化輸出

### Get Decimals（取得小數位數）

取得代幣使用的小數位數。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址

**輸出**：
```json
{
  "decimals": 6
}
```

### Get Name（取得名稱）

取得代幣名稱。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址

**輸出**：
```json
{
  "name": "USD Coin"
}
```

### Get Symbol（取得符號）

取得代幣符號。

**所需憑證**：Ethereum RPC

**參數**：
- **Token Address**（代幣地址）（必需）：ERC20 代幣合約地址

**輸出**：
```json
{
  "symbol": "USDC"
}
```

## 常見使用場景

### 監控代幣餘額

```
[Schedule Trigger] → [ERC20: Get Balance] → [Check Threshold] → [Alert]
```

### 自動代幣轉帳

```
[Trigger] → [ERC20: Transfer] → [Wait For Transaction] → [Notification]
```

### 授權並存入 DeFi

```
[Trigger] → [ERC20: Approve] → [Wait] → [Contract: Write - Deposit] → [Wait]
```

### 在 Transfer From 之前檢查授權額度

```
[Trigger] → [ERC20: Get Allowance] → [Conditional] → [ERC20: Transfer From]
```

## 常見代幣地址

### 以太坊主網

- **USDT**：`0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC**：`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **DAI**：`0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **WETH**：`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Polygon

- **USDT**：`0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **USDC**：`0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **WMATIC**：`0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`

## 提示

- **小數位數**：大多數代幣使用 18 位小數，但有些（如 USDC、USDT）使用 6 位
- **格式化小數**：啟用此選項以取得人類可讀的數量
- **無限授權**：使用 "unlimited" 作為數量以授權最大 uint256
- **檢查餘額**：在轉帳前始終檢查餘額
- **Gas 成本**：代幣轉帳比 ETH 轉帳消耗更多 Gas
- **授權模式**：大多數 DeFi 互動需要 授權 → 互動 模式
- **代幣地址**：始終在 Etherscan 或官方來源驗證代幣地址
