# Task 4: ERC20 Resource

## 目標

重構 `erc20` resource。這是較複雜的 resource，有多個 operations。

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task4 HEAD -b task/refactor-erc20
cd ../n8n-ethereum-task4
```

## 工作範圍

### 建立 `nodes/Ethereum/resources/erc20.ts`

Operations:
- `getBalance` - 取得代幣餘額
- `getTokenInfo` - 取得代幣資訊（name, symbol, decimals, totalSupply）
- `getAllowance` - 取得授權額度
- `transfer` - 轉帳代幣
- `approve` - 授權代幣
- `transferFrom` - 代理轉帳

**重要：輸出格式需與測試匹配**
```typescript
// getBalance
{ balance: string, balanceFormatted: string }

// getTokenInfo
{ name: string, symbol: string, decimals: number, totalSupply: string }

// getAllowance
{ allowance: string, allowanceFormatted: string }
```

## 更新測試

確認以下測試與實作一致：
- ERC20 Get Balance
- ERC20 Get Token Info
- ERC20 Get Allowance

### 需要部署測試合約

測試目前使用 mainnet 地址（USDC），但在 Hardhat 本地網路不存在。
需要：
1. 使用 `npm run test:deploy` 部署 TestERC20
2. 更新 workflow JSON 使用部署後的地址
3. 或修改 setup 腳本動態更新地址

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): extract erc20 resource into module"
```
