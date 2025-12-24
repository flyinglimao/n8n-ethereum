---
sidebar_position: 5
---

# Contract（合約）

Contract 資源提供與以太坊區塊鏈上智能合約互動的操作。

## 操作

### Read Contract（讀取合約）

呼叫智能合約上的唯讀（view/pure）函數。

**所需憑證**：Ethereum RPC

**參數**：
- **Contract Address**（合約地址）（必需）：智能合約地址
- **ABI**（必需）：合約 ABI（應用程式二進位介面）JSON 格式
- **Function Name**（函數名稱）（必需）：要呼叫的函數名稱
- **Function Arguments**（函數參數）（可選）：函數的參數，JSON 陣列格式
- **Block**（區塊）（可選）：要查詢的區塊號（預設：latest）

**範例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"balanceOf\",\"type\":\"function\",\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}]}]",
  "functionName": "balanceOf",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\"]"
}
```

**輸出**：
```json
{
  "result": "1000000000000000000"
}
```

### Write Contract（寫入合約）

在智能合約上執行狀態變更函數。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Contract Address**（合約地址）（必需）：智能合約地址
- **ABI**（必需）：合約 ABI JSON 格式
- **Function Name**（函數名稱）（必需）：要呼叫的函數名稱
- **Function Arguments**（函數參數）（可選）：函數的參數，JSON 陣列格式
- **Value**（價值）（可選）：隨交易發送的 ETH（以 ether 為單位）
- **Gas Limit**（Gas 限制）（可選）：使用的最大 Gas
- **Max Fee Per Gas**（每 Gas 最大費用）（可選）：每 Gas 的最大總費用
- **Max Priority Fee Per Gas**（每 Gas 最大優先費用）（可選）：每 Gas 的最大優先費用

**範例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```

**輸出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

### Deploy Contract（部署合約）

將新智能合約部署到區塊鏈。

**所需憑證**：Ethereum RPC、Ethereum Account

**參數**：
- **Bytecode**（字節碼）（必需）：合約字節碼（來自編譯）
- **ABI**（必需）：合約 ABI
- **Constructor Arguments**（建構函數參數）（可選）：建構函數的參數
- **Value**（價值）（可選）：隨部署發送的 ETH
- **Gas Limit**（Gas 限制）（可選）：使用的最大 Gas

**範例**：
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"_name\",\"type\":\"string\"}]}]",
  "args": "[\"MyToken\"]"
}
```

**輸出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "contractAddress": "0xNewContractAddress..."
}
```

### Multicall（多重呼叫）

將多個讀取操作批次處理為單一呼叫以提高效率。

**所需憑證**：Ethereum RPC

**參數**：
- **Calls**（呼叫）（必需）：要執行的呼叫陣列
  - 每個呼叫包含：合約地址、ABI、函數名稱、參數

**使用場景**：
- 在單一呼叫中從一個或多個合約讀取多個值
- 減少 RPC 呼叫並提高效能
- 確保所有讀取都來自同一區塊

### Simulate Contract（模擬合約）

在不發送交易的情況下測試合約呼叫。

**所需憑證**：Ethereum RPC

**參數**：
- **Contract Address**（合約地址）（必需）：智能合約地址
- **ABI**（必需）：合約 ABI
- **Function Name**（函數名稱）（必需）：函數名稱
- **Function Arguments**（函數參數）（可選）：函數的參數
- **Value**（價值）（可選）：模擬發送的 ETH
- **From**（發送者）（可選）：模擬呼叫的地址

**使用場景**：
- 發送前測試交易
- 驗證合約行為
- 檢查回退原因

### Get Logs（取得日誌）

從智能合約查詢歷史事件日誌。

**所需憑證**：Ethereum RPC

**參數**：
- **Contract Address**（合約地址）（可選）：按合約地址篩選
- **Event ABI**（事件 ABI）（必需）：要解碼的事件 ABI
- **From Block**（起始區塊）（可選）：起始區塊號
- **To Block**（結束區塊）（可選）：結束區塊號
- **Topics**（主題）（可選）：按索引事件參數篩選

**使用場景**：
- 查詢歷史事件
- 追蹤代幣轉帳
- 監控合約活動

## 常見使用場景

### 讀取合約狀態

```
[Schedule Trigger] → [Read Contract] → [儲存資料]
```

### 執行合約函數

```
[Trigger] → [Write Contract] → [Wait For Transaction] → [成功處理器]
```

### 部署並初始化合約

```
[Trigger] → [Deploy Contract] → [Wait For Transaction] → [Write Contract] → [初始化]
```

### 查詢歷史事件

```
[Schedule Trigger] → [Get Logs] → [處理事件] → [儲存到資料庫]
```

## ABI 格式

ABI（應用程式二進位介面）定義合約的介面。您可以從以下位置取得：

- Etherscan 上的合約驗證
- 編譯器輸出（Hardhat、Foundry 等）
- 合約文檔

**最小 ABI 範例**：
```json
[
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [
      {"name": "", "type": "bool"}
    ]
  }
]
```

## 提示

- **ABI 需求**：ABI 中只包含您需要的函數/事件
- **參數格式**：始終以 JSON 陣列字串提供參數
- **Gas 估算**：對於寫入操作，除非有特定要求，否則讓節點估算 Gas
- **Multicall**：用於批次讀取以節省 RPC 呼叫並確保一致性
- **事件篩選**：在事件中使用索引參數以實現高效篩選
- **模擬**：在執行前始終模擬複雜交易
- **區塊號**：對於歷史查詢，請注意 RPC 提供商的區塊範圍限制
