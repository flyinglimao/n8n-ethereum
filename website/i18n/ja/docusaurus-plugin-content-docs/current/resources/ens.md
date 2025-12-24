---
sidebar_position: 9
---

# ENS

ENS（Ethereum Name Service）リソースは、ドメイン名とアドレスを解決するための操作を提供します。

## 概要

ENSにより、ユーザーは16進数アドレスの代わりに人間が読める名前（「alice.eth」など）を登録できます。

## 操作

### Get ENS Address（ENSアドレスを取得）

ENS名をEthereumアドレスに解決します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ENS Name**（ENS名）（必須）：解決するENS名（例：「vitalik.eth」）

**例**：
```json
{
  "ensName": "vitalik.eth"
}
```

**出力**：
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### Get ENS Name（ENS名を取得）

アドレスをENS名に逆解決します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Address**（アドレス）（必須）：解決するEthereumアドレス

**出力例**：
```json
{
  "ensName": "vitalik.eth"
}
```

### Get ENS Avatar（ENSアバターを取得）

ENS名のアバターURIを取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ENS Name**（ENS名）（必須）：照会するENS名

**出力例**：
```json
{
  "avatar": "https://..."
}
```

### Get ENS Text（ENSテキストを取得）

ENS名に関連付けられたテキストレコードを取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ENS Name**（ENS名）（必須）：照会するENS名
- **Key**（キー）（必須）：テキストレコードキー（例：「email」、「url」、「twitter」、「github」）

**一般的なテキストレコードキー**：
- `email`：メールアドレス
- `url`：ウェブサイトURL
- `avatar`：アバター画像URL
- `description`：プロフィール説明
- `notice`：通知メッセージ
- `keywords`：キーワード
- `com.twitter`：Twitterハンドル
- `com.github`：GitHubユーザー名
- `com.discord`：Discordユーザー名

**例**：
```json
{
  "ensName": "vitalik.eth",
  "key": "com.twitter"
}
```

**出力**：
```json
{
  "text": "VitalikButerin"
}
```

### Get ENS Resolver（ENSリゾルバーを取得）

ENS名のリゾルバーコントラクトアドレスを取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ENS Name**（ENS名）（必須）：照会するENS名

**出力例**：
```json
{
  "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
}
```

## 一般的なユースケース

### 支払いのために名前を解決

```
[Trigger] → [Get ENS Address] → [Send Transaction] → [確認]
```

### ユーザープロフィールを表示

```
[Trigger] → [Get ENS Name] → [Get ENS Avatar] → [Get ENS Text: twitter] → [表示]
```

### ENSドメインを検証

```
[Trigger] → [Get ENS Address] → [存在するかチェック] → [アクション]
```

## ヒント

- **メインネットのみ**：ENSは主にEthereumメインネットで動作
- **大文字小文字を区別しない**：ENS名は大文字小文字を区別しません
- **サブドメイン**：ENSはサブドメインをサポート（例：「pay.alice.eth」）
- **逆解決**：すべてのアドレスに逆レコードがあるわけではありません
- **テキストレコード**：任意のENS名にカスタムテキストレコードを設定できます
- **IPFS**：アバターとコンテンツレコードはしばしばIPFS URLを使用
