# n8n Ethereum Integration Tests

本文件說明如何設置和執行 n8n-nodes-ethereum 的整合測試。

## 前置條件

- Node.js v22+
- npm
- n8n CLI（`npm install -g n8n`）

## 目錄結構

```
tests/
├── README.md                    # 本文件
├── n8n.test.ts                  # 主要整合測試檔案
├── workflows/                   # n8n workflow JSON 檔案
│   └── *.json
├── credentials/                 # n8n credential JSON 檔案
│   ├── ethereum-rpc.json
│   └── ethereum-account.json
└── scripts/                     # 測試輔助腳本
    ├── setup.mjs                # 透過 API 導入 credentials/workflows
    ├── start-hardhat-network.mjs  # 啟動本地 Hardhat 節點
    ├── deploy-contracts.mjs     # 部署測試合約
    └── vitest-setup.mjs         # vitest globalSetup
```

## 初次設置（僅需執行一次）

### 1. 建立 n8n 使用者帳號

```bash
# 啟動 n8n
npm run test:n8n
```

開啟瀏覽器前往 `http://localhost:5678`，建立一個使用者帳號，然後關閉 n8n（Ctrl+C）。

### 2. 安裝 Ethereum Nodes 到 n8n

```bash
# 建立 n8n custom nodes 目錄
mkdir -p /tmp/.test-n8n/.n8n/custom

# 進入目錄並安裝本專案
cd /tmp/.test-n8n/.n8n/custom
npm init -y
npm install /path/to/n8n-ethereum  # 替換為實際專案路徑

# 例如：
# npm install ~/Code/n8n-ethereum
```

### 3. 建立 API Key

1. 啟動 n8n：`npm run test:n8n`
2. 前往 `http://localhost:5678`
3. 進入 **Settings** → **API**
4. 建立新的 API Key
5. 複製 API Key 並設定環境變數：

```bash
export N8N_API_KEY="your-api-key-here"
```

或者直接修改 `tests/scripts/setup.mjs` 中的 `API_KEY` 常數。

## 執行測試

### 方法一：手動分步執行

```bash
# 終端機 1：啟動 n8n
npm run test:n8n

# 終端機 2：啟動 Hardhat 節點
npm run test:node

# 終端機 3：執行設置（可選，vitest 會自動執行）
npm run test:setup

# 終端機 3：執行測試
npm run test
```

### 方法二：單純執行測試（假設 n8n 和 Hardhat 已經運行）

```bash
npm run test
```

vitest 的 `globalSetup` 會自動：
1. 檢查 n8n 和 Hardhat 是否運行
2. 刪除現有的 workflows
3. 建立新的 credentials
4. 導入所有 workflows
5. 啟動所有 workflows

## npm Scripts

| 指令 | 說明 |
|------|------|
| `npm run test:n8n` | 以測試配置啟動 n8n |
| `npm run test:node` | 啟動本地 Hardhat 節點 |
| `npm run test:setup` | 透過 API 導入 credentials 和 workflows |
| `npm run test:deploy` | 部署測試合約（ERC20/721/1155）|
| `npm run test` | 執行所有測試 |

## 測試架構

### Action Nodes 測試

使用 webhook 觸發 workflow，驗證回傳結果：

```
[Webhook] → [Ethereum Node] → [Respond to Webhook]
```

測試腳本發送 POST 請求到 webhook，驗證回傳的 JSON 資料。

### Trigger Nodes 測試

建立本地 HTTP server 接收 n8n 發送的事件：

```
[Ethereum Trigger] → [HTTP Request to Test Server]
```

當區塊鏈事件發生時，n8n 會發送資料到測試腳本的 server。

## 故障排除

### n8n 找不到 Ethereum nodes

確認已正確安裝到 n8n custom nodes 目錄：

```bash
ls /tmp/.test-n8n/.n8n/custom/node_modules/@0xlimao/n8n-nodes-ethereum
```

如果不存在，請重新執行安裝步驟。

### Webhook 回傳 404

確認 workflows 已經啟動（active）。可以在 n8n UI 中確認，或重新執行 `npm run test:setup`。

### Hardhat 連線失敗

確認 Hardhat 節點正在運行：

```bash
curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

應該回傳類似：`{"jsonrpc":"2.0","id":1,"result":"0x0"}`

### API Key 過期

n8n API Key 有過期時間。如果測試失敗並顯示認證錯誤，請建立新的 API Key。

## 注意事項

- n8n Community Edition 的 `/credentials` 端點不支援 GET 請求，因此無法查詢現有的 credentials
- 每次執行 setup 都會建立新的 credentials，舊的會保留在 n8n 中（但不影響測試）
- ERC20/721/1155 相關測試需要部署測試合約到本地 Hardhat 網路
