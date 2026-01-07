---
sidebar_position: 11
---

# Utils（ユーティリティ）

Utilsリソースは、フォーマット、エンコード、検証、その他のヘルパー操作のためのユーティリティ関数を提供します。

## 操作

### Format Units（単位をフォーマット）

weiを人間が読める形式に変換します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Value**（値）（必須）：wei単位の値
- **Decimals**（小数点）（オプション）：小数点の数（デフォルト：18）

**例**：
```json
{
  "value": "1000000000000000000",
  "decimals": 18
}
```

**出力**：
```json
{
  "formatted": "1.0"
}
```

### Parse Units（単位を解析）

人間が読める形式をweiに変換します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Value**（値）（必須）：人間が読める値
- **Decimals**（小数点）（オプション）：小数点の数（デフォルト：18）

**例**：
```json
{
  "value": "1.5",
  "decimals": 18
}
```

**出力**：
```json
{
  "parsed": "1500000000000000000"
}
```

### Get Chain ID（チェーンIDを取得）

現在のチェーン識別子を取得します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：なし

**出力例**：
```json
{
  "chainId": 1
}
```

**一般的なチェーンID**：
- `1`：Ethereumメインネット
- `5`：Goerliテストネット
- `11155111`：Sepoliaテストネット
- `137`：Polygonメインネット
- `56`：BNBスマートチェーン
- `42161`：Arbitrum One
- `10`：Optimism


**範例**：
```json
{
  "chainId": 1
}
```

### Validate Address（アドレスを検証）

Ethereumアドレスを検証してチェックサム化します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Address**（アドレス）（必須）：検証するアドレス

**例**：
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

**出力**：
```json
{
  "valid": true,
  "checksummed": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Encode Function Data（関数データをエンコード）

ABIから関数呼び出しデータをエンコードします。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ABI**（必須）：関数ABI
- **Function Name**（関数名）（必須）：関数の名前
- **Arguments**（引数）（オプション）：関数の引数

**ユースケース**：
- トランザクションデータを準備
- マルチコールペイロードを作成
- コントラクトインタラクションをエンコード


**範例**：
```json
{
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```


**輸出**：
```json
{
  "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```

### Decode Function Data（関数データをデコード）

ABIを使用して関数呼び出しデータをデコードします。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **ABI**（必須）：関数ABI
- **Data**（データ）（必須）：デコードするエンコードされたデータ

**ユースケース**：
- トランザクション入力を分析
- コントラクト呼び出しをデバッグ
- トランザクションデータを解析


**範例**：
```json
{
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```


**輸出**：
```json
{
  "functionName": "transfer",
  "args": {
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "1000000000000000000"
  }
}
```

### Encode Event Topics（イベントトピックをエンコード）

ログフィルタリング用のイベントトピックをエンコードします。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Event ABI**（イベントABI）（必須）：イベントABI
- **Arguments**（引数）（オプション）：インデックス付きパラメータ


**範例**：
```json
{
  "eventAbi": "{\"name\":\"Transfer\",\"type\":\"event\",\"inputs\":[{\"name\":\"from\",\"type\":\"address\",\"indexed\":true},{\"name\":\"to\",\"type\":\"address\",\"indexed\":true},{\"name\":\"value\",\"type\":\"uint256\"}]}",
  "args": {
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```


**輸出**：
```json
{
  "topics": [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb"
  ]
}
```

### Decode Event Log（イベントログをデコード）

ABIを使用してイベントログデータをデコードします。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Event ABI**（イベントABI）（必須）：イベントABI
- **Topics**（トピック）（必須）：ログトピック
- **Data**（データ）（必須）：ログデータ

**ユースケース**：
- イベントログを解析
- イベントパラメータを抽出
- 発行されたイベントを理解


**範例**：
```json
{
  "eventAbi": "{\"name\":\"Transfer\",\"type\":\"event\",\"inputs\":[{\"name\":\"from\",\"type\":\"address\",\"indexed\":true},{\"name\":\"to\",\"type\":\"address\",\"indexed\":true},{\"name\":\"value\",\"type\":\"uint256\"}]}",
  "topics": [
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    "0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb",
    "0x0000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d"
  ],
  "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000"
}
```


**輸出**：
```json
{
  "event": "Transfer",
  "args": {
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
    "value": "1000000000000000000"
  }
}
```

### Get Contract Address（コントラクトアドレスを取得）

CREATEまたはCREATE2デプロイアドレスを計算します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **From**（送信元）（必須）：デプロイヤーアドレス
- **Nonce**（オプション）：トランザクションnonce（CREATEの場合）
- **Bytecode Hash**（バイトコードハッシュ）（オプション）：バイトコードのKeccak256ハッシュ（CREATE2の場合）
- **Salt**（ソルト）（オプション）：CREATE2のソルト

**ユースケース**：
- コントラクトデプロイアドレスを予測
- デプロイアドレスを検証
- CREATE2アドレスを計算

## 一般的なユースケース


**範例**：
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "nonce": 5
}
```


**輸出**：
```json
{
  "address": "0x1234567890123456789012345678901234567890"
}
```

### トークン量をフォーマット

```
[Get Balance] → [Format Units] → [ユーザーに表示]
```

### ユーザー入力を検証

```
[ユーザー入力] → [Validate Address] → [有効な場合は続行]
```

### トランザクションデータをデコード

```
[Get Transaction] → [Decode Function Data] → [呼び出しを理解]
```

### イベントログを解析

```
[Get Logs] → [Decode Event Log] → [イベントを処理]
```

## ヒント

- **小数点**：ETHは18桁の小数点を使用しますが、トークンは任意の数を使用できます（一般的には6、8、または18）
- **チェックサム**：表示には常にチェックサム化されたアドレスを使用
- **チェーンID**：正しいネットワークにいることを確認するために使用
- **エンコード**：生のトランザクションを送信する前にデータをエンコード
- **CREATE2**：決定論的アドレスは反事実的デプロイに役立ちます
- **イベントデコード**：インデックス付きパラメータと非インデックスパラメータを自動的に処理
