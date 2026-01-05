# Task 1: Account + Block + Gas Resources

## 目標

重構 `account`, `block`, `gas` 三個 resources，使其成為獨立模組。

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task1 HEAD -b task/refactor-account-block-gas
cd ../n8n-ethereum-task1
```

## 工作範圍

### 1. 建立 `nodes/Ethereum/resources/account.ts`

從 `Ethereum.node.ts` 提取：
- **Properties 定義** (約 lines 250-351)
- **Execute 邏輯** (約 lines 2018-2093)

Operations:
- `getBalance` - 取得地址的 ETH 餘額
- `getTransactionCount` - 取得地址的交易數（nonce）
- `getCode` - 取得地址的合約代碼
- `getCurrentAddress` - 取得目前錢包地址

**重要：輸出格式需與測試匹配**
```typescript
// getBalance - 測試期望有 balanceInEth 欄位
{ address, balance: string, balanceInEth: string }

// getTransactionCount - 測試期望 string 類型
{ address, transactionCount: string }

// getCode - 測試期望有 isContract 欄位
{ address, code: string, isContract: boolean }

// getCurrentAddress
{ address: string }
```

### 2. 建立 `nodes/Ethereum/resources/block.ts`

Operations:
- `getBlock` - 透過 number/hash/tag 取得區塊資訊
- `getBlockNumber` - 取得最新區塊號

### 3. 建立 `nodes/Ethereum/resources/gas.ts`

Operations:
- `getGasPrice` - 取得目前 gas 價格
- `getFeeHistory` - 取得歷史費用資訊
- `estimateMaxPriorityFee` - 估算 max priority fee

輸出格式：
```typescript
// getGasPrice
{ gasPrice: string, gasPriceGwei: string }

// getFeeHistory
{ baseFeePerGas: string[], reward: string[][] }

// estimateMaxPriorityFee
{ maxPriorityFeePerGas: string }
```

### 4. 更新測試

確認 `tests/n8n.test.ts` 中的測試預期與新的輸出格式匹配。

## 模組結構範例

```typescript
// resources/account.ts
import { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { PublicClient, WalletClient } from "viem";

export const accountOperations: INodeProperties = { /* ... */ };
export const accountProperties: INodeProperties[] = [ /* ... */ ];

export async function executeAccount(
  context: IExecuteFunctions,
  itemIndex: number,
  publicClient: PublicClient,
  walletClient?: WalletClient
): Promise<Record<string, any>> {
  // ...
}
```

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): extract account, block, gas resources into modules"
```

通知主對話進行合併。
