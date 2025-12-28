# n8n-ethereum 自動化測試系統

這個測試系統使用 Docker 自動化測試所有 n8n-ethereum 節點的功能。

## 📋 目錄

- [功能特點](#功能特點)
- [系統架構](#系統架構)
- [測試覆蓋範圍](#測試覆蓋範圍)
- [快速開始](#快速開始)
- [測試結構](#測試結構)
- [手動執行](#手動執行)
- [CI/CD 整合](#cicd-整合)
- [故障排除](#故障排除)

## 🎯 功能特點

- ✅ **完整的節點測試覆蓋** - 測試所有 11 個資源類別和 3 個觸發器類型
- 🐳 **Docker 化環境** - 使用 Docker Compose 自動啟動 n8n 和 Hardhat 本地網路
- 🔐 **自動化憑證管理** - 自動建立和配置 RPC 和帳戶憑證
- 📦 **合約部署** - 自動部署測試用的 ERC20、ERC721、ERC1155 和通用合約
- 📊 **詳細報表** - 生成 JSON 和可視化的測試結果報表
- 🚀 **GitHub Actions 整合** - 在 CI/CD 中自動執行測試

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                     測試系統架構                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │   n8n       │◄────────┤ Test Scripts │                  │
│  │  Instance   │         │              │                  │
│  └──────┬──────┘         └──────────────┘                  │
│         │                                                    │
│         │ JSON-RPC                                          │
│         ▼                                                    │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │  Hardhat    │◄────────┤   Deployed   │                  │
│  │   Network   │         │  Contracts   │                  │
│  └─────────────┘         └──────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📊 測試覆蓋範圍

### Ethereum 節點 (主節點)

#### 1️⃣ Account 資源
- ✅ `getCurrentAddress` - 獲取當前錢包地址
- ✅ `getBalance` - 獲取地址餘額
- ✅ `getTransactionCount` - 獲取交易計數（nonce）
- ✅ `getCode` - 檢查地址是否為合約

#### 2️⃣ Block 資源
- ✅ `getBlockNumber` - 獲取最新區塊號
- ✅ `getBlock` - 獲取區塊詳情

#### 3️⃣ Transaction 資源
- ✅ `sendTransaction` - 發送 ETH 交易
- ✅ `getTransaction` - 獲取交易詳情
- ✅ `getTransactionReceipt` - 獲取交易收據
- ✅ `waitForTransaction` - 等待交易確認
- ✅ `estimateGas` - 估算 Gas

#### 4️⃣ Contract 資源
- ✅ `deploy` - 部署智能合約
- ✅ `read` - 調用 view/pure 函數
- ✅ `write` - 執行狀態改變函數
- ✅ `getLogs` - 查詢事件日誌

#### 5️⃣ ERC20 資源
- ✅ `getTokenInfo` - 獲取代幣信息
- ✅ `getBalance` - 查詢代幣餘額
- ✅ `transfer` - 轉移代幣
- ✅ `approve` - 授權代幣支出
- ✅ `getAllowance` - 查詢已批准額度

#### 6️⃣ ERC721 資源
- ✅ `getBalance` - 查詢 NFT 餘額
- ✅ `ownerOf` - 查詢 Token 擁有者
- ✅ `tokenURI` - 獲取 Token URI
- ✅ `transferFrom` - 轉移 NFT
- ✅ `approve` - 批准 NFT
- ✅ `getApproved` - 查詢批准地址
- ✅ `setApprovalForAll` - 授權所有 NFT
- ✅ `isApprovedForAll` - 檢查全批准狀態

#### 7️⃣ ERC1155 資源
- ✅ `balanceOf` - 查詢單個 Token 餘額
- ✅ `balanceOfBatch` - 批量查詢餘額
- ✅ `uri` - 獲取 Token URI
- ✅ `safeTransferFrom` - 轉移單個 Token
- ✅ `safeBatchTransferFrom` - 批量轉移 Token
- ✅ `setApprovalForAll` - 授權所有 Token
- ✅ `isApprovedForAll` - 檢查批准狀態

#### 8️⃣ Gas 資源
- ✅ `getGasPrice` - 獲取當前 Gas 價格

#### 9️⃣ Signature 資源
- ✅ `signMessage` - 簽名消息
- ✅ `recoverAddress` - 從簽名恢復地址
- ✅ `verifyMessage` - 驗證簽名消息
- ✅ `signTypedData` - 簽名 EIP-712 類型化數據
- ✅ `signSiwe` - 簽名 SIWE 消息

#### 🔟 Utils 資源
- ✅ `getChainId` - 獲取鏈 ID
- ✅ `validateAddress` - 驗證地址格式
- ✅ `keccak256` - Keccak256 哈希

### 測試 Workflows

| Workflow | 描述 | 測試的節點功能 |
|----------|------|---------------|
| `01-contract-deploy-read-write.json` | 合約部署、讀取和寫入 | Contract: deploy, read, write, getLogs |
| `02-basic-operations.json` | 基本操作測試 | Account, Block, Transaction, Gas, Utils |
| `03-erc20-operations.json` | ERC20 代幣操作 | ERC20: getTokenInfo, getBalance, transfer, approve, getAllowance |
| `04-erc721-operations.json` | ERC721 NFT 操作 | ERC721: 所有操作 |
| `05-erc1155-operations.json` | ERC1155 多代幣操作 | ERC1155: 所有操作 |
| `06-signature-operations.json` | 簽名和驗證操作 | Signature: signMessage, recoverAddress, verifyMessage, signTypedData, signSiwe |

## 🚀 快速開始

### 前置要求

- Docker 和 Docker Compose
- jq (JSON 處理工具)
- curl

### 執行測試

1. **克隆倉庫**
   ```bash
   git clone https://github.com/flyinglimao/n8n-ethereum.git
   cd n8n-ethereum/test
   ```

2. **執行測試腳本**
   ```bash
   ./scripts/run-tests.sh
   ```

3. **查看結果**
   測試完成後，報表會顯示在終端並保存到 `/tmp/test-report.json`

## 📁 測試結構

```
test/
├── docker-compose.yml          # Docker 服務配置
├── README.md                   # 本文件
├── contracts/                  # 測試用智能合約
│   ├── TestContract.sol       # 通用測試合約
│   ├── TestERC20.sol          # ERC20 代幣合約
│   ├── TestERC721.sol         # ERC721 NFT 合約
│   └── TestERC1155.sol        # ERC1155 多代幣合約
├── hardhat/                    # Hardhat 配置
│   ├── hardhat.config.js      # Hardhat 配置檔案
│   ├── package.json           # Hardhat 依賴
│   └── scripts/               # 部署腳本
│       ├── deploy.js          # 合約部署腳本
│       └── fund-account.js    # 帳戶資助腳本
├── workflows/                  # n8n 測試 workflows
│   ├── 01-contract-deploy-read-write.json
│   ├── 02-basic-operations.json
│   ├── 03-erc20-operations.json
│   ├── 04-erc721-operations.json
│   ├── 05-erc1155-operations.json
│   └── 06-signature-operations.json
└── scripts/                    # 測試腳本
    └── run-tests.sh           # 主要測試腳本
```

## 🛠️ 手動執行

### 1. 啟動服務

```bash
docker-compose up -d
```

### 2. 等待服務啟動

```bash
# 檢查 Hardhat
curl http://localhost:8545

# 檢查 n8n
curl http://localhost:5678/healthz
```

### 3. 部署合約

```bash
docker-compose exec hardhat npx hardhat compile
docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost
```

### 4. 資助測試帳戶

```bash
docker-compose exec hardhat npx hardhat run scripts/fund-account.js --network localhost
```

### 5. 訪問 n8n

打開瀏覽器訪問 `http://localhost:5678`

### 6. 手動導入和執行 workflows

從 `workflows/` 目錄導入 JSON 檔案到 n8n，然後手動執行。

### 7. 清理

```bash
docker-compose down -v
```

## 🔧 CI/CD 整合

### GitHub Actions

測試會在以下情況自動執行：
- Push 到 `main`, `develop` 或 `claude/**` 分支
- 建立 Pull Request 到 `main` 或 `develop`
- 手動觸發 workflow

### 查看測試結果

1. **在 Actions 標籤頁** - 查看 workflow 執行狀態
2. **在 PR 評論** - 測試結果會自動評論在 PR 上
3. **下載 Artifacts** - 可以下載測試報表和日誌

## 🔍 故障排除

### 問題: Docker 服務無法啟動

**解決方案:**
```bash
# 檢查 Docker 狀態
docker ps

# 檢查日誌
docker-compose logs hardhat
docker-compose logs n8n

# 重啟服務
docker-compose down -v
docker-compose up -d
```

### 問題: n8n 無法連接到 Hardhat

**解決方案:**
- 確保 Hardhat 正在運行: `curl http://localhost:8545`
- 檢查網路配置: `docker network ls`
- 查看 Hardhat 日誌: `docker-compose logs hardhat`

### 問題: 合約部署失敗

**解決方案:**
```bash
# 重新編譯
docker-compose exec hardhat npx hardhat clean
docker-compose exec hardhat npx hardhat compile

# 重新部署
docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost
```

### 問題: Workflow 執行失敗

**解決方案:**
1. 檢查憑證是否正確配置
2. 確認合約已部署
3. 檢查測試帳戶有足夠的 ETH
4. 查看 n8n 執行日誌

## 📝 測試配置

### 測試帳戶

- **地址**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **私鑰**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **初始餘額**: 10,000 ETH (測試用)

⚠️ **警告**: 這是 Hardhat 的預設測試私鑰，**絕對不要**在主網或測試網使用！

### 網路配置

- **Hardhat Network**
  - RPC URL: `http://localhost:8545`
  - Chain ID: `31337`
  - 區塊時間: 1 秒

- **n8n Instance**
  - URL: `http://localhost:5678`
  - 無需認證 (測試環境)

## 🎯 報表格式

測試報表以 JSON 格式保存：

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "total": 6,
  "passed": 5,
  "failed": 1,
  "passedWorkflows": [
    "01-contract-deploy-read-write.json",
    "02-basic-operations.json",
    "03-erc20-operations.json",
    "04-erc721-operations.json",
    "05-erc1155-operations.json"
  ],
  "failedWorkflows": [
    "06-signature-operations.json"
  ]
}
```

## 🤝 貢獻

如果你想添加新的測試案例：

1. 在 `contracts/` 中添加新的測試合約（如果需要）
2. 在 `workflows/` 中建立新的 workflow JSON
3. 更新本 README 的測試覆蓋範圍部分
4. 提交 PR

## 📄 授權

MIT License - 與主項目相同

## 🔗 相關連結

- [n8n-ethereum 主項目](https://github.com/flyinglimao/n8n-ethereum)
- [n8n 官方文件](https://docs.n8n.io/)
- [Hardhat 文件](https://hardhat.org/docs)
- [Viem 文件](https://viem.sh/)
