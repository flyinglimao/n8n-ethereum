---
sidebar_position: 2
---

# 安装

本指南将帮助您在 n8n 实例中安装 n8n-nodes-ethereum 包。

## 方法一：通过 n8n 社区节点安装（推荐）

如果您使用带有图形界面的 n8n，这是最简单的安装方式。

### 步骤：

1. **打开 n8n 设置**
   - 进入 **设置** → **社区节点**

2. **安装包**
   - 点击 **安装社区节点**
   - 输入包名：`@0xlimao/n8n-nodes-ethereum`
   - 点击 **安装**

3. **重启 n8n**（如果需要）
   - 某些 n8n 安装在安装社区节点后可能需要重启
   - 如需重启，请按照提示操作

4. **验证安装**
   - 创建新工作流
   - 添加新节点并搜索 "Ethereum"
   - 您应该看到两个节点：
     - **Ethereum**（常规节点）
     - **Ethereum Trigger**（触发器节点）

## 方法二：手动安装

如果您从源代码运行 n8n 或需要手动安装，请按照以下步骤操作。

### 对于 npm 安装：

```bash
# 导航到您的 n8n 安装目录
cd ~/.n8n

# 安装包
npm install @0xlimao/n8n-nodes-ethereum

# 重启 n8n
```

### 对于 Docker 安装：

通过修改 `docker-compose.yml` 将包添加到您的 Docker 设置中：

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

然后重启您的 Docker 容器：

```bash
docker-compose down
docker-compose up -d
```

### 对于 n8n Cloud：

n8n Cloud 用户可以使用上述方法一直接从 n8n 界面安装社区节点。

## 验证

安装后，验证包是否正常工作：

1. 创建新工作流
2. 添加 **Ethereum** 节点
3. 您应该看到以下可用资源：
   - Account（账户）
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

## 故障排除

### 安装后节点未出现

- **重启 n8n**：有时 n8n 需要重启才能显示新节点
- **检查日志**：查看 n8n 日志中的任何错误消息
- **验证包名**：确保使用了正确的包名 `@0xlimao/n8n-nodes-ethereum`

### 安装失败

- **检查 npm 版本**：确保您的 npm 版本为 7.0 或更高
- **检查 Node.js 版本**：确保您的 Node.js 版本为 18.0 或更高
- **权限**：确保您对 n8n 目录有写入权限

### Docker 安装问题

- **卷权限**：确保挂载的卷具有正确的权限
- **重启容器**：修改 docker-compose.yml 后尝试停止并启动容器
- **检查环境变量**：验证 `N8N_COMMUNITY_PACKAGES` 环境变量设置正确

## 下一步

成功安装后，继续[配置凭证](./credentials.md)以开始使用以太坊节点。
