---
sidebar_position: 1
---

# 介绍

欢迎使用 **n8n-nodes-ethereum** 文档！这是一个为 n8n 提供全面以太坊区块链集成的社区节点包，采用 viem 构建的统一节点结构。

## 功能特性

- ✨ **统一节点结构**：使用资源/操作模式的单一以太坊节点，提供更清晰的用户体验
- 🔐 **安全凭证**：独立的 RPC 和账户凭证，读取操作可选钱包
- 🔄 **10 种资源类型**：账户、区块、交易、合约、ERC20、ERC721、ERC1155、ENS、Gas、工具
- ⚡ **触发器支持**：实时监控新区块、合约事件和交易
- 🌐 **多链支持**：支持以太坊、Polygon、BSC、Arbitrum、Optimism、Avalanche、Fantom、Base 和自定义网络
- 🪙 **完整代币标准**：ERC20、ERC721、ERC1155，自动处理 ABI
- 📦 **使用 viem 构建**：现代化、类型安全的以太坊交互 TypeScript 库

## 包含内容

本包包含两个强大的节点：

- **Ethereum 节点**：用于执行区块链操作的常规节点
- **Ethereum Trigger 节点**：用于监控区块链事件的触发器节点

## 快速开始

要开始使用 n8n-nodes-ethereum：

1. 在您的 n8n 实例中[安装包](./installation.md)
2. 为 RPC 和账户[配置凭证](./credentials.md)
3. 探索[可用资源](./resources/overview.md)以与区块链交互

## 使用场景

- 监控智能合约事件并发送通知
- 执行自动化代币转账
- 读取和写入智能合约数据
- 实时追踪区块链交易
- 集成 ENS 域名解析
- 构建 DeFi 自动化工作流
- 管理 NFT 操作

## 支持

如有问题、疑问或想要贡献，请访问我们的 [GitHub 仓库](https://github.com/flyinglimao/n8n-ethereum)。
