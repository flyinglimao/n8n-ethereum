---
sidebar_position: 2
---

# Account（帳戶）

Account 資源提供查詢以太坊帳戶（地址）資訊的操作。

## 操作

### Get Current Address（取得目前地址）

從 Account 憑證取得目前連接的錢包地址。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：無

**使用場景**：
- 識別正在使用的錢包地址
- 顯示目前帳戶資訊
- 驗證連接的是哪個帳戶

**範例輸出**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Get Balance（取得餘額）

檢索帳戶的原生代幣餘額（ETH）。

**所需憑證**：Ethereum RPC

**參數**：
- **Address**（地址）（可選）：要查詢的以太坊地址。如果未提供，使用 Account 憑證中的錢包地址
- **Format**（格式）：選擇輸出格式
  - `wei`：wei 單位的原始餘額（預設）
  - `gwei`：gwei 單位的餘額（1 gwei = 10^9 wei）
  - `ether`：ether 單位的餘額（1 ether = 10^18 wei）
- **Block**（區塊）：要查詢的區塊號（預設：latest）

**範例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "format": "ether"
}
```

**輸出**：
```json
{
  "balance": "1.234567890123456789"
}
```

### Get Transaction Count（取得交易計數）

取得從帳戶傳送的交易數量（也稱為 nonce）。

**所需憑證**：Ethereum RPC

**參數**：
- **Address**（地址）（可選）：要查詢的以太坊地址。如果未提供，使用 Account 憑證中的錢包地址
- **Block**（區塊）：要查詢的區塊號（預設：latest）

**使用場景**：
- 確定傳送交易的下一個 nonce
- 檢查帳戶傳送了多少交易
- 驗證帳戶活動

**範例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**輸出**：
```json
{
  "transactionCount": 42
}
```

### Get Code（取得程式碼）

檢索儲存在地址上的字節碼。如果地址不是合約，則返回空。

**所需憑證**：Ethereum RPC

**參數**：
- **Address**（地址）（必需）：要查詢的以太坊地址
- **Block**（區塊）：要查詢的區塊號（預設：latest）

**使用場景**：
- 檢查地址是否為智慧合約
- 檢索合約字節碼以進行驗證
- 驗證合約部署

**範例**：
```json
{
  "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

**輸出**：
```json
{
  "code": "0x608060405234801561001057600080fd5b50..."
}
```

如果不是合約：
```json
{
  "code": "0x"
}
```

## 常見使用場景

### 檢查錢包餘額

在執行交易之前監控您的錢包餘額：

```
[Schedule Trigger] → [Ethereum: Account - Get Balance] → [Condition] → [Alert if Low]
```

### 驗證合約部署

檢查合約是否成功部署：

```
[Deploy Contract] → [Wait For Transaction] → [Get Code] → [Verify Code Exists]
```

### 取得交易的下一個 Nonce

在傳送交易之前檢索正確的 nonce：

```
[Trigger] → [Get Transaction Count] → [Use in Send Transaction]
```

## 提示

- **地址格式**：所有地址應為有效的以太坊地址（0x 後跟 40 個十六進位字元）
- **可選地址**：未提供地址時，節點使用 Account 憑證中的錢包地址
- **餘額格式**：使用 `ether` 格式取得人類可讀的餘額，使用 `wei` 進行精確計算
- **合約檢測**：如果 `getCode` 返回非空值（不是 "0x"），則地址為合約
