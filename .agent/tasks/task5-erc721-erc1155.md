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
