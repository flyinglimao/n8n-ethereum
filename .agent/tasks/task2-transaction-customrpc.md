# Task 2: Transaction + Custom RPC Resources

## 目標

重構 `transaction` 和 `customRpc` 兩個 resources。

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task2 HEAD -b task/refactor-transaction-customrpc
cd ../n8n-ethereum-task2
```

## 工作範圍

### 1. 建立 `nodes/Ethereum/resources/transaction.ts`

Operations:
- `sendTransaction` - 發送 ETH 交易
- `getTransaction` - 透過 hash 取得交易資訊
- `getTransactionReceipt` - 取得交易收據
- `waitForTransaction` - 等待交易確認
- `estimateGas` - 估算交易 gas

**重要：輸出格式需與測試匹配**
```typescript
// getTransaction
{ hash, from, to, value, ... }

// getTransactionReceipt
{ transactionHash, status, gasUsed, ... }

// estimateGas - 注意測試期望是 estimatedGas 不是 gas
{ estimatedGas: string }
```

### 2. 建立 `nodes/Ethereum/resources/customRpc.ts`

Operations:
- `request` - 發送自訂 RPC 請求

輸出格式：
```typescript
{ result: any }
```

### 3. 更新測試

確認以下測試與實作一致：
- Get Transaction
- Get Transaction Receipt
- Estimate Gas
- Custom RPC Request

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): extract transaction, customRpc resources into modules"
```
