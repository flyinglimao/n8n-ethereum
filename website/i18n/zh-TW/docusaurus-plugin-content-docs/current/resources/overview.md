---
sidebar_position: 1
---

# 資源概覽

以太坊節點提供對各種區塊鏈資源的存取。每個資源包含用於與以太坊區塊鏈不同層面互動的特定操作。

## 可用資源

### 核心區塊鏈資源

- **[Account](account)**（帳戶）：查詢帳戶餘額、交易計數和合約程式碼
- **[Block](block)**（區塊）：檢索區塊資訊和目前區塊鏈高度
- **[Transaction](transaction)**（交易）：傳送交易、檢查狀態和估算 Gas 成本
- **[Gas](gas)**：取得 Gas 價格和費用歷史以最佳化交易定價

### 智慧合約資源

- **[Contract](contract)**（合約）：讀取和寫入智慧合約、部署新合約和查詢事件日誌
- **[ERC20](erc20)**：與 ERC20 代幣合約互動（轉帳、授權、餘額）
- **[ERC721](erc721)**：管理 ERC721 NFT 操作（轉帳、所有權、中繼資料）
- **[ERC1155](erc1155)**：使用 ERC1155 多代幣標準（批次操作、餘額）

### 實用工具資源

- **[ENS](ens)**：解析以太坊名稱服務網域名稱和反向查詢
- **[Signature](signature)**（簽名）：簽名和驗證訊息和類型化資料（EIP-712）
- **[Utils](utils)**（工具）：格式化、編碼和驗證的實用函式
- **[Custom RPC](custom-rpc)**（自訂 RPC）：使用任何方法和參數傳送原始 RPC 請求

## 資源選擇

使用以太坊節點時：

1. 從下拉選單中選擇 **Resource**（資源）
2. 在該資源內選擇 **Operation**（操作）
3. 設定操作特定的參數
4. 新增所需的憑證（所有操作需要 RPC，寫入操作需要 Account）

## 快速參考

### 唯讀操作（僅需 RPC）

這些操作僅需要 **Ethereum RPC** 憑證：

| 資源 | 操作 |
|------|------|
| Account | Get Balance、Get Transaction Count、Get Code |
| Block | Get Block、Get Block Number |
| Transaction | Get Transaction、Get Transaction Receipt |
| Contract | Read Contract、Multicall、Simulate Contract、Get Logs |
| ERC20 | Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol |
| ERC721 | Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI |
| ERC1155 | Balance Of、Balance Of Batch、Is Approved For All、URI |
| ENS | 所有操作 |
| Gas | 所有操作 |
| Utils | 大多數操作 |
| Custom RPC | 所有操作 |

### 寫入操作（RPC + Account）

這些操作需要 **Ethereum RPC** 和 **Ethereum Account** 憑證：

| 資源 | 操作 |
|------|------|
| Transaction | Send Transaction、Wait For Transaction |
| Contract | Write Contract、Deploy Contract |
| ERC20 | Transfer、Approve、Transfer From |
| ERC721 | Transfer From、Safe Transfer From、Approve、Set Approval For All |
| ERC1155 | Safe Transfer From、Safe Batch Transfer From、Set Approval For All |
| Signature | Sign Message、Sign Typed Data |

## 常見模式

### 讀取區塊鏈資料

```
[Schedule Trigger] → [Ethereum: Contract - Read Contract] → [Process Data]
```

### 執行交易

```
[Trigger] → [Ethereum: Contract - Write Contract] → [Ethereum: Transaction - Wait For Transaction] → [Notification]
```

### 代幣操作

```
[Trigger] → [Ethereum: ERC20 - Transfer] → [Ethereum: Transaction - Wait For Transaction] → [Store Result]
```

### 事件監控

```
[Ethereum Trigger: Event] → [Process Event Data] → [Action]
```

## 下一步

詳細探索每個資源以了解特定操作和參數：

- 從 [Account](account) 開始進行基本的區塊鏈查詢
- 了解 [Transactions](transaction) 以傳送 ETH
- 深入了解 [Contract](contract) 進行智慧合約互動
- 探索代幣標準：[ERC20](erc20)、[ERC721](erc721)、[ERC1155](erc1155)
