---
sidebar_position: 2
---

# Account

Accountリソースは、Ethereumアカウント（アドレス）に関する情報を照会するための操作を提供します。

## 操作

### Get Balance（残高を取得）

アカウントのネイティブトークン残高（ETH）を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Address**（アドレス）（オプション）：照会するEthereumアドレス。提供されていない場合、Account認証情報からウォレットアドレスを使用
- **Format**（フォーマット）：出力形式を選択
  - `wei`：wei単位の生の残高（デフォルト）
  - `gwei`：gwei単位の残高（1 gwei = 10^9 wei）
  - `ether`：ether単位の残高（1 ether = 10^18 wei）
- **Block**（ブロック）：照会するブロック番号（デフォルト：latest）

**例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "format": "ether"
}
```

**出力**：
```json
{
  "balance": "1.234567890123456789"
}
```

### Get Transaction Count（トランザクション数を取得）

アカウントから送信されたトランザクションの数（nonceとも呼ばれる）を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Address**（アドレス）（オプション）：照会するEthereumアドレス。提供されていない場合、Account認証情報からウォレットアドレスを使用
- **Block**（ブロック）：照会するブロック番号（デフォルト：latest）

**ユースケース**：
- トランザクション送信の次のnonceを決定
- アカウントが送信したトランザクション数を確認
- アカウントのアクティビティを検証

**例**：
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**出力**：
```json
{
  "transactionCount": 42
}
```

### Get Code（コードを取得）

アドレスに保存されているバイトコードを取得します。アドレスがコントラクトでない場合は空を返します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Address**（アドレス）（必須）：照会するEthereumアドレス
- **Block**（ブロック）：照会するブロック番号（デフォルト：latest）

**ユースケース**：
- アドレスがスマートコントラクトかどうかを確認
- 検証のためにコントラクトバイトコードを取得
- コントラクトのデプロイを検証

**例**：
```json
{
  "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

**出力**：
```json
{
  "code": "0x608060405234801561001057600080fd5b50..."
}
```

コントラクトでない場合：
```json
{
  "code": "0x"
}
```

## 一般的なユースケース

### ウォレット残高を確認

トランザクションを実行する前にウォレット残高を監視：

```
[Schedule Trigger] → [Ethereum: Account - Get Balance] → [Condition] → [Alert if Low]
```

### コントラクトのデプロイを検証

コントラクトが正常にデプロイされたかを確認：

```
[Deploy Contract] → [Wait For Transaction] → [Get Code] → [Verify Code Exists]
```

### トランザクションの次のNonceを取得

トランザクションを送信する前に正しいnonceを取得：

```
[Trigger] → [Get Transaction Count] → [Use in Send Transaction]
```

## ヒント

- **アドレス形式**：すべてのアドレスは有効なEthereumアドレス（0xの後に40個の16進数文字）である必要があります
- **オプションのアドレス**：アドレスが提供されていない場合、ノードはAccount認証情報からウォレットアドレスを使用します
- **残高フォーマット**：人間が読めるフォーマットには`ether`形式を、正確な計算には`wei`を使用
- **コントラクト検出**：`getCode`が空でない値（"0x"ではない）を返す場合、アドレスはコントラクトです
