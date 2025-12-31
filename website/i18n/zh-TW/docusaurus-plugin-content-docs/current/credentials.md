---
sidebar_position: 3
---

# 憑證

要使用以太坊節點，您需要設定兩種類型的憑證：**Ethereum RPC**（必需）和 **Ethereum Account**（可選，僅用於寫入操作）。

## Ethereum RPC 憑證

Ethereum RPC 憑證用於連接至以太坊節點。此憑證對於所有操作都是**必需的**。

### 設定步驟：

1. **導覽至憑證**
   - 在 n8n 中，進入 **憑證** → **新建** → 搜尋 "Ethereum RPC"

2. **輸入 RPC URL**（必填）
   - 提供您以太坊節點的 HTTP(S) 或 WebSocket 端點
   - 您必須明確提供 RPC 端點 URL
   - 範例：
     - Infura: `https://mainnet.infura.io/v3/YOUR-API-KEY`
     - Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
     - QuickNode: `https://YOUR-ENDPOINT.quiknode.pro/YOUR-API-KEY/`
     - 公共 RPC: `https://eth.llamarpc.com`（不建議用於生產環境）

3. **自訂請求標頭**（可選）
   - 如果您的 RPC 提供商需要，新增身份驗證標頭
   - 格式：JSON 物件
   - 範例：`{"Authorization": "Bearer YOUR-TOKEN"}`

4. **區塊限制**（可選）
   - 單次請求中查詢的最大區塊數（預設：1000）
   - 用於防止查詢大範圍區塊時逾時

### 推薦的 RPC 提供商：

| 提供商 | 免費額度 | 備註 |
|--------|----------|------|
| [Infura](https://infura.io/) | 每天 100,000 次請求 | 可靠，廣泛使用 |
| [Alchemy](https://www.alchemy.com/) | 每月 3 億計算單位 | 進階功能，文件完善 |
| [QuickNode](https://www.quicknode.com/) | 有限免費試用 | 快速，支援多鏈 |
| [Ankr](https://www.ankr.com/) | 公共端點 | 免費但有速率限制 |
| [LlamaNodes](https://llamanodes.com/) | 公共端點 | 社群運行 |

### 設定範例：

```json
{
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR-API-KEY",
  "customHeaders": {},
  "blockLimit": 1000
}
```

## Ethereum Account 憑證

Ethereum Account 憑證包含您錢包的私鑰或助記詞。此憑證是**可選的**，僅在以下情況下需要：

- 傳送交易
- 寫入智慧合約
- 簽名訊息
- 任何需要錢包簽名的操作

:::caution 安全警告
切勿分享您的私鑰或助記詞。請將這些憑證安全地儲存在 n8n 的憑證系統中。在生產環境中，建議使用資金有限的專用錢包。
:::

### 設定步驟：

1. **導覽至憑證**
   - 在 n8n 中，進入 **憑證** → **新建** → 搜尋 "Ethereum Account"

2. **選擇身份驗證方法**
   - 您可以使用 **Private Key**（私鑰）或 **Mnemonic Phrase**（助記詞）（二選一）

3. **選項 A：私鑰**
   - 輸入您錢包的私鑰（64 個十六進位字元）
   - 可以以 `0x` 開頭或不以 `0x` 開頭
   - 範例：`0x1234567890abcdef...`

4. **選項 B：助記詞**
   - 輸入您的 12 或 24 個單詞的助記詞
   - 範例：`word1 word2 word3 ... word12`
   - 設定 **Derivation Path**（衍生路徑）（預設：`m/44'/60'/0'/0/0`）以衍生不同帳戶
   - 可選設定 **Passphrase**（密碼短語）以增加 BIP-39 安全性

### 安全最佳實務：

1. **使用專用錢包**
   - 專門為 n8n 自動化建立一個獨立的錢包
   - 只為操作所需的金額充值

2. **先在測試網測試**
   - 在使用主網之前，始終在測試網（Sepolia、Goerli）上測試您的工作流程
   - 測試網 ETH 可從水龍頭免費取得

3. **監控活動**
   - 定期檢查錢包交易
   - 為意外活動設定警報

4. **限制權限**
   - 只為需要的使用者提供 n8n 憑證存取權限
   - 謹慎使用 n8n 的憑證共用功能

### 何時需要此憑證？

**需要用於：**
- Transaction → Send Transaction（傳送交易）
- Contract → Write Contract（寫入合約）
- Contract → Deploy Contract（部署合約）
- ERC20 → Transfer、Approve、Transfer From
- ERC721 → Transfer From、Safe Transfer From、Approve、Set Approval For All
- ERC1155 → Safe Transfer From、Safe Batch Transfer From、Set Approval For All
- Signature → Sign Message、Sign Typed Data

**不需要用於：**
- Account → Get Balance、Get Transaction Count、Get Code
- Block → Get Block、Get Block Number
- Transaction → Get Transaction、Get Transaction Receipt、Estimate Gas
- Contract → Read Contract、Multicall、Simulate Contract、Get Logs
- ERC20 → Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol
- ERC721 → Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI
- ERC1155 → Balance Of、Balance Of Batch、Is Approved For All、URI
- ENS → 所有操作
- Gas → 所有操作
- Utils → 所有操作

### 設定範例：

**使用私鑰：**
```json
{
  "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**使用助記詞：**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "path": "m/44'/60'/0'/0/0",
  "passphrase": ""
}
```

**使用自定義路徑的助記詞：**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "path": "m/44'/60'/1'/0/0"
}
```

## 測試您的憑證

設定憑證後，測試它們：

1. **測試 RPC 連接**
   - 建立一個包含以太坊節點的工作流程
   - 選擇資源：**Block** → 操作：**Get Block Number**
   - 選擇您的 RPC 憑證
   - 執行節點
   - 您應該取得目前區塊號

2. **測試帳戶憑證**（如果已設定）
   - 選擇資源：**Account** → 操作：**Get Balance**
   - 將地址留空（使用憑證的錢包地址）
   - 選擇 RPC 和 Account 憑證
   - 執行節點
   - 您應該看到您錢包的餘額

## 疑難排解

### RPC 連接問題

- **無效的 RPC URL**：驗證 URL 是否正確並包含協定（https://）
- **速率限制**：您可能已超過提供商的速率限制
- **防火牆/代理**：檢查您的網路是否允許連接至 RPC 端點
- **錯誤的網路**：確保您的 RPC 端點指向正確的網路（主網、測試網等）

### 帳戶憑證問題

- **無效的私鑰**：確保它是 64 個十六進位字元（有或沒有 0x）
- **無效的助記詞**：驗證所有單詞拼寫正確且順序正確
- **錯誤的帳戶**：如果使用助記詞，嘗試不同的帳戶索引

## 下一步

設定憑證後，探索[可用資源](resources/overview)以開始建置工作流程。
