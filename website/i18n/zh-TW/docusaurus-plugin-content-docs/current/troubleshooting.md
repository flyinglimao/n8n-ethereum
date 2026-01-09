# 錯誤排除

本指南幫助您解決使用 n8n-ethereum 時的常見錯誤。

## 目錄

- [JSON 解析錯誤](#json-解析錯誤)
- [ABI 錯誤](#abi-錯誤)
- [合約地址錯誤](#合約地址錯誤)
- [RPC 錯誤](#rpc-錯誤)
- [找不到函數/事件](#找不到函數事件)
- [交易錯誤](#交易錯誤)

---

## JSON 解析錯誤

### 錯誤：「contains invalid JSON syntax」（包含無效的 JSON 語法）

**原因：** 您提供的 JSON 有語法錯誤。

**常見錯誤：**
- 缺少或多餘的逗號
- 屬性名稱沒有使用引號（必須使用 `"key": value`）
- 使用單引號而非雙引號
- 結尾有多餘的逗號

**錯誤的 JSON 範例：**
```json
{
  name: "value",        // ❌ 屬性名稱沒有引號
  'age': 25,            // ❌ 使用單引號
  items: [1, 2, 3,]     // ❌ 結尾多餘的逗號
}
```

**正確的 JSON：**
```json
{
  "name": "value",
  "age": 25,
  "items": [1, 2, 3]
}
```

**解決方法：**
1. 使用 JSON 驗證工具，如 [jsonlint.com](https://jsonlint.com)
2. 確保所有屬性名稱都使用雙引號
3. 字串使用雙引號
4. 移除結尾的逗號

### 錯誤：「is incomplete」（不完整）

**原因：** 缺少右括號 `]` 或右大括號 `}`。

**解決方法：**
檢查每個左括號/左大括號都有對應的右括號/右大括號：
- `[` 必須有 `]`
- `{` 必須有 `}`

### 錯誤：「contains extra characters after the JSON value」（JSON 值後有額外字符）

**原因：** JSON 後面出現不應該存在的文字。

**範例：**
```
[{"type": "function"}] 多餘的文字
```

**解決方法：**
移除右括號 `]` 或右大括號 `}` 後的所有文字。

---

## ABI 錯誤

### 錯誤：「ABI must be an array」（ABI 必須是陣列）

**原因：** ABI 應該是 JSON 陣列，而非物件或字串。

**錯誤：**
```json
{
  "type": "function",
  "name": "transfer"
}
```

**正確：**
```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [...]
  }
]
```

### 錯誤：「ABI cannot be empty」（ABI 不能為空）

**原因：** 您提供了空陣列 `[]`。

**解決方法：**
在 ABI 中至少提供一個函數或事件定義。

### 錯誤：「ABI[0] has invalid type」（ABI[0] 有無效的類型）

**原因：** ABI 項目的 `type` 欄位不被識別。

**有效類型：**
- `function`（函數）
- `event`（事件）
- `constructor`（建構函數）
- `fallback`（回退函數）
- `receive`（接收函數）
- `error`（錯誤）

**範例：**
```json
[
  {
    "type": "function",      // ✅ 有效
    "name": "transfer",
    "inputs": []
  },
  {
    "type": "event",         // ✅ 有效
    "name": "Transfer",
    "inputs": []
  }
]
```

### 錯誤：「ABI[0] of type 'function' is missing 'name' property」（類型為 'function' 的 ABI[0] 缺少 'name' 屬性）

**原因：** 函數和事件必須有 `name` 欄位。

**解決方法：**
添加 `name` 屬性：
```json
{
  "type": "function",
  "name": "transfer",        // ✅ 添加這個
  "inputs": []
}
```

---

## 合約地址錯誤

### 錯誤：「Address must start with '0x'」（地址必須以 '0x' 開頭）

**原因：** 以太坊地址必須以 `0x` 開頭。

**錯誤：**
```
742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**正確：**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### 錯誤：「Address must be 42 characters long」（地址必須是 42 個字元）

**原因：** 以太坊地址正好是 42 個字元：`0x` + 40 個十六進位字元。

**解決方法：**
檢查您的地址：
- 太短：可能缺少字元
- 太長：可能有多餘的空格或字元

### 錯誤：「Address contains invalid characters」（地址包含無效字元）

**原因：** 地址包含 0-9、a-f、A-F 以外的字元。

**解決方法：**
確保地址在 `0x` 前綴後只包含十六進位字元（0-9、a-f、A-F）。

---

## RPC 錯誤

### 理解 RPC 錯誤訊息

當發生 RPC 錯誤時，n8n-ethereum 現在會顯示完整的錯誤資訊：

```
RPC Error: [RPC 提供者的錯誤訊息]

RPC Response: [提供者的詳細錯誤]

Request Context: {
  "method": "eth_getLogs",
  "params": {
    "address": "0x...",
    "eventName": "Transfer",
    "fromBlock": "1000000",
    "toBlock": "1100000",
    "blockRange": "100000"
  }
}
```

這幫助您了解：
1. **發生了什麼** - RPC 提供者的錯誤訊息
2. **您請求了什麼** - 發送到 RPC 的確切參數
3. **如何修復** - 將您的請求與提供者限制進行比較

### 常見 RPC 問題

#### 結果太多

**錯誤模式：**
```
RPC Response: "query returned more than 10000 results"
```

**原因：** 您的查詢返回了太多日誌。

**解決方法：** 檢查錯誤上下文中的 `blockRange` 並減少它：
```
如果 blockRange 是 100000，嘗試減少到 10000 或更少
```

#### 區塊範圍太大

**錯誤模式：**
```
RPC Response: "block range is too large"
RPC Response: "Log response size exceeded"
```

**原因：** RPC 提供者限制區塊範圍。

**解決方法：** 檢查提供者特定的限制：
- **Infura：** getLogs 為 10,000 個區塊
- **Alchemy：** getLogs 為 2,000 個區塊
- **公共 RPC：** 通常為 1,000-5,000 個區塊

根據錯誤將查詢分割成較小的範圍。

#### 速率限制

**錯誤模式：**
```
RPC Response: "rate limit exceeded"
RPC Response: "too many requests"
```

**解決方法：**
1. 等待後重試
2. 降低請求頻率
3. 升級到付費 RPC 方案
4. 使用不同的 RPC 端點

#### 超時

**錯誤模式：**
```
RPC Response: "timeout"
RPC Response: "request timed out"
```

**解決方法：**
1. 減少請求上下文中顯示的區塊範圍
2. 添加更具體的事件過濾器
3. 使用更快的 RPC 端點
4. 檢查 RPC 端點狀態

---

## 找不到函數/事件

### 錯誤：「Function 'transfer' not found in ABI」（在 ABI 中找不到函數 'transfer'）

**原因：** 函數名稱在您的 ABI 中不存在，或者有拼寫錯誤。

**解決方法：**
1. 檢查函數名稱拼寫
2. 驗證您的 ABI 包含該函數：
   ```json
   [
     {
       "type": "function",
       "name": "transfer",    // 必須完全匹配
       "inputs": [...]
     }
   ]
   ```
3. 錯誤訊息會顯示可用的函數

### 錯誤：「Event 'Transfer' not found in ABI」（在 ABI 中找不到事件 'Transfer'）

**原因：** 事件名稱在您的 ABI 中不存在。

**解決方法：**
1. 檢查事件名稱拼寫（區分大小寫）
2. 驗證您的 ABI 包含該事件：
   ```json
   [
     {
       "type": "event",
       "name": "Transfer",    // 必須完全匹配
       "inputs": [...]
     }
   ]
   ```

---

## 交易錯誤

### 錯誤：「Contract reverted: [原因]」（合約回退）

**原因：** 合約拒絕了您的交易。

**解決方法：**
1. 閱讀錯誤訊息中的回退原因
2. 常見原因：
   - 餘額不足
   - 授權額度不足（對於代幣）
   - 無效的參數
   - 存取控制（例如："Ownable: caller is not the owner"）
3. 檢查您的交易參數
4. 驗證您有權限呼叫此函數

### 錯誤：「Gas estimation failed」（Gas 估算失敗）

**原因：** 交易會失敗，因此 gas 估算失敗。

**解決方法：**
1. 檢查錯誤訊息中的回退原因
2. 驗證您的交易參數正確
3. 確保您有足夠的代幣餘額
4. 檢查合約是否有任何限制

### 錯誤：「Insufficient funds」（資金不足）

**原因：** 您的帳戶沒有足夠的 ETH。

**解決方法：**
1. 檢查您的帳戶餘額
2. 確保您有足夠的 ETH 用於：
   - 交易金額
   - Gas 費用
3. 向您的帳戶添加更多 ETH

---

## 獲取幫助

如果您仍然遇到問題：

1. **仔細檢查錯誤訊息** - 改進後的錯誤訊息現在提供具體的指導
2. **訪問我們的 GitHub Issues** - [github.com/flyinglimao/n8n-ethereum/issues](https://github.com/flyinglimao/n8n-ethereum/issues)
3. **查看文件** - [flyinglimao.github.io/n8n-ethereum](https://flyinglimao.github.io/n8n-ethereum)

報告問題時，請包括：
- 完整的錯誤訊息
- 您的節點配置（移除敏感資料）
- 您嘗試執行的操作
