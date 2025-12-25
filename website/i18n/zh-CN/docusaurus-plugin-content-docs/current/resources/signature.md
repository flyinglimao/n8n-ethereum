---
sidebar_position: 10
---

# Signature（签名）

Signature 资源提供签名和验证讯息和类型化资料的操作。

## 概述

数位签名用于证明地址的所有权并在不泄露私钥的情况下验证讯息。

## 操作

### Sign Message（签名讯息）

使用您的钱包签署个人讯息。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Message**（讯息）（必需）：要签署的讯息

**使用场景**：
- 验证用户
- 证明地址所有权
- 签署链下讯息

**范例**：
```json
{
  "message": "I agree to the terms and conditions"
}
```

**输出**：
```json
{
  "signature": "0x1234567890abcdef..."
}
```

### Sign Typed Data（签名类型化资料）

根据 EIP-712 签署结构化资料。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（类型）（必需）：类型定义
- **Value**（值）（必需）：要签署的资料

**使用场景**：
- 签署 permit 交易（无 Gas 批准）
- 为 dApp 签署结构化讯息
- 为复杂资料创建可验证签名

### Verify Message（验证讯息）

验证个人讯息签名。

**所需凭证**：Ethereum RPC

**参数**：
- **Message**（讯息）（必需）：原始讯息
- **Signature**（签名）（必需）：要验证的签名
- **Address**（地址）（必需）：预期签名者地址

**输出范例**：
```json
{
  "valid": true,
  "recoveredAddress": "0x..."
}
```

### Verify Typed Data（验证类型化资料）

验证 EIP-712 签名。

**所需凭证**：Ethereum RPC

**参数**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（类型）（必需）：类型定义
- **Value**（值）（必需）：原始资料
- **Signature**（签名）（必需）：要验证的签名
- **Address**（地址）（必需）：预期签名者地址

### Recover Address（恢复地址）

从签名中恢复签名者地址。

**所需凭证**：Ethereum RPC

**参数**：
- **Message**（讯息）（必需）：原始讯息
- **Signature**（签名）（必需）：签名

**输出范例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Hash Message（杂凑讯息）

计算讯息的 keccak256 杂凑。

**所需凭证**：Ethereum RPC

**参数**：
- **Message**（讯息）（必需）：要杂凑的讯息

**输出范例**：
```json
{
  "hash": "0x1234567890abcdef..."
}
```

### Hash Typed Data（杂凑类型化资料）

杂凑类型化资料以进行签名（EIP-712）。

**所需凭证**：Ethereum RPC

**参数**：
- **Domain**（域）（必需）：EIP-712 域分隔符
- **Types**（类型）（必需）：类型定义
- **Value**（值）（必需）：要杂凑的资料

## 常见使用场景

### 用户验证

```
[Trigger] → [Sign Message] → [Verify Message] → [验证用户]
```

### 无 Gas 批准（EIP-2612）

```
[Trigger] → [Sign Typed Data: Permit] → [提交到合约] → [代币已批准]
```

### 验证所有权

```
[用户输入] → [Recover Address] → [检查所有权] → [授予存取权限]
```

## EIP-712 域范例

```json
{
  "name": "MyDApp",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0x..."
}
```

## 提示

- **个人签名**：使用 Sign Message 进行简单文字验证
- **EIP-712**：用于需要人类可读的结构化资料
- **安全性**：切勿签署您不理解的讯息
- **验证**：在信任签名之前始终验证它们
- **恢复**：Recover Address 可以识别谁签署了讯息
- **链 ID**：在 EIP-712 中包含链 ID 以防止重放攻击
