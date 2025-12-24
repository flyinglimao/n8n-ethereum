---
sidebar_position: 5
---

# Contract

Contractリソースは、Ethereumブロックチェーン上のスマートコントラクトとやり取りするための操作を提供します。

## 操作

### Read Contract（コントラクトを読む）

スマートコントラクトの読み取り専用（view/pure）関数を呼び出します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Contract Address**（コントラクトアドレス）（必須）：スマートコントラクトアドレス
- **ABI**（必須）：コントラクトABI（Application Binary Interface）JSON形式
- **Function Name**（関数名）（必須）：呼び出す関数の名前
- **Function Arguments**（関数引数）（オプション）：関数の引数、JSON配列形式
- **Block**（ブロック）（オプション）：照会するブロック番号（デフォルト：latest）

**例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"balanceOf\",\"type\":\"function\",\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}]}]",
  "functionName": "balanceOf",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\"]"
}
```

**出力**：
```json
{
  "result": "1000000000000000000"
}
```

### Write Contract（コントラクトに書き込む）

スマートコントラクトで状態を変更する関数を実行します。

**必要な認証情報**：Ethereum RPC、Ethereum Account

**パラメータ**：
- **Contract Address**（コントラクトアドレス）（必須）：スマートコントラクトアドレス
- **ABI**（必須）：コントラクトABI JSON形式
- **Function Name**（関数名）（必須）：呼び出す関数の名前
- **Function Arguments**（関数引数）（オプション）：関数の引数、JSON配列形式
- **Value**（値）（オプション）：トランザクションで送信するETH（ether単位）
- **Gas Limit**（ガス制限）（オプション）：使用する最大ガス
- **Max Fee Per Gas**（ガスあたりの最大手数料）（オプション）：ガスあたりの最大合計手数料
- **Max Priority Fee Per Gas**（ガスあたりの最大優先手数料）（オプション）：ガスあたりの最大優先手数料

**例**：
```json
{
  "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "abi": "[{\"name\":\"transfer\",\"type\":\"function\",\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]}]",
  "functionName": "transfer",
  "args": "[\"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\", \"1000000000000000000\"]"
}
```

**出力**：
```json
{
  "hash": "0x1234567890abcdef...",
  "from": "0xYourAddress...",
  "to": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
```

### Deploy Contract（コントラクトをデプロイ）

新しいスマートコントラクトをブロックチェーンにデプロイします。

**必要な認証情報**：Ethereum RPC、Ethereum Account

**パラメータ**：
- **Bytecode**（バイトコード）（必須）：コントラクトバイトコード（コンパイルから）
- **ABI**（必須）：コントラクトABI
- **Constructor Arguments**（コンストラクタ引数）（オプション）：コンストラクタの引数
- **Value**（値）（オプション）：デプロイで送信するETH
- **Gas Limit**（ガス制限）（オプション）：使用する最大ガス

**例**：
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"_name\",\"type\":\"string\"}]}]",
  "args": "[\"MyToken\"]"
}
```

**出力**：
```json
{
  "hash": "0x1234567890abcdef...",
  "contractAddress": "0xNewContractAddress..."
}
```

### Multicall（マルチコール）

効率化のために複数の読み取り操作を1回の呼び出しにバッチ処理します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Calls**（呼び出し）（必須）：実行する呼び出しの配列
  - 各呼び出しには：コントラクトアドレス、ABI、関数名、引数が含まれます

**ユースケース**：
- 1回の呼び出しで1つまたは複数のコントラクトから複数の値を読み取る
- RPC呼び出しを削減してパフォーマンスを向上
- すべての読み取りが同じブロックから行われることを保証

### Simulate Contract（コントラクトをシミュレート）

トランザクションを送信せずにコントラクト呼び出しをテストします。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Contract Address**（コントラクトアドレス）（必須）：スマートコントラクトアドレス
- **ABI**（必須）：コントラクトABI
- **Function Name**（関数名）（必須）：関数の名前
- **Function Arguments**（関数引数）（オプション）：関数の引数
- **Value**（値）（オプション）：送信をシミュレートするETH
- **From**（送信者）（オプション）：呼び出しをシミュレートするアドレス

**ユースケース**：
- 送信前にトランザクションをテスト
- コントラクトの動作を検証
- リバート理由を確認

### Get Logs（ログを取得）

スマートコントラクトから履歴イベントログを照会します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **Contract Address**（コントラクトアドレス）（オプション）：コントラクトアドレスでフィルタリング
- **Event ABI**（イベントABI）（必須）：デコードするイベントのABI
- **From Block**（開始ブロック）（オプション）：開始ブロック番号
- **To Block**（終了ブロック）（オプション）：終了ブロック番号
- **Topics**（トピック）（オプション）：インデックス付きイベントパラメータでフィルタリング

**ユースケース**：
- 履歴イベントを照会
- トークン転送を追跡
- コントラクトアクティビティを監視

## 一般的なユースケース

### コントラクトの状態を読む

```
[Schedule Trigger] → [Read Contract] → [データを保存]
```

### コントラクト関数を実行

```
[Trigger] → [Write Contract] → [Wait For Transaction] → [成功ハンドラー]
```

### コントラクトをデプロイして初期化

```
[Trigger] → [Deploy Contract] → [Wait For Transaction] → [Write Contract] → [初期化]
```

### 履歴イベントを照会

```
[Schedule Trigger] → [Get Logs] → [イベントを処理] → [データベースに保存]
```

## ABI形式

ABI（Application Binary Interface）はコントラクトのインターフェースを定義します。次の場所から取得できます：

- Etherscanでのコントラクト検証
- コンパイラ出力（Hardhat、Foundryなど）
- コントラクトドキュメント

**最小ABI例**：
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

## ヒント

- **ABI要件**：ABIには必要な関数/イベントのみを含める
- **引数形式**：常にJSON配列文字列として引数を提供
- **ガス見積もり**：書き込み操作の場合、特定の要件がない限りノードにガスを見積もらせる
- **Multicall**：バッチ読み取りに使用してRPC呼び出しを節約し、一貫性を確保
- **イベントフィルタリング**：効率的なフィルタリングのためにイベントでインデックス付きパラメータを使用
- **シミュレーション**：実行前に常に複雑なトランザクションをシミュレート
- **ブロック番号**：履歴照会の場合、RPCプロバイダーのブロック範囲制限に注意
