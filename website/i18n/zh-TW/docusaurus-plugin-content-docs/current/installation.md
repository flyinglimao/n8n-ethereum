---
sidebar_position: 2
---

# 安裝

本指南將協助您在 n8n 實體中安裝 n8n-nodes-ethereum 套件。

## 方法一：透過 n8n 社群節點安裝（推薦）

如果您使用帶有圖形介面的 n8n，這是最簡單的安裝方式。

### 步驟：

1. **開啟 n8n 設定**
   - 進入 **設定** → **社群節點**

2. **安裝套件**
   - 點選 **安裝社群節點**
   - 輸入套件名稱：`@0xlimao/n8n-nodes-ethereum`
   - 點選 **安裝**

3. **重新啟動 n8n**（如果需要）
   - 某些 n8n 安裝在安裝社群節點後可能需要重新啟動
   - 如需重新啟動，請依照提示操作

4. **驗證安裝**
   - 建立新工作流程
   - 新增新節點並搜尋 "Ethereum"
   - 您應該看到兩個節點：
     - **Ethereum**（常規節點）
     - **Ethereum Trigger**（觸發器節點）

## 方法二：手動安裝

如果您從原始碼執行 n8n 或需要手動安裝，請依照以下步驟操作。

### 對於 npm 安裝：

```bash
# 導覽至您的 n8n 安裝目錄
cd ~/.n8n

# 安裝套件
npm install @0xlimao/n8n-nodes-ethereum

# 重新啟動 n8n
```

### 對於 Docker 安裝：

透過修改 `docker-compose.yml` 將套件新增至您的 Docker 設定中：

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES=@0xlimao/n8n-nodes-ethereum
    ports:
      - 5678:5678
    volumes:
      - ~/.n8n:/home/node/.n8n
```

然後重新啟動您的 Docker 容器：

```bash
docker-compose down
docker-compose up -d
```

### 對於 n8n Cloud：

n8n Cloud 使用者可以使用上述方法一直接從 n8n 介面安裝社群節點。

## 驗證

安裝後，驗證套件是否正常運作：

1. 建立新工作流程
2. 新增 **Ethereum** 節點
3. 您應該看到以下可用資源：
   - Account（帳戶）
   - Block（區塊）
   - Transaction（交易）
   - Contract（合約）
   - ERC20
   - ERC721
   - ERC1155
   - ENS
   - Gas
   - Signature（簽名）
   - Utils（工具）

## 疑難排解

### 安裝後節點未出現

- **重新啟動 n8n**：有時 n8n 需要重新啟動才能顯示新節點
- **檢查日誌**：查看 n8n 日誌中的任何錯誤訊息
- **驗證套件名稱**：確保使用了正確的套件名稱 `@0xlimao/n8n-nodes-ethereum`

### 安裝失敗

- **檢查 npm 版本**：確保您的 npm 版本為 7.0 或更高
- **檢查 Node.js 版本**：確保您的 Node.js 版本為 18.0 或更高
- **權限**：確保您對 n8n 目錄有寫入權限

### Docker 安裝問題

- **磁碟區權限**：確保掛載的磁碟區具有正確的權限
- **重新啟動容器**：修改 docker-compose.yml 後嘗試停止並啟動容器
- **檢查環境變數**：驗證 `N8N_COMMUNITY_PACKAGES` 環境變數設定正確

## 下一步

成功安裝後，繼續[設定憑證](credentials)以開始使用以太坊節點。
