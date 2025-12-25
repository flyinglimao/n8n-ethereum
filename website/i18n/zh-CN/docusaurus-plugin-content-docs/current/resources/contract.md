---
sidebar_position: 5
---

# Contract（合约）

Contract 资源提供与以太坊区块链上智能合约互动的操作。

## 操作

### Read Contract（读取合约）

呼叫智能合约上的唯读（view/pure）函数。

**所需凭证**：Ethereum RPC

**参数**：
- **Contract Address**（合约地址）（必需）：智能合约地址
- **ABI**（必需）：合约 ABI（应用程式二进位介面）JSON 格式
- **Function Name**（函数名称）（必需）：要呼叫的函数名称
- **Function Arguments**（函数参数）（可选）：函数的参数，JSON 阵列格式
- **Block**（区块）（可选）：要查询的区块号（预设：latest）

**范例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"balanceOf\",\"type\":\"function\",\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}]}]",
  "functionName": "balanceOf",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\"]"
}
```

**输出**：
```json
{
  "result": "1000000000000000000"
}
```

### Write Contract（写入合约）

在智能合约上执行状态变更函数。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Contract Address**（合约地址）（必需）：智能合约地址
- **ABI**（必需）：合约 ABI JSON 格式
- **Function Name**（函数名称）（必需）：要呼叫的函数名称
- **Function Arguments**（函数参数）（可选）：函数的参数，JSON 阵列格式
- **Value**（价值）（可选）：随交易发送的 ETH（以 ether 为单位）
- **Gas Limit**（Gas 限制）（可选）：使用的最大 Gas
- **Max Fee Per Gas**（每 Gas 最大费用）（可选）：每 Gas 的最大总费用
- **Max Priority Fee Per Gas**（每 Gas 最大优先费用）（可选）：每 Gas 的最大优先费用

**范例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```

**输出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

### Deploy Contract（部署合约）

将新智能合约部署到区块链。

**所需凭证**：Ethereum RPC、Ethereum Account

**参数**：
- **Bytecode**（字节码）（必需）：合约字节码（来自编译）
- **ABI**（必需）：合约 ABI
- **Constructor Arguments**（建构函数参数）（可选）：建构函数的参数
- **Value**（价值）（可选）：随部署发送的 ETH
- **Gas Limit**（Gas 限制）（可选）：使用的最大 Gas

**范例**：
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"_name\",\"type\":\"string\"}]}]",
  "args": "[\"MyToken\"]"
}
```

**输出**：
```json
{
  "hash": "0x1234567890abcdef...",
  "contractAddress": "0xNewContractAddress..."
}
```

### Multicall（多重呼叫）

将多个读取操作批次处理为单一呼叫以提高效率。

**所需凭证**：Ethereum RPC

**参数**：
- **Calls**（呼叫）（必需）：要执行的呼叫阵列
  - 每个呼叫包含：合约地址、ABI、函数名称、参数

**使用场景**：
- 在单一呼叫中从一个或多个合约读取多个值
- 减少 RPC 呼叫并提高效能
- 确保所有读取都来自同一区块

### Simulate Contract（模拟合约）

在不发送交易的情况下测试合约呼叫。

**所需凭证**：Ethereum RPC

**参数**：
- **Contract Address**（合约地址）（必需）：智能合约地址
- **ABI**（必需）：合约 ABI
- **Function Name**（函数名称）（必需）：函数名称
- **Function Arguments**（函数参数）（可选）：函数的参数
- **Value**（价值）（可选）：模拟发送的 ETH
- **From**（发送者）（可选）：模拟呼叫的地址

**使用场景**：
- 发送前测试交易
- 验证合约行为
- 检查回退原因

### Get Logs（取得日志）

从智能合约查询历史事件日志。

**所需凭证**：Ethereum RPC

**参数**：
- **Contract Address**（合约地址）（可选）：按合约地址筛选
- **Event ABI**（事件 ABI）（必需）：要解码的事件 ABI
- **From Block**（起始区块）（可选）：起始区块号
- **To Block**（结束区块）（可选）：结束区块号
- **Topics**（主题）（可选）：按索引事件参数筛选

**使用场景**：
- 查询历史事件
- 追踪代币转帐
- 监控合约活动

## 常见使用场景

### 读取合约状态

```
[Schedule Trigger] → [Read Contract] → [储存资料]
```

### 执行合约函数

```
[Trigger] → [Write Contract] → [Wait For Transaction] → [成功处理器]
```

### 部署并初始化合约

```
[Trigger] → [Deploy Contract] → [Wait For Transaction] → [Write Contract] → [初始化]
```

### 查询历史事件

```
[Schedule Trigger] → [Get Logs] → [处理事件] → [储存到资料库]
```

## ABI 格式

ABI（应用程式二进位介面）定义合约的介面。您可以从以下位置取得：

- Etherscan 上的合约验证
- 编译器输出（Hardhat、Foundry 等）
- 合约文档

**最小 ABI 范例**：
```json
[
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [
      {"name": "", "type": "bool"}
    ]
  }
]
```

## 提示

- **ABI 需求**：ABI 中只包含您需要的函数/事件
- **参数格式**：始终以 JSON 阵列字串提供参数
- **Gas 估算**：对于写入操作，除非有特定要求，否则让节点估算 Gas
- **Multicall**：用于批次读取以节省 RPC 呼叫并确保一致性
- **事件筛选**：在事件中使用索引参数以实现高效筛选
- **模拟**：在执行前始终模拟复杂交易
- **区块号**：对于历史查询，请注意 RPC 提供商的区块范围限制
