---
sidebar_position: 2
---

# 安装

本指南将协助您在 n8n 实体中安装 n8n-nodes-ethereum 套件。

## 方法一：透过 n8n 社群节点安装（推荐）

如果您使用带有图形介面的 n8n，这是最简单的安装方式。

### 步骤：

1. **开启 n8n 设定**
   - 进入 **设定** → **社群节点**

2. **安装套件**
   - 点选 **安装社群节点**
   - 输入套件名称：`@0xlimao/n8n-nodes-ethereum`
   - 点选 **安装**

3. **重新启动 n8n**（如果需要）
   - 某些 n8n 安装在安装社群节点后可能需要重新启动
   - 如需重新启动，请依照提示操作

4. **验证安装**
   - 建立新工作流程
   - 新增新节点并搜寻 "Ethereum"
   - 您应该看到两个节点：
     - **Ethereum**（常规节点）
     - **Ethereum Trigger**（触发器节点）

## 方法二：手动安装

如果您从原始码执行 n8n 或需要手动安装，请依照以下步骤操作。

### 对于 npm 安装：

```bash
# 导览至您的 n8n 安装目录
cd ~/.n8n

# 安装套件
npm install @0xlimao/n8n-nodes-ethereum

# 重新启动 n8n
```

### 对于 Docker 安装：

透过修改 `docker-compose.yml` 将套件新增至您的 Docker 设定中：

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

然后重新启动您的 Docker 容器：

```bash
docker-compose down
docker-compose up -d
```

### 对于 n8n Cloud：

n8n Cloud 使用者可以使用上述方法一直接从 n8n 介面安装社群节点。

## 验证

安装后，验证套件是否正常运作：

1. 建立新工作流程
2. 新增 **Ethereum** 节点
3. 您应该看到以下可用资源：
   - Account（帐户）
   - Block（区块）
   - Transaction（交易）
   - Contract（合约）
   - ERC20
   - ERC721
   - ERC1155
   - ENS
   - Gas
   - Signature（签名）
   - Utils（工具）

## 疑难排解

### 安装后节点未出现

- **重新启动 n8n**：有时 n8n 需要重新启动才能显示新节点
- **检查日志**：查看 n8n 日志中的任何错误讯息
- **验证套件名称**：确保使用了正确的套件名称 `@0xlimao/n8n-nodes-ethereum`

### 安装失败

- **检查 npm 版本**：确保您的 npm 版本为 7.0 或更高
- **检查 Node.js 版本**：确保您的 Node.js 版本为 18.0 或更高
- **权限**：确保您对 n8n 目录有写入权限

### Docker 安装问题

- **磁碟区权限**：确保挂载的磁碟区具有正确的权限
- **重新启动容器**：修改 docker-compose.yml 后尝试停止并启动容器
- **检查环境变数**：验证 `N8N_COMMUNITY_PACKAGES` 环境变数设定正确

## 下一步

成功安装后，继续[设定凭证](credentials)以开始使用以太坊节点。
