---
sidebar_position: 4
---

# Transaction（交易）

Transaction 資源提供發送交易和查詢交易資訊的操作。

## 操作

### Send Transaction（發送交易）

發送原生代幣（ETH）到地址。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **To**（接收者）（必需）：接收者地址
- **Value**（價值）（必需）：要發送的金額（以 ether 為單位）
- **Gas Limit**（Gas 限制）（可選）：使用的最大 Gas（未提供則自動估算）
- **Max Fee Per Gas**（每 Gas 最大費用）（可選）：每 Gas 的最大總費用（EIP-1559）
- **Max Priority Fee Per Gas**（每 Gas 最大優先費用）（可選）：每 Gas 的最大優先費用（EIP-1559）
- **Nonce**（可選）：交易 nonce（未提供則自動計算）
- **Data**（資料）（可選）：交易中包含的額外資料

**範例**：
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**輸出**：
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

通過雜湊檢索交易詳情。

**所需憑證**：Ethereum RPC

**參數**：
- **Transaction Hash**（交易雜湊）（必需）：要查詢的交易雜湊

**範例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**輸出**：
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

### Get Transaction Receipt（取得交易收據）

取得交易收據，包括日誌和狀態。

**所需憑證**：Ethereum RPC

**參數**：
- **Transaction Hash**（交易雜湊）（必需）：要查詢的交易雜湊

**使用場景**：
- 檢查交易是否成功
- 檢索交易發出的事件日誌
- 取得交易使用的 Gas

**範例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

**輸出**：
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

等待交易在區塊鏈上確認。

**所需憑證**：Ethereum RPC

**參數**：
- **Transaction Hash**（交易雜湊）（必需）：要等待的交易雜湊
- **Confirmations**（確認數）（可選）：要等待的確認數（預設：1）
- **Timeout**（逾時）（可選）：等待的最長時間（毫秒）（預設：60000）

**使用場景**：
- 確保交易在繼續之前已確認
- 等待多次確認以提高安全性
- 處理工作流程中的交易時序

**範例**：
```json
{
  "hash": "0x1234567890abcdef...",
  "confirmations": 3,
  "timeout": 120000
}
```

**輸出**：
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

**所需憑證**：Ethereum RPC

**參數**：
- **To**（接收者）（必需）：接收者地址
- **Value**（價值）（可選）：金額（以 ether 為單位）
- **Data**（資料）（可選）：交易資料
- **From**（發送者）（可選）：發送者地址

**使用場景**：
- 發送前計算 Gas 成本
- 優化交易參數
- 預算交易費用

**範例**：
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "value": "0.1"
}
```

**輸出**：
```json
{
  "gasEstimate": "21000",
  "gasEstimateWithBuffer": "25200"
}
```

## 常見使用場景

### 發送 ETH 並等待確認

```
[Trigger] → [Send Transaction] → [Wait For Transaction] → [成功通知]
```

### 檢查交易狀態

```
[帶 TX Hash 的 Trigger] → [Get Transaction Receipt] → [檢查狀態] → [動作]
```

### 發送前估算

```
[Trigger] → [Estimate Gas] → [計算成本] → [條件發送]
```

## EIP-1559 Gas 費用

現代以太坊交易使用 EIP-1559 Gas 定價，包含兩個組成部分：

- **Max Fee Per Gas**：您願意支付的最大總費用
- **Max Priority Fee Per Gas**：給礦工/驗證者的小費

如果未指定，這些會根據當前網路狀況自動計算。

## 提示

- **Gas 估算**：發送前始終估算 Gas 以避免失敗
- **確認數**：對於高價值交易，等待多次確認（3-6 次）
- **逾時**：網路擁塞期間增加逾時
- **交易狀態**：在假設成功之前始終檢查收據狀態
- **Nonce 管理**：除非需要特定順序，否則讓節點自動計算 nonce
- **價值格式**：價值以 ether 指定，而不是 wei
