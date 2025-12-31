---
sidebar_position: 3
---

# 凭证

要使用以太坊节点，您需要设定两种类型的凭证：**Ethereum RPC**（必需）和 **Ethereum Account**（可选，仅用于写入操作）。

## Ethereum RPC 凭证

Ethereum RPC 凭证用于连接至以太坊节点。此凭证对于所有操作都是**必需的**。

### 设定步骤：

1. **导览至凭证**
   - 在 n8n 中，进入 **凭证** → **新建** → 搜寻 "Ethereum RPC"

2. **选择链**
   - 从预设网路中选择：
     - **Ethereum**：主网、Sepolia、Goerli、Holesky
     - **Layer 2**：Arbitrum、Optimism、Base（及其测试网）
     - **侧链**：Polygon、BSC、Avalanche、Gnosis、Celo（及其测试网）
     - **Custom**（自订）：用于任何其他 EVM 相容网路

3. **输入 RPC URL**
   - 提供 HTTP(S) 或 WebSocket 端点
   - 范例：
     - Infura: `https://mainnet.infura.io/v3/YOUR-API-KEY`
     - Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
     - QuickNode: `https://YOUR-ENDPOINT.quiknode.pro/YOUR-API-KEY/`
     - 公共 RPC: `https://eth.llamarpc.com`（不建议用于生产环境）

4. **自订请求标头**（可选）
   - 如果您的 RPC 提供商需要，新增身份验证标头
   - 格式：JSON 物件
   - 范例：`{"Authorization": "Bearer YOUR-TOKEN"}`

### 推荐的 RPC 提供商：

| 提供商 | 免费额度 | 备注 |
|--------|----------|------|
| [Infura](https://infura.io/) | 每天 100,000 次请求 | 可靠，广泛使用 |
| [Alchemy](https://www.alchemy.com/) | 每月 3 亿计算单位 | 进阶功能，文件完善 |
| [QuickNode](https://www.quicknode.com/) | 有限免费试用 | 快速，支援多链 |
| [Ankr](https://www.ankr.com/) | 公共端点 | 免费但有速率限制 |
| [LlamaNodes](https://llamanodes.com/) | 公共端点 | 社群运行 |

### 设定范例：

```json
{
  "chain": "Ethereum Mainnet",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR-API-KEY",
  "customHeaders": {}
}
```

## Ethereum Account 凭证

Ethereum Account 凭证包含您钱包的私钥或助记词。此凭证是**可选的**，仅在以下情况下需要：

- 传送交易
- 写入智慧合约
- 签名讯息
- 任何需要钱包签名的操作

:::caution 安全警告
切勿分享您的私钥或助记词。请将这些凭证安全地储存在 n8n 的凭证系统中。在生产环境中，建议使用资金有限的专用钱包。
:::

### 设定步骤：

1. **导览至凭证**
   - 在 n8n 中，进入 **凭证** → **新建** → 搜寻 "Ethereum Account"

2. **选择身份验证方法**
   - 您可以使用 **Private Key**（私钥）或 **Mnemonic Phrase**（助记词）（二选一）

3. **选项 A：私钥**
   - 输入您钱包的私钥（64 个十六进位字元）
   - 可以以 `0x` 开头或不以 `0x` 开头
   - 范例：`0x1234567890abcdef...`

4. **选项 B：助记词**
   - 输入您的 12 或 24 个单词的助记词
   - 范例：`word1 word2 word3 ... word12`
   - 设定 **Derivation Path**（衍生路径）（预设：`m/44'/60'/0'/0/0`）以衍生不同帐户
   - 可选设定 **Passphrase**（密码短语）以增加 BIP-39 安全性

### 安全最佳实务：

1. **使用专用钱包**
   - 专门为 n8n 自动化建立一个独立的钱包
   - 只为操作所需的金额充值

2. **先在测试网测试**
   - 在使用主网之前，始终在测试网（Sepolia、Goerli）上测试您的工作流程
   - 测试网 ETH 可从水龙头免费取得

3. **监控活动**
   - 定期检查钱包交易
   - 为意外活动设定警报

4. **限制权限**
   - 只为需要的使用者提供 n8n 凭证存取权限
   - 谨慎使用 n8n 的凭证共用功能

### 何时需要此凭证？

**需要用于：**
- Transaction → Send Transaction（传送交易）
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

### 设定范例：

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
  "path": "m/44'/60'/0'/0/0",
  "passphrase": ""
}
```

**使用自定义路径的助记词：**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "path": "m/44'/60'/1'/0/0"
}
```

## 测试您的凭证

设定凭证后，测试它们：

1. **测试 RPC 连接**
   - 建立一个包含以太坊节点的工作流程
   - 选择资源：**Block** → 操作：**Get Block Number**
   - 选择您的 RPC 凭证
   - 执行节点
   - 您应该取得目前区块号

2. **测试帐户凭证**（如果已设定）
   - 选择资源：**Account** → 操作：**Get Balance**
   - 将地址留空（使用凭证的钱包地址）
   - 选择 RPC 和 Account 凭证
   - 执行节点
   - 您应该看到您钱包的余额

## 疑难排解

### RPC 连接问题

- **无效的 RPC URL**：验证 URL 是否正确并包含协定（https://）
- **速率限制**：您可能已超过提供商的速率限制
- **网路不符**：确保所选链与您的 RPC 端点相符
- **防火墙/代理**：检查您的网路是否允许连接至 RPC 端点

### 帐户凭证问题

- **无效的私钥**：确保它是 64 个十六进位字元（有或没有 0x）
- **无效的助记词**：验证所有单词拼写正确且顺序正确
- **错误的帐户**：如果使用助记词，尝试不同的帐户索引

## 下一步

设定凭证后，探索[可用资源](resources/overview)以开始建置工作流程。
