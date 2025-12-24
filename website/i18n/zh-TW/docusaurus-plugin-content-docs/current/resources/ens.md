---
sidebar_position: 9
---

# ENS

ENS（以太坊名稱服務）資源提供解析域名和地址的操作。

## 概述

ENS 允許用戶註冊人類可讀的名稱（如「alice.eth」）而不是使用十六進制地址。

## 操作

### Get ENS Address（取得 ENS 地址）

將 ENS 名稱解析為以太坊地址。

**所需憑證**：Ethereum RPC

**參數**：
- **ENS Name**（ENS 名稱）（必需）：要解析的 ENS 名稱（例如「vitalik.eth」）

**範例**：
```json
{
  "ensName": "vitalik.eth"
}
```

**輸出**：
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### Get ENS Name（取得 ENS 名稱）

反向解析地址為 ENS 名稱。

**所需憑證**：Ethereum RPC

**參數**：
- **Address**（地址）（必需）：要解析的以太坊地址

**輸出範例**：
```json
{
  "ensName": "vitalik.eth"
}
```

### Get ENS Avatar（取得 ENS 頭像）

檢索 ENS 名稱的頭像 URI。

**所需憑證**：Ethereum RPC

**參數**：
- **ENS Name**（ENS 名稱）（必需）：要查詢的 ENS 名稱

**輸出範例**：
```json
{
  "avatar": "https://..."
}
```

### Get ENS Text（取得 ENS 文字）

取得與 ENS 名稱關聯的文字記錄。

**所需憑證**：Ethereum RPC

**參數**：
- **ENS Name**（ENS 名稱）（必需）：要查詢的 ENS 名稱
- **Key**（鍵）（必需）：文字記錄鍵（例如「email」、「url」、「twitter」、「github」）

**常見文字記錄鍵**：
- `email`：電子郵件地址
- `url`：網站 URL
- `avatar`：頭像圖片 URL
- `description`：個人資料描述
- `notice`：通知訊息
- `keywords`：關鍵字
- `com.twitter`：Twitter 帳號
- `com.github`：GitHub 用戶名
- `com.discord`：Discord 用戶名

**範例**：
```json
{
  "ensName": "vitalik.eth",
  "key": "com.twitter"
}
```

**輸出**：
```json
{
  "text": "VitalikButerin"
}
```

### Get ENS Resolver（取得 ENS 解析器）

取得 ENS 名稱的解析器合約地址。

**所需憑證**：Ethereum RPC

**參數**：
- **ENS Name**（ENS 名稱）（必需）：要查詢的 ENS 名稱

**輸出範例**：
```json
{
  "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
}
```

## 常見使用場景

### 解析名稱以進行付款

```
[Trigger] → [Get ENS Address] → [Send Transaction] → [確認]
```

### 顯示用戶個人資料

```
[Trigger] → [Get ENS Name] → [Get ENS Avatar] → [Get ENS Text: twitter] → [顯示]
```

### 驗證 ENS 域名

```
[Trigger] → [Get ENS Address] → [檢查是否存在] → [動作]
```

## 提示

- **僅主網**：ENS 主要在以太坊主網上運行
- **不區分大小寫**：ENS 名稱不區分大小寫
- **子域名**：ENS 支援子域名（例如「pay.alice.eth」）
- **反向解析**：並非所有地址都有反向記錄
- **文字記錄**：可以為任何 ENS 名稱設定自定義文字記錄
- **IPFS**：頭像和內容記錄通常使用 IPFS URL
