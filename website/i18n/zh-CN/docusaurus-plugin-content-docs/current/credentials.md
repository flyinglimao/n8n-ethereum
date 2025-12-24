---
sidebar_position: 3
---

# 凭证

要使用以太坊节点，您需要配置两种类型的凭证：**Ethereum RPC**（必需）和 **Ethereum Account**（可选，仅用于写入操作）。

## Ethereum RPC 凭证

Ethereum RPC 凭证用于连接到以太坊节点。此凭证对于所有操作都是**必需的**。

### 配置步骤：

1. **导航到凭证**
   - 在 n8n 中，进入 **凭证** → **新建** → 搜索 "Ethereum RPC"

2. **选择链**
   - 从预配置网络中选择：
     - **Ethereum**：主网、Sepolia、Goerli、Holesky
     - **Layer 2**：Arbitrum、Optimism、Base（及其测试网）
     - **侧链**：Polygon、BSC、Avalanche、Gnosis、Celo（及其测试网）
     - **Custom**（自定义）：用于任何其他 EVM 兼容网络

3. **输入 RPC URL**
   - 提供 HTTP(S) 或 WebSocket 端点
   - 示例：
     - Infura: `https://mainnet.infura.io/v3/YOUR-API-KEY`
     - Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
     - QuickNode: `https://YOUR-ENDPOINT.quiknode.pro/YOUR-API-KEY/`
     - 公共 RPC: `https://eth.llamarpc.com`（不建议用于生产环境）

4. **自定义请求头**（可选）
   - 如果您的 RPC 提供商需要，添加身份验证头
   - 格式：JSON 对象
   - 示例：`{"Authorization": "Bearer YOUR-TOKEN"}`

### 推荐的 RPC 提供商：

| 提供商 | 免费额度 | 备注 |
|--------|----------|------|
| [Infura](https://infura.io/) | 每天 100,000 次请求 | 可靠，广泛使用 |
| [Alchemy](https://www.alchemy.com/) | 每月 3 亿计算单位 | 高级功能，文档完善 |
| [QuickNode](https://www.quicknode.com/) | 有限免费试用 | 快速，支持多链 |
| [Ankr](https://www.ankr.com/) | 公共端点 | 免费但有速率限制 |
| [LlamaNodes](https://llamanodes.com/) | 公共端点 | 社区运行 |

### 配置示例：

```json
{
  "chain": "Ethereum Mainnet",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR-API-KEY",
  "customHeaders": {}
}
```

## Ethereum Account 凭证

Ethereum Account 凭证包含您钱包的私钥或助记词。此凭证是**可选的**，仅在以下情况下需要：

- 发送交易
- 写入智能合约
- 签名消息
- 任何需要钱包签名的操作

:::caution 安全警告
切勿分享您的私钥或助记词。请将这些凭证安全地存储在 n8n 的凭证系统中。在生产环境中，建议使用资金有限的专用钱包。
:::

### 配置步骤：

1. **导航到凭证**
   - 在 n8n 中，进入 **凭证** → **新建** → 搜索 "Ethereum Account"

2. **选择身份验证方法**
   - 您可以使用 **Private Key**（私钥）或 **Mnemonic Phrase**（助记词）（二选一）

3. **选项 A：私钥**
   - 输入您钱包的私钥（64 个十六进制字符）
   - 可以以 `0x` 开头或不以 `0x` 开头
   - 示例：`0x1234567890abcdef...`

4. **选项 B：助记词**
   - 输入您的 12 或 24 个单词的助记词
   - 示例：`word1 word2 word3 ... word12`
   - 设置 **Account Index**（账户索引）（默认：0）以从同一助记词派生不同账户

### 安全最佳实践：

1. **使用专用钱包**
   - 专门为 n8n 自动化创建一个独立的钱包
   - 只为操作所需的金额充值

2. **先在测试网测试**
   - 在使用主网之前，始终在测试网（Sepolia、Goerli）上测试您的工作流
   - 测试网 ETH 可从水龙头免费获取

3. **监控活动**
   - 定期检查钱包交易
   - 为意外活动设置警报

4. **限制权限**
   - 只为需要的用户提供 n8n 凭证访问权限
   - 谨慎使用 n8n 的凭证共享功能

### 何时需要此凭证？

**需要用于：**
- Transaction → Send Transaction（发送交易）
- Contract → Write Contract（写入合约）
- Contract → Deploy Contract（部署合约）
- ERC20 → Transfer、Approve、Transfer From
- ERC721 → Transfer From、Safe Transfer From、Approve、Set Approval For All
- ERC1155 → Safe Transfer From、Safe Batch Transfer From、Set Approval For All
- Signature → Sign Message、Sign Typed Data

**不需要用于：**
- Account → Get Balance、Get Transaction Count、Get Code
- Block → Get Block、Get Block Number
- Transaction → Get Transaction、Get Transaction Receipt、Estimate Gas
- Contract → Read Contract、Multicall、Simulate Contract、Get Logs
- ERC20 → Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol
- ERC721 → Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI
- ERC1155 → Balance Of、Balance Of Batch、Is Approved For All、URI
- ENS → 所有操作
- Gas → 所有操作
- Utils → 所有操作

### 配置示例：

**使用私钥：**
```json
{
  "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**使用助记词：**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "accountIndex": 0
}
```

## 测试您的凭证

配置凭证后，测试它们：

1. **测试 RPC 连接**
   - 创建一个包含以太坊节点的工作流
   - 选择资源：**Block** → 操作：**Get Block Number**
   - 选择您的 RPC 凭证
   - 执行节点
   - 您应该获得当前区块号

2. **测试账户凭证**（如果已配置）
   - 选择资源：**Account** → 操作：**Get Balance**
   - 将地址留空（使用凭证的钱包地址）
   - 选择 RPC 和 Account 凭证
   - 执行节点
   - 您应该看到您钱包的余额

## 故障排除

### RPC 连接问题

- **无效的 RPC URL**：验证 URL 是否正确并包含协议（https://）
- **速率限制**：您可能已超过提供商的速率限制
- **网络不匹配**：确保所选链与您的 RPC 端点匹配
- **防火墙/代理**：检查您的网络是否允许连接到 RPC 端点

### 账户凭证问题

- **无效的私钥**：确保它是 64 个十六进制字符（有或没有 0x）
- **无效的助记词**：验证所有单词拼写正确且顺序正确
- **错误的账户**：如果使用助记词，尝试不同的账户索引

## 下一步

配置凭证后，探索[可用资源](resources/overview)以开始构建工作流。
