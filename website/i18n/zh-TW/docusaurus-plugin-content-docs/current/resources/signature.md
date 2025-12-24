---
sidebar_position: 10
---

# Signature（簽名）

Signature 資源提供簽名和驗證訊息和類型化資料的操作。

## 概述

數位簽名用於證明地址的所有權並在不洩露私鑰的情況下驗證訊息。

## 操作

### Sign Message（簽名訊息）

使用您的錢包簽署個人訊息。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Message**（訊息）（必需）：要簽署的訊息

**使用場景**：
- 驗證用戶
- 證明地址所有權
- 簽署鏈下訊息

**範例**：
```json
{
  "message": "I agree to the terms and conditions"
}
```

**輸出**：
```json
{
  "signature": "0x1234567890abcdef..."
}
```

### Sign Typed Data（簽名類型化資料）

根據 EIP-712 簽署結構化資料。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（類型）（必需）：類型定義
- **Value**（值）（必需）：要簽署的資料

**使用場景**：
- 簽署 permit 交易（無 Gas 批准）
- 為 dApp 簽署結構化訊息
- 為複雜資料創建可驗證簽名

### Verify Message（驗證訊息）

驗證個人訊息簽名。

**所需憑證**：Ethereum RPC

**參數**：
- **Message**（訊息）（必需）：原始訊息
- **Signature**（簽名）（必需）：要驗證的簽名
- **Address**（地址）（必需）：預期簽名者地址

**輸出範例**：
```json
{
  "valid": true,
  "recoveredAddress": "0x..."
}
```

### Verify Typed Data（驗證類型化資料）

驗證 EIP-712 簽名。

**所需憑證**：Ethereum RPC

**參數**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（類型）（必需）：類型定義
- **Value**（值）（必需）：原始資料
- **Signature**（簽名）（必需）：要驗證的簽名
- **Address**（地址）（必需）：預期簽名者地址

### Recover Address（恢復地址）

從簽名中恢復簽名者地址。

**所需憑證**：Ethereum RPC

**參數**：
- **Message**（訊息）（必需）：原始訊息
- **Signature**（簽名）（必需）：簽名

**輸出範例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Hash Message（雜湊訊息）

計算訊息的 keccak256 雜湊。

**所需憑證**：Ethereum RPC

**參數**：
- **Message**（訊息）（必需）：要雜湊的訊息

**輸出範例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

### Hash Typed Data（雜湊類型化資料）

雜湊類型化資料以進行簽名（EIP-712）。

**所需憑證**：Ethereum RPC

**參數**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（類型）（必需）：類型定義
- **Value**（值）（必需）：要雜湊的資料

## 常見使用場景

### 用戶驗證

```
[Trigger] → [Sign Message] → [Verify Message] → [驗證用戶]
```

### 無 Gas 批准（EIP-2612）

```
[Trigger] → [Sign Typed Data: Permit] → [提交到合約] → [代幣已批准]
```

### 驗證所有權

```
[用戶輸入] → [Recover Address] → [檢查所有權] → [授予存取權限]
```

## EIP-712 域範例

```json
{
  "name": "MyDApp",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0x..."
}
```

## 提示

- **個人簽名**：使用 Sign Message 進行簡單文字驗證
- **EIP-712**：用於需要人類可讀的結構化資料
- **安全性**：切勿簽署您不理解的訊息
- **驗證**：在信任簽名之前始終驗證它們
- **恢復**：Recover Address 可以識別誰簽署了訊息
- **鏈 ID**：在 EIP-712 中包含鏈 ID 以防止重放攻擊
