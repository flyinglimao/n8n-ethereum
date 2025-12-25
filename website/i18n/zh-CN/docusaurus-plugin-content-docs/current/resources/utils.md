---
sidebar_position: 11
---

# Utils（工具）

Utils 资源提供格式化、编码、验证和其他辅助操作的实用函数。

## 操作

### Format Units（格式化单位）

将 wei 转换为人类可读的格式。

**所需凭证**：Ethereum RPC

**参数**：
- **Value**（值）（必需）：wei 单位的值
- **Decimals**（小数位数）（可选）：小数位数（预设：18）

**范例**：
```json
{
  "value": "1000000000000000000",
  "decimals": 18
}
```

**输出**：
```json
{
  "formatted": "1.0"
}
```

### Parse Units（解析单位）

将人类可读的格式转换为 wei。

**所需凭证**：Ethereum RPC

**参数**：
- **Value**（值）（必需）：人类可读的值
- **Decimals**（小数位数）（可选）：小数位数（预设：18）

**范例**：
```json
{
  "value": "1.5",
  "decimals": 18
}
```

**输出**：
```json
{
  "parsed": "1500000000000000000"
}
```

### Get Chain ID（取得链 ID）

检索当前链识别符。

**所需凭证**：Ethereum RPC

**参数**：无

**输出范例**：
```json
{
  "chainId": 1
}
```

**常见链 ID**：
- `1`：以太坊主网
- `5`：Goerli 测试网
- `11155111`：Sepolia 测试网
- `137`：Polygon 主网
- `56`：BNB 智能链
- `42161`：Arbitrum One
- `10`：Optimism

### Validate Address（验证地址）

验证并校验和以太坊地址。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（必需）：要验证的地址

**范例**：
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

**输出**：
```json
{
  "valid": true,
  "checksummed": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Encode Function Data（编码函数资料）

从 ABI 编码函数呼叫资料。

**所需凭证**：Ethereum RPC

**参数**：
- **ABI**（必需）：函数 ABI
- **Function Name**（函数名称）（必需）：函数名称
- **Arguments**（参数）（可选）：函数参数

**使用场景**：
- 准备交易资料
- 创建 multicall 负载
- 编码合约互动

### Decode Function Data（解码函数资料）

使用 ABI 解码函数呼叫资料。

**所需凭证**：Ethereum RPC

**参数**：
- **ABI**（必需）：函数 ABI
- **Data**（资料）（必需）：要解码的编码资料

**使用场景**：
- 分析交易输入
- 除错合约呼叫
- 解析交易资料

### Encode Event Topics（编码事件主题）

为日志筛选编码事件主题。

**所需凭证**：Ethereum RPC

**参数**：
- **Event ABI**（事件 ABI）（必需）：事件 ABI
- **Arguments**（参数）（可选）：索引参数

### Decode Event Log（解码事件日志）

使用 ABI 解码事件日志资料。

**所需凭证**：Ethereum RPC

**参数**：
- **Event ABI**（事件 ABI）（必需）：事件 ABI
- **Topics**（主题）（必需）：日志主题
- **Data**（资料）（必需）：日志资料

**使用场景**：
- 解析事件日志
- 提取事件参数
- 理解发出的事件

### Get Contract Address（取得合约地址）

计算 CREATE 或 CREATE2 部署地址。

**所需凭证**：Ethereum RPC

**参数**：
- **From**（来源）（必需）：部署者地址
- **Nonce**（可选）：交易 nonce（用于 CREATE）
- **Bytecode Hash**（字节码杂凑）（可选）：字节码的 Keccak256 杂凑（用于 CREATE2）
- **Salt**（盐）（可选）：CREATE2 的盐

**使用场景**：
- 预测合约部署地址
- 验证部署地址
- 计算 CREATE2 地址

## 常见使用场景

### 格式化代币数量

```
[Get Balance] → [Format Units] → [显示给用户]
```

### 验证用户输入

```
[用户输入] → [Validate Address] → [如有效则继续]
```

### 解码交易资料

```
[Get Transaction] → [Decode Function Data] → [理解呼叫]
```

### 解析事件日志

```
[Get Logs] → [Decode Event Log] → [处理事件]
```

## 提示

- **小数位数**：ETH 使用 18 位小数，但代币可以使用任何数量（通常为 6、8 或 18）
- **校验和**：始终使用校验和地址进行显示
- **链 ID**：用于验证您在正确的网路上
- **编码**：在发送原始交易之前编码资料
- **CREATE2**：确定性地址对反事实部署很有用
- **事件解码**：自动处理索引与非索引参数
