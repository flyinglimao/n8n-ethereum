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

---

## 完成狀態

### ✅ 已完成
- [x] 建立 `nodes/Ethereum/resources/contract.ts`
- [x] 建立 `nodes/Ethereum/resources/signature.ts`
- [x] 更新 `nodes/Ethereum/resources/index.ts` 匯出 contract 和 signature
- [x] Build 成功 (`npm run build` 通過)

### ⚠️ 已修復的問題
1. **signature 未匯出**: `index.ts` 原本漏掉 signature 的匯出，已補上

### 📝 注意事項
1. **deploy 操作輸出格式變更**: 用戶修改了 `contract.ts`，deploy 現在只回傳 `{ transactionHash }` 而不是 `{ contractAddress, transactionHash }`。這與任務規格不同，但符合用戶的修改意圖。

2. **executeContract 簽名變更**: 用戶將 `context` 參數改為 `this`，使用 `.call()` 方式調用

### 待主 Agent 確認
- [ ] 確認 `deploy` 操作的輸出格式是否符合預期
- [ ] 執行完整測試驗證
