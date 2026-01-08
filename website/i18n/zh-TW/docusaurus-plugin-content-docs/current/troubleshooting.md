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

### 錯誤：「RPC provider limit exceeded: Query returned more than X results」（RPC 提供者限制超出：查詢返回超過 X 個結果）

**原因：** 您的 getLogs 查詢返回太多結果。大多數 RPC 提供者將結果限制在 10,000 個日誌。

**解決方法：**
1. **減少區塊範圍：**
   ```
   原本：fromBlock=1000000, toBlock=1100000  (100,000 個區塊)
   改為：fromBlock=1000000, toBlock=1010000  (10,000 個區塊)
   ```

2. **添加事件過濾器：**
   使用索引事件參數來過濾結果：
   ```json
   {
     "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   }
   ```

3. **分割為多個查詢：**
   將查詢分割成較小的區塊範圍，然後合併結果。

### 錯誤：「RPC provider error: Block range is too large」（RPC 提供者錯誤：區塊範圍太大）

**原因：** RPC 提供者有最大區塊範圍限制。

**解決方法：**
1. 查看您的 RPC 提供者文件了解限制
2. 常見限制：
   - Infura：10,000 個區塊
   - Alchemy：getLogs 為 2,000 個區塊
   - 公共 RPC：通常為 1,000-5,000 個區塊

3. 將查詢分割成較小的範圍：
   ```
   查詢 1：區塊 1000000-1005000
   查詢 2：區塊 1005001-1010000
   查詢 3：區塊 1010001-1015000
   ```

### 錯誤：「RPC provider rate limit exceeded」（RPC 提供者速率限制超出）

**原因：** 您在短時間內發出了太多請求。

**解決方法：**
1. 等待片刻後重試
2. 降低請求頻率
3. 考慮升級到付費 RPC 方案
4. 使用不同的 RPC 端點

### 錯誤：「RPC request timed out」（RPC 請求超時）

**原因：** 查詢執行時間太長。

**解決方法：**
1. 減少區塊範圍
2. 添加更具體的過濾器
3. 使用更快的 RPC 端點
4. 檢查您的 RPC 端點是否有問題

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
