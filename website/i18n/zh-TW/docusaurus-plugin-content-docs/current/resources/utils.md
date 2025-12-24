---
sidebar_position: 11
---

# Utils（工具）

Utils 資源提供格式化、編碼、驗證和其他輔助操作的實用函數。

## 操作

### Format Units（格式化單位）

將 wei 轉換為人類可讀的格式。

**所需憑證**：Ethereum RPC

**參數**：
- **Value**（值）（必需）：wei 單位的值
- **Decimals**（小數位數）（可選）：小數位數（預設：18）

**範例**：
```json
{
  "value": "1000000000000000000",
  "decimals": 18
}
```

**輸出**：
```json
{
  "formatted": "1.0"
}
```

### Parse Units（解析單位）

將人類可讀的格式轉換為 wei。

**所需憑證**：Ethereum RPC

**參數**：
- **Value**（值）（必需）：人類可讀的值
- **Decimals**（小數位數）（可選）：小數位數（預設：18）

**範例**：
```json
{
  "value": "1.5",
  "decimals": 18
}
```

**輸出**：
```json
{
  "parsed": "1500000000000000000"
}
```

### Get Chain ID（取得鏈 ID）

檢索當前鏈識別符。

**所需憑證**：Ethereum RPC

**參數**：無

**輸出範例**：
```json
{
  "chainId": 1
}
```

**常見鏈 ID**：
- `1`：以太坊主網
- `5`：Goerli 測試網
- `11155111`：Sepolia 測試網
- `137`：Polygon 主網
- `56`：BNB 智能鏈
- `42161`：Arbitrum One
- `10`：Optimism

### Validate Address（驗證地址）

驗證並校驗和以太坊地址。

**所需憑證**：Ethereum RPC

**參數**：
- **Address**（地址）（必需）：要驗證的地址

**範例**：
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

**輸出**：
```json
{
  "valid": true,
  "checksummed": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Encode Function Data（編碼函數資料）

從 ABI 編碼函數呼叫資料。

**所需憑證**：Ethereum RPC

**參數**：
- **ABI**（必需）：函數 ABI
- **Function Name**（函數名稱）（必需）：函數名稱
- **Arguments**（參數）（可選）：函數參數

**使用場景**：
- 準備交易資料
- 創建 multicall 負載
- 編碼合約互動

### Decode Function Data（解碼函數資料）

使用 ABI 解碼函數呼叫資料。

**所需憑證**：Ethereum RPC

**參數**：
- **ABI**（必需）：函數 ABI
- **Data**（資料）（必需）：要解碼的編碼資料

**使用場景**：
- 分析交易輸入
- 除錯合約呼叫
- 解析交易資料

### Encode Event Topics（編碼事件主題）

為日誌篩選編碼事件主題。

**所需憑證**：Ethereum RPC

**參數**：
- **Event ABI**（事件 ABI）（必需）：事件 ABI
- **Arguments**（參數）（可選）：索引參數

### Decode Event Log（解碼事件日誌）

使用 ABI 解碼事件日誌資料。

**所需憑證**：Ethereum RPC

**參數**：
- **Event ABI**（事件 ABI）（必需）：事件 ABI
- **Topics**（主題）（必需）：日誌主題
- **Data**（資料）（必需）：日誌資料

**使用場景**：
- 解析事件日誌
- 提取事件參數
- 理解發出的事件

### Get Contract Address（取得合約地址）

計算 CREATE 或 CREATE2 部署地址。

**所需憑證**：Ethereum RPC

**參數**：
- **From**（來源）（必需）：部署者地址
- **Nonce**（可選）：交易 nonce（用於 CREATE）
- **Bytecode Hash**（字節碼雜湊）（可選）：字節碼的 Keccak256 雜湊（用於 CREATE2）
- **Salt**（鹽）（可選）：CREATE2 的鹽

**使用場景**：
- 預測合約部署地址
- 驗證部署地址
- 計算 CREATE2 地址

## 常見使用場景

### 格式化代幣數量

```
[Get Balance] → [Format Units] → [顯示給用戶]
```

### 驗證用戶輸入

```
[用戶輸入] → [Validate Address] → [如有效則繼續]
```

### 解碼交易資料

```
[Get Transaction] → [Decode Function Data] → [理解呼叫]
```

### 解析事件日誌

```
[Get Logs] → [Decode Event Log] → [處理事件]
```

## 提示

- **小數位數**：ETH 使用 18 位小數，但代幣可以使用任何數量（通常為 6、8 或 18）
- **校驗和**：始終使用校驗和地址進行顯示
- **鏈 ID**：用於驗證您在正確的網路上
- **編碼**：在發送原始交易之前編碼資料
- **CREATE2**：確定性地址對反事實部署很有用
- **事件解碼**：自動處理索引與非索引參數
