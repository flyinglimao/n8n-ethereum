---
sidebar_position: 9
---

# ENS

ENS（以太坊名称服务）资源提供解析域名和地址的操作。

## 概述

ENS 允许用户注册人类可读的名称（如「alice.eth」）而不是使用十六进制地址。

## 操作

### Get ENS Address（取得 ENS 地址）

将 ENS 名称解析为以太坊地址。

**所需凭证**：Ethereum RPC

**参数**：
- **ENS Name**（ENS 名称）（必需）：要解析的 ENS 名称（例如「vitalik.eth」）

**范例**：
```json
{
  "ensName": "vitalik.eth"
}
```

**输出**：
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### Get ENS Name（取得 ENS 名称）

反向解析地址为 ENS 名称。

**所需凭证**：Ethereum RPC

**参数**：
- **Address**（地址）（必需）：要解析的以太坊地址

**输出范例**：
```json
{
  "ensName": "vitalik.eth"
}
```

### Get ENS Avatar（取得 ENS 头像）

检索 ENS 名称的头像 URI。

**所需凭证**：Ethereum RPC

**参数**：
- **ENS Name**（ENS 名称）（必需）：要查询的 ENS 名称

**输出范例**：
```json
{
  "avatar": "https://..."
}
```

### Get ENS Text（取得 ENS 文字）

取得与 ENS 名称关联的文字记录。

**所需凭证**：Ethereum RPC

**参数**：
- **ENS Name**（ENS 名称）（必需）：要查询的 ENS 名称
- **Key**（键）（必需）：文字记录键（例如「email」、「url」、「twitter」、「github」）

**常见文字记录键**：
- `email`：电子邮件地址
- `url`：网站 URL
- `avatar`：头像图片 URL
- `description`：个人资料描述
- `notice`：通知讯息
- `keywords`：关键字
- `com.twitter`：Twitter 帐号
- `com.github`：GitHub 用户名
- `com.discord`：Discord 用户名

**范例**：
```json
{
  "ensName": "vitalik.eth",
  "key": "com.twitter"
}
```

**输出**：
```json
{
  "text": "VitalikButerin"
}
```

### Get ENS Resolver（取得 ENS 解析器）

取得 ENS 名称的解析器合约地址。

**所需凭证**：Ethereum RPC

**参数**：
- **ENS Name**（ENS 名称）（必需）：要查询的 ENS 名称

**输出范例**：
```json
{
  "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
}
```

## 常见使用场景

### 解析名称以进行付款

```
[Trigger] → [Get ENS Address] → [Send Transaction] → [确认]
```

### 显示用户个人资料

```
[Trigger] → [Get ENS Name] → [Get ENS Avatar] → [Get ENS Text: twitter] → [显示]
```

### 验证 ENS 域名

```
[Trigger] → [Get ENS Address] → [检查是否存在] → [动作]
```

## 提示

- **仅主网**：ENS 主要在以太坊主网上运行
- **不区分大小写**：ENS 名称不区分大小写
- **子域名**：ENS 支援子域名（例如「pay.alice.eth」）
- **反向解析**：并非所有地址都有反向记录
- **文字记录**：可以为任何 ENS 名称设定自定义文字记录
- **IPFS**：头像和内容记录通常使用 IPFS URL
