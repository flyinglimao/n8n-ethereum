---
sidebar_position: 6
---

# Gas

Gas 資源提供查詢 Gas 價格和費用資訊的操作。

## 操作

### Get Gas Price（取得 Gas 價格）

檢索當前的傳統 Gas 價格。

**所需憑證**：Ethereum RPC

**參數**：無

**輸出範例**：
```json
{
  "gasPrice": "20000000000"
}
```

### Get Fee History（取得費用歷史）

分析歷史費用資料以優化 EIP-1559。

**所需憑證**：Ethereum RPC

**參數**：
- **Block Count**（區塊數）（必需）：要查詢的區塊數
- **Newest Block**（最新區塊）（可選）：起始區塊（預設：latest）
- **Reward Percentiles**（獎勵百分位數）（可選）：要計算的百分位數陣列

**使用場景**：
- 優化 EIP-1559 Gas 費用
- 分析費用趨勢
- 預測最佳交易時機

**範例**：
```json
{
  "blockCount": 10,
  "rewardPercentiles": [25, 50, 75]
}
```

### Estimate Max Priority Fee（估算最大優先費用）

估算交易的最大優先費用。

**所需憑證**：Ethereum RPC

**參數**：無

**輸出範例**：
```json
{
  "maxPriorityFeePerGas": "2000000000"
}
```

## 常見使用場景

### 動態費用計算

```
[Trigger] → [Get Fee History] → [計算最佳費用] → [發送交易]
```

### Gas 價格監控

```
[Schedule Trigger] → [Get Gas Price] → [檢查閾值] → [警報]
```

## 提示

- **EIP-1559**：大多數現代網路使用 EIP-1559 定價（基礎費用 + 優先費用）
- **傳統 Gas**：某些網路仍使用傳統 Gas 定價
- **費用歷史**：用於根據網路狀況智慧估算費用
- **網路擁塞**：高網路使用期間費用會增加
