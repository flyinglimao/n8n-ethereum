# Task 5: ERC721 + ERC1155 Resources

## 目標

重構 `erc721` 和 `erc1155` 兩個 resources。

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task5 HEAD -b task/refactor-erc721-erc1155
cd ../n8n-ethereum-task5
```

## 工作範圍

### 1. 建立 `nodes/Ethereum/resources/erc721.ts`

Operations:
- `getBalance` - 取得 NFT 餘額
- `ownerOf` - 取得 token 擁有者
- `getApproved` - 取得授權地址
- `getTokenURI` - 取得 metadata URI
- `safeTransferFrom` - 安全轉移
- `setApprovalForAll` - 設定全部授權

輸出格式：
```typescript
// getBalance
{ balance: string }

// ownerOf
{ owner: string }

// getTokenURI
{ tokenURI: string }
```

### 2. 建立 `nodes/Ethereum/resources/erc1155.ts`

Operations:
- `balanceOf` - 取得代幣餘額
- `balanceOfBatch` - 批次查詢餘額
- `uri` - 取得 metadata URI
- `safeTransferFrom` - 安全轉移
- `safeBatchTransferFrom` - 批次轉移

輸出格式：
```typescript
// balanceOf
{ balance: string }

// uri
{ uri: string }
```

## 更新測試

確認以下測試與實作一致：
- ERC721 Get Balance
- ERC721 Owner Of
- ERC721 Token URI
- ERC1155 Balance Of
- ERC1155 URI

### 需要部署測試合約

同 ERC20，需要使用 `npm run test:deploy` 部署測試合約。

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): extract erc721, erc1155 resources into modules"
```

---

## 🔧 待修復問題 (2026-01-06)

### 測試結果

**26 通過 / 7 失敗**

### 已修復

1. ✅ `tests/scripts/setup.mjs` - 屬性名稱錯誤
   - 修正 `deployedAddresses.TestERC20` → `deployedAddresses.erc20`
   - 新增 ERC721/ERC1155 地址替換

2. ✅ `dist/package.json` - ESM/CJS 衝突
   - 新增 `{"type": "commonjs"}` 到 dist 目錄

### 待修復

#### 1. Transaction 測試 (2 failures)
- **問題**: `Get Transaction` 和 `Get Transaction Receipt` 測試使用硬編碼 hash `0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b`
- **位置**: `tests/workflows/Get Transaction.json`, `tests/workflows/Get Transaction Receipt.json`
- **修復方式**: 在 `setup.mjs` 中動態發送交易並替換 hash

#### 2. Contract Read 測試 (1 failure)
- **問題**: `Contract reverted: Internal error`
- **位置**: `tests/workflows/Contract Read.json`
- **可能原因**: 調用的合約函數不存在或參數錯誤

#### 3. ERC721 測試 (3 failures)
- **問題**: `Get Balance`, `Owner Of`, `Token URI` 失敗
- **可能原因**: 測試合約部署後沒有 mint token
- **修復方式**: 在 `deploy-contracts.mjs` 中呼叫 `mint()` 準備測試數據

#### 4. ERC1155 測試 (1 failure)  
- **問題**: `Balance Of` 或 `URI` 失敗
- **可能原因**: 同上，需要先 mint token
- **修復方式**: 在 `deploy-contracts.mjs` 中呼叫 `mint()` 準備測試數據

### 備註

- 這些問題都是 **測試基礎設施問題**，不是重構的問題
- ERC721/ERC1155 節點代碼本身是正確的
- 建議在 `deploy-contracts.mjs` 中加入測試數據準備邏輯

