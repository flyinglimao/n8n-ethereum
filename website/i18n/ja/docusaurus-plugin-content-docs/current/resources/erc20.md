---
sidebar_position: 5
---

# ERC20

ERC20リソースは、ABIを手動で指定することなくERC20トークンコントラクトとやり取りするための便利な操作を提供します。

## 概要

ERC20はEthereumで最も一般的なトークン規格です。このリソースはERC20 ABIを自動的に処理し、任意のERC20トークンとのやり取りを簡単にします。

**一般的なERC20トークン**：
- USDT（Tether）
- USDC（USD Coin）
- DAI（Dai Stablecoin）
- WETH（Wrapped Ether）
- その他数千のトークン...

## 操作

### Get Balance（残高を取得）

アドレスのトークン残高を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **Owner Address**（所有者アドレス）（必須）：残高を確認するアドレス
- **Format Decimals**（小数点形式）（オプション）：トークンの小数点を使用して出力を形式化（デフォルト：true）

**例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "formatDecimals": true
}
```

**出力**：
```json
{
  "balance": "1000.50",
  "decimals": 6,
  "rawBalance": "1000500000"
}
```

### Transfer（転送）

トークンを別のアドレスに転送します。

**必要な認証情報**：Ethereum RPC、Ethereum Account

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **To**（宛先）（必須）：受信者アドレス
- **Amount**（数量）（必須）：転送する数量（トークン単位で、小数点を使用して変換されます）

**例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "100.5"
}
```

**出力**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}
```

### Approve（承認）

別のアドレスがあなたの代わりにトークンを使用することを承認します。

**必要な認証情報**：Ethereum RPC、Ethereum Account

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **Spender**（支払者）（必須）：承認するアドレス
- **Amount**（数量）（必須）：承認する数量（最大承認には "unlimited" を使用）

**ユースケース**：
- トークンを交換するためにDEXコントラクトを承認
- トークンを預けるためにステーキングコントラクトを承認
- コントラクトの支出制限を設定

**例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  "amount": "unlimited"
}
```

### Transfer From（...から転送）

許可を使用してトークンを転送します（事前の承認が必要）。

**必要な認証情報**：Ethereum RPC、Ethereum Account

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **From**（送信元）（必須）：転送元アドレス
- **To**（宛先）（必須）：受信者アドレス
- **Amount**（数量）（必須）：転送する数量

**ユースケース**：
- プル支払い
- コントラクトベースのトークン転送
- 自動支払いシステム

### Get Allowance（許可額を取得）

支払者が所有者の代わりに使用できる金額を確認します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **Owner**（所有者）（必須）：トークン所有者アドレス
- **Spender**（支払者）（必須）：支払者アドレス
- **Format Decimals**（小数点形式）（オプション）：トークンの小数点を使用して出力を形式化

**例**：
```json
{
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "spender": "0x1111111254fb6c44bAC0beD2854e76F90643097d"
}
```

### Get Total Supply（総供給量を取得）

トークンの総供給量を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス
- **Format Decimals**（小数点形式）（オプション）：トークンの小数点を使用して出力を形式化

### Get Decimals（小数点を取得）

トークンが使用する小数点の数を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス

**出力**：
```json
{
  "decimals": 6
}
```

### Get Name（名前を取得）

トークン名を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス

**出力**：
```json
{
  "name": "USD Coin"
}
```

### Get Symbol（シンボルを取得）

トークンシンボルを取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Token Address**（トークンアドレス）（必須）：ERC20トークンコントラクトアドレス

**出力**：
```json
{
  "symbol": "USDC"
}
```

## 一般的なユースケース

### トークン残高を監視

```
[Schedule Trigger] → [ERC20: Get Balance] → [Check Threshold] → [Alert]
```

### 自動トークン転送

```
[Trigger] → [ERC20: Transfer] → [Wait For Transaction] → [Notification]
```

### DeFiへの承認と預け入れ

```
[Trigger] → [ERC20: Approve] → [Wait] → [Contract: Write - Deposit] → [Wait]
```

### Transfer Fromの前に許可額を確認

```
[Trigger] → [ERC20: Get Allowance] → [Conditional] → [ERC20: Transfer From]
```

## 一般的なトークンアドレス

### Ethereumメインネット

- **USDT**：`0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC**：`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **DAI**：`0x6B175474E89094C44Da98b954EedeAC495271d0F`
- **WETH**：`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Polygon

- **USDT**：`0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **USDC**：`0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **WMATIC**：`0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`

## ヒント

- **小数点**：ほとんどのトークンは18桁の小数点を使用しますが、一部（USDC、USDTなど）は6桁を使用します
- **小数点形式**：人間が読める数量を得るためにこれを有効にします
- **無制限承認**：最大uint256を承認するには数量に "unlimited" を使用します
- **残高確認**：転送前に常に残高を確認します
- **ガスコスト**：トークン転送はETH転送よりも多くのガスを消費します
- **承認パターン**：ほとんどのDeFiインタラクションには 承認 → インタラクト パターンが必要です
- **トークンアドレス**：常にEtherscanまたは公式ソースでトークンアドレスを検証します
