---
sidebar_position: 12
---

# 自定義 RPC

自定義 RPC 資源允許您直接向以太坊節點發送原始 RPC 請求，使您能夠訪問任何 RPC 方法，包括標準方法、擴展方法或其他資源未涵蓋的自定義方法。

## 操作

### Request（請求）

使用任何方法和參數發送自定義 RPC 請求。

**必需憑證**：Ethereum RPC

**參數**：
- **RPC Method**（RPC 方法）（必填）：RPC 方法名稱（例如 `eth_getBalance`、`debug_traceTransaction`）
- **RPC Parameters**（RPC 參數）（選填）：RPC 方法的參數，格式為 JSON 陣列

**範例 - 獲取餘額**：
```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]
}
```

**輸出**：
```json
{
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"],
  "result": "0x1bc16d674ec80000"
}
```

**範例 - 獲取儲存槽**：
```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"]
}
```

**輸出**：
```json
{
  "method": "eth_getStorageAt",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"],
  "result": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

## 常見用例

### 調試交易

使用調試 RPC 方法追蹤交易執行：

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": ["0x123...", {"tracer": "callTracer"}]
}
```

### 訪問歷史數據

從歸檔節點查詢歷史狀態數據：

```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x1"]
}
```

### 使用自定義方法

訪問節點特定或自定義 RPC 方法：

```json
{
  "rpcMethod": "eth_feeHistory",
  "rpcParams": [4, "latest", [25, 50, 75]]
}
```

### 獲取儲存槽

從合約中讀取特定的儲存槽：

```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0xContractAddress", "0x0", "latest"]
}
```

## 支援的 RPC 方法

### 標準以太坊方法

- **eth_getBalance**：獲取帳戶餘額
- **eth_getStorageAt**：獲取指定位置的儲存值
- **eth_getTransactionCount**：獲取交易計數（nonce）
- **eth_getCode**：獲取合約程式碼
- **eth_call**：執行合約調用
- **eth_estimateGas**：估算 gas 使用量
- **eth_getBlockByNumber**：透過區塊號獲取區塊
- **eth_getBlockByHash**：透過區塊雜湊獲取區塊
- **eth_getTransactionByHash**：透過雜湊獲取交易
- **eth_getTransactionReceipt**：獲取交易收據
- **eth_getLogs**：獲取事件日誌
- **eth_gasPrice**：獲取當前 gas 價格
- **eth_feeHistory**：獲取歷史手續費數據
- **eth_getProof**：獲取 Merkle 證明

### 調試方法（Geth）

- **debug_traceTransaction**：追蹤交易執行
- **debug_traceCall**：追蹤調用執行
- **debug_traceBlockByNumber**：追蹤區塊中的所有交易
- **debug_traceBlockByHash**：透過雜湊追蹤區塊

### 追蹤方法（Parity/OpenEthereum）

- **trace_transaction**：追蹤交易
- **trace_block**：追蹤區塊
- **trace_replayTransaction**：重放交易
- **trace_call**：追蹤調用

### 自定義方法

- 您的以太坊節點公開的任何自定義 RPC 方法
- 網路特定方法（例如 Arbitrum、Optimism 擴展）
- 自定義索引器或中間件方法

## 範例

### 範例 1：獲取區塊交易數量

```json
{
  "rpcMethod": "eth_getBlockTransactionCountByNumber",
  "rpcParams": ["latest"]
}
```

### 範例 2：使用調用追蹤器追蹤交易

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": [
    "0x1234567890abcdef...",
    {
      "tracer": "callTracer",
      "tracerConfig": {
        "onlyTopCall": false
      }
    }
  ]
}
```

### 範例 3：獲取證明

```json
{
  "rpcMethod": "eth_getProof",
  "rpcParams": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    ["0x0"],
    "latest"
  ]
}
```

### 範例 4：批次處理多個調用

您可以使用 n8n 的批次處理功能按順序發送多個 RPC 請求：

```
輸入項目 → 自定義 RPC（多個方法）→ 處理結果
```

## 提示

- **方法名稱**：使用以太坊 JSON-RPC 規範中指定的確切 RPC 方法名稱
- **參數**：始終以 JSON 陣列格式提供參數，即使只有單個參數
- **節點支援**：並非所有節點都支援所有方法（例如調試方法需要完整節點）
- **歸檔節點**：歷史狀態查詢需要歸檔節點
- **自定義標頭**：使用 RPC 憑證設定自定義標頭以進行身份驗證
- **錯誤處理**：啟用「失敗時繼續」以優雅地處理不支援的方法
- **速率限制**：發送多個請求時請注意 RPC 提供商的速率限制

## 何時使用自定義 RPC

當您需要以下功能時使用自定義 RPC：

- 訪問其他資源中不可用的方法
- 使用調試或追蹤方法進行交易分析
- 使用特定區塊參數查詢歷史狀態數據
- 訪問節點特定或網路特定的 RPC 方法
- 在專用資源支援之前原型化新功能
- 使用自定義或擴展的 RPC API

對於標準操作，建議使用專用資源（Account、Block、Transaction 等），因為它們提供更好的類型安全性和參數驗證。
