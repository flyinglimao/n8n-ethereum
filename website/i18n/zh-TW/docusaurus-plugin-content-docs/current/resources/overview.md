---
sidebar_position: 1
---

# 资源概览

以太坊节点提供对各种区块链资源的访问。每个资源包含用于与以太坊区块链不同方面交互的特定操作。

## 可用资源

### 核心区块链资源

- **[Account](account)**（账户）：查询账户余额、交易计数和合约代码
- **[Block](/docs/resources/block)**（区块）：检索区块信息和当前区块链高度
- **[Transaction](/docs/resources/transaction)**（交易）：发送交易、检查状态和估算 Gas 成本
- **[Gas](/docs/resources/gas)**：获取 Gas 价格和费用历史以优化交易定价

### 智能合约资源

- **[Contract](/docs/resources/contract)**（合约）：读取和写入智能合约、部署新合约和查询事件日志
- **[ERC20](erc20)**：与 ERC20 代币合约交互（转账、授权、余额）
- **[ERC721](/docs/resources/erc721)**：管理 ERC721 NFT 操作（转账、所有权、元数据）
- **[ERC1155](/docs/resources/erc1155)**：使用 ERC1155 多代币标准（批量操作、余额）

### 实用工具资源

- **[ENS](/docs/resources/ens)**：解析以太坊名称服务域名和反向查找
- **[Signature](/docs/resources/signature)**（签名）：签名和验证消息和类型化数据（EIP-712）
- **[Utils](/docs/resources/utils)**（工具）：格式化、编码和验证的实用函数

## 资源选择

使用以太坊节点时：

1. 从下拉菜单中选择 **Resource**（资源）
2. 在该资源内选择 **Operation**（操作）
3. 配置操作特定的参数
4. 添加所需的凭证（所有操作需要 RPC，写入操作需要 Account）

## 快速参考

### 只读操作（仅需 RPC）

这些操作仅需要 **Ethereum RPC** 凭证：

| 资源 | 操作 |
|------|------|
| Account | Get Balance、Get Transaction Count、Get Code |
| Block | Get Block、Get Block Number |
| Transaction | Get Transaction、Get Transaction Receipt |
| Contract | Read Contract、Multicall、Simulate Contract、Get Logs |
| ERC20 | Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol |
| ERC721 | Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI |
| ERC1155 | Balance Of、Balance Of Batch、Is Approved For All、URI |
| ENS | 所有操作 |
| Gas | 所有操作 |
| Utils | 大多数操作 |

### 写入操作（RPC + Account）

这些操作需要 **Ethereum RPC** 和 **Ethereum Account** 凭证：

| 资源 | 操作 |
|------|------|
| Transaction | Send Transaction、Wait For Transaction |
| Contract | Write Contract、Deploy Contract |
| ERC20 | Transfer、Approve、Transfer From |
| ERC721 | Transfer From、Safe Transfer From、Approve、Set Approval For All |
| ERC1155 | Safe Transfer From、Safe Batch Transfer From、Set Approval For All |
| Signature | Sign Message、Sign Typed Data |

## 常见模式

### 读取区块链数据

```
[Schedule Trigger] → [Ethereum: Contract - Read Contract] → [Process Data]
```

### 执行交易

```
[Trigger] → [Ethereum: Contract - Write Contract] → [Ethereum: Transaction - Wait For Transaction] → [Notification]
```

### 代币操作

```
[Trigger] → [Ethereum: ERC20 - Transfer] → [Ethereum: Transaction - Wait For Transaction] → [Store Result]
```

### 事件监控

```
[Ethereum Trigger: Event] → [Process Event Data] → [Action]
```

## 下一步

详细探索每个资源以了解特定操作和参数：

- 从 [Account](account) 开始进行基本的区块链查询
- 了解 [Transactions](/docs/resources/transaction) 以发送 ETH
- 深入了解 [Contract](/docs/resources/contract) 进行智能合约交互
- 探索代币标准：[ERC20](erc20)、[ERC721](/docs/resources/erc721)、[ERC1155](/docs/resources/erc1155)
