---
sidebar_position: 12
---

# 自定义 RPC

自定义 RPC 资源允许您直接向以太坊节点发送原始 RPC 请求，使您能够访问任何 RPC 方法，包括标准方法、扩展方法或其他资源未涵盖的自定义方法。

## 操作

### Request（请求）

使用任何方法和参数发送自定义 RPC 请求。

**必需凭证**：Ethereum RPC

**参数**：
- **RPC Method**（RPC 方法）（必填）：RPC 方法名称（例如 `eth_getBalance`、`debug_traceTransaction`）
- **RPC Parameters**（RPC 参数）（选填）：RPC 方法的参数，格式为 JSON 阵列

**范例 - 获取余额**：
```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]
}
```

**输出**：
```json
{
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"],
  "result": "0x1bc16d674ec80000"
}
```

**范例 - 获取储存槽**：
```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"]
}
```

**输出**：
```json
{
  "method": "eth_getStorageAt",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"],
  "result": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

## 常见用例

### 调试交易

使用调试 RPC 方法追踪交易执行：

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": ["0x123...", {"tracer": "callTracer"}]
}
```

### 访问历史数据

从归档节点查询历史状态数据：

```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x1"]
}
```

### 使用自定义方法

访问节点特定或自定义 RPC 方法：

```json
{
  "rpcMethod": "eth_feeHistory",
  "rpcParams": [4, "latest", [25, 50, 75]]
}
```

### 获取储存槽

从合约中读取特定的储存槽：

```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0xContractAddress", "0x0", "latest"]
}
```

## 支援的 RPC 方法

### 标准以太坊方法

- **eth_getBalance**：获取帐户余额
- **eth_getStorageAt**：获取指定位置的储存值
- **eth_getTransactionCount**：获取交易计数（nonce）
- **eth_getCode**：获取合约程式码
- **eth_call**：执行合约调用
- **eth_estimateGas**：估算 gas 使用量
- **eth_getBlockByNumber**：透过区块号获取区块
- **eth_getBlockByHash**：透过区块杂凑获取区块
- **eth_getTransactionByHash**：透过杂凑获取交易
- **eth_getTransactionReceipt**：获取交易收据
- **eth_getLogs**：获取事件日志
- **eth_gasPrice**：获取当前 gas 价格
- **eth_feeHistory**：获取历史手续费数据
- **eth_getProof**：获取 Merkle 证明

### 调试方法（Geth）

- **debug_traceTransaction**：追踪交易执行
- **debug_traceCall**：追踪调用执行
- **debug_traceBlockByNumber**：追踪区块中的所有交易
- **debug_traceBlockByHash**：透过杂凑追踪区块

### 追踪方法（Parity/OpenEthereum）

- **trace_transaction**：追踪交易
- **trace_block**：追踪区块
- **trace_replayTransaction**：重放交易
- **trace_call**：追踪调用

### 自定义方法

- 您的以太坊节点公开的任何自定义 RPC 方法
- 网路特定方法（例如 Arbitrum、Optimism 扩展）
- 自定义索引器或中间件方法

## 范例

### 范例 1：获取区块交易数量

```json
{
  "rpcMethod": "eth_getBlockTransactionCountByNumber",
  "rpcParams": ["latest"]
}
```

### 范例 2：使用调用追踪器追踪交易

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": [
    "0x1234567890abcdef...",
    {
      "tracer": "callTracer",
      "tracerConfig": {
        "onlyTopCall": false
      }
    }
  ]
}
```

### 范例 3：获取证明

```json
{
  "rpcMethod": "eth_getProof",
  "rpcParams": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    ["0x0"],
    "latest"
  ]
}
```

### 范例 4：批次处理多个调用

您可以使用 n8n 的批次处理功能按顺序发送多个 RPC 请求：

```
输入项目 → 自定义 RPC（多个方法）→ 处理结果
```

## 提示

- **方法名称**：使用以太坊 JSON-RPC 规范中指定的确切 RPC 方法名称
- **参数**：始终以 JSON 阵列格式提供参数，即使只有单个参数
- **节点支援**：并非所有节点都支援所有方法（例如调试方法需要完整节点）
- **归档节点**：历史状态查询需要归档节点
- **自定义标头**：使用 RPC 凭证设定自定义标头以进行身份验证
- **错误处理**：启用「失败时继续」以优雅地处理不支援的方法
- **速率限制**：发送多个请求时请注意 RPC 提供商的速率限制

## 何时使用自定义 RPC

当您需要以下功能时使用自定义 RPC：

- 访问其他资源中不可用的方法
- 使用调试或追踪方法进行交易分析
- 使用特定区块参数查询历史状态数据
- 访问节点特定或网路特定的 RPC 方法
- 在专用资源支援之前原型化新功能
- 使用自定义或扩展的 RPC API

对于标准操作，建议使用专用资源（Account、Block、Transaction 等），因为它们提供更好的类型安全性和参数验证。
