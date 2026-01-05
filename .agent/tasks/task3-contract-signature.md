# Task 3: Contract + Signature Resources

## 目標

重構 `contract` 和 `signature` 兩個 resources。

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task3 HEAD -b task/refactor-contract-signature
cd ../n8n-ethereum-task3
```

## 工作範圍

### 1. 建立 `nodes/Ethereum/resources/contract.ts`

Operations:
- `read` - 呼叫 view/pure 函數
- `write` - 執行狀態變更函數
- `deploy` - 部署合約
- `getLogs` - 查詢事件 logs

輸出格式：
```typescript
// read
{ result: any }

// write
{ transactionHash: string }

// deploy
{ contractAddress: string, transactionHash: string }

// getLogs
{ logs: array }
```

### 2. 建立 `nodes/Ethereum/resources/signature.ts`

Operations:
- `signMessage` - 簽署訊息
- `verifyMessage` - 驗證簽名
- `recoverAddress` - 從簽名還原地址

## 更新測試

確認以下測試與實作一致：
- Contract Read
- Contract Get Logs

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): extract contract, signature resources into modules"
```
