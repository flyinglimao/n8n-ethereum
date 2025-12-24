---
sidebar_position: 3
---

# Block（區塊）

Block 資源提供查詢區塊鏈區塊資訊的操作。

## 操作

### Get Block（取得區塊）

檢索特定區塊的詳細資訊。

**所需憑證**：Ethereum RPC

**參數**：
- **Block Number or Hash**（區塊號或雜湊）（可選）：要查詢的區塊號或雜湊（預設：latest）
- **Include Transactions**（包含交易）（可選）：包含完整交易物件（預設：false）

**範例**：
```json
{
  "blockNumber": "18000000"
}
```

**輸出**：
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

### Get Block Number（取得區塊號）

取得當前區塊鏈高度（最新區塊號）。

**所需憑證**：Ethereum RPC

**參數**：無

**使用場景**：
- 監控區塊鏈進度
- 同步應用程式狀態
- 計算查詢的區塊範圍

**輸出範例**：
```json
{
  "blockNumber": "18500000"
}
```

## 常見使用場景

### 監控新區塊

```
[Schedule Trigger] → [Get Block Number] → [檢查是否變更] → [處理新區塊]
```

### 查詢歷史區塊資料

```
[Trigger] → [Get Block] → [處理區塊資料] → [儲存]
```

## 提示

- **區塊識別符**：可以使用區塊號、區塊雜湊或特殊標籤（latest、earliest、pending）
- **完整交易**：啟用以取得完整交易物件而不是僅雜湊
- **快取**：區塊資料一旦確認就是不可變的，可以安全快取
- **速率限制**：某些 RPC 提供商對包含完整交易的區塊收取更多費用
