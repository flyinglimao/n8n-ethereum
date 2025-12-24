---
sidebar_position: 1
---

# Introduction

Welcome to **n8n-nodes-ethereum** documentation! This community node package provides comprehensive Ethereum blockchain integration for n8n with a unified node structure using viem.

## Features

- ✨ **Unified Node Structure**: Single Ethereum node with Resource/Operation pattern for cleaner UX
- 🔐 **Secure Credentials**: Separate RPC and Account credentials with optional wallet for read operations
- 🔄 **10 Resource Types**: Account, Block, Transaction, Contract, ERC20, ERC721, ERC1155, ENS, Gas, Utils
- ⚡ **Trigger Support**: Monitor new blocks, contract events, and transactions in real-time
- 🌐 **Multi-Chain**: Supports Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Fantom, Base, and custom networks
- 🪙 **Complete Token Standards**: ERC20, ERC721, ERC1155 with automatic ABI handling
- 📦 **Built with viem**: Modern, type-safe TypeScript library for Ethereum interactions

## What's Included

This package includes two powerful nodes:

- **Ethereum Node**: Regular node for executing blockchain operations
- **Ethereum Trigger Node**: Trigger node for monitoring blockchain events

## Getting Started

To get started with n8n-nodes-ethereum:

1. [Install the package](installation) in your n8n instance
2. [Configure credentials](credentials) for RPC and Account
3. Explore the [available resources](resources/overview) to interact with the blockchain

## Use Cases

- Monitor smart contract events and send notifications
- Execute automated token transfers
- Read and write smart contract data
- Track blockchain transactions in real-time
- Integrate ENS domain resolution
- Build DeFi automation workflows
- Manage NFT operations

## Support

For issues, questions, or contributions, visit our [GitHub repository](https://github.com/flyinglimao/n8n-ethereum).
