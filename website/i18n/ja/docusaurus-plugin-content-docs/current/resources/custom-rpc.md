---
sidebar_position: 12
---

# カスタム RPC

カスタム RPC リソースを使用すると、Ethereum ノードに直接生の RPC リクエストを送信でき、標準メソッド、拡張メソッド、または他のリソースでカバーされていないカスタムメソッドを含む、あらゆる RPC メソッドにアクセスできます。

## 操作

### Request（リクエスト）

任意のメソッドとパラメータでカスタム RPC リクエストを送信します。

**必要な認証情報**：Ethereum RPC

**パラメータ**：
- **RPC Method**（RPC メソッド）（必須）：RPC メソッド名（例：`eth_getBalance`、`debug_traceTransaction`）
- **RPC Parameters**（RPC パラメータ）（オプション）：RPC メソッドのパラメータ（JSON 配列形式）

**例 - 残高の取得**：
```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]
}
```

**出力**：
```json
{
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"],
  "result": "0x1bc16d674ec80000"
}
```

**例 - ストレージスロットの取得**：
```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"]
}
```

**出力**：
```json
{
  "method": "eth_getStorageAt",
  "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x0", "latest"],
  "result": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

## 一般的な使用例

### トランザクションのデバッグ

デバッグ RPC メソッドを使用してトランザクションの実行をトレースします：

```json
{
  "rpcMethod": "debug_traceTransaction",
  "rpcParams": ["0x123...", {"tracer": "callTracer"}]
}
```

### アーカイブデータへのアクセス

アーカイブノードから履歴状態データをクエリします：

```json
{
  "rpcMethod": "eth_getBalance",
  "rpcParams": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x1"]
}
```

### カスタムメソッドの使用

ノード固有またはカスタム RPC メソッドにアクセスします：

```json
{
  "rpcMethod": "eth_feeHistory",
  "rpcParams": [4, "latest", [25, 50, 75]]
}
```

### ストレージスロットの取得

コントラクトから特定のストレージスロットを読み取ります：

```json
{
  "rpcMethod": "eth_getStorageAt",
  "rpcParams": ["0xContractAddress", "0x0", "latest"]
}
```

## サポートされている RPC メソッド

### 標準 Ethereum メソッド

- **eth_getBalance**：アカウント残高を取得
- **eth_getStorageAt**：指定位置のストレージを取得
- **eth_getTransactionCount**：トランザクション数（nonce）を取得
- **eth_getCode**：コントラクトコードを取得
- **eth_call**：コントラクト呼び出しを実行
- **eth_estimateGas**：ガス使用量を推定
- **eth_getBlockByNumber**：ブロック番号でブロックを取得
- **eth_getBlockByHash**：ブロックハッシュでブロックを取得
- **eth_getTransactionByHash**：ハッシュでトランザクションを取得
- **eth_getTransactionReceipt**：トランザクションレシートを取得
- **eth_getLogs**：イベントログを取得
- **eth_gasPrice**：現在のガス価格を取得
- **eth_feeHistory**：履歴手数料データを取得
- **eth_getProof**：Merkle 証明を取得

### デバッグメソッド（Geth）

- **debug_traceTransaction**：トランザクション実行をトレース
- **debug_traceCall**：呼び出し実行をトレース
- **debug_traceBlockByNumber**：ブロック内のすべてのトランザクションをトレース
- **debug_traceBlockByHash**：ハッシュでブロックをトレース

### トレースメソッド（Parity/OpenEthereum）

- **trace_transaction**：トランザクションをトレース
- **trace_block**：ブロックをトレース
- **trace_replayTransaction**：トランザクションをリプレイ
- **trace_call**：呼び出しをトレース

### カスタムメソッド

- Ethereum ノードが公開する任意のカスタム RPC メソッド
- ネットワーク固有のメソッド（例：Arbitrum、Optimism 拡張）
- カスタムインデクサーまたはミドルウェアメソッド

## 例

### 例 1：ブロックトランザクション数の取得

```json
{
  "rpcMethod": "eth_getBlockTransactionCountByNumber",
  "rpcParams": ["latest"]
}
```

### 例 2：コールトレーサーでトランザクションをトレース

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

### 例 3：証明の取得

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

### 例 4：複数の呼び出しのバッチ処理

n8n のバッチ処理を使用して、複数の RPC リクエストを順次送信できます：

```
入力アイテム → カスタム RPC（複数のメソッド）→ 結果を処理
```

## ヒント

- **メソッド名**：Ethereum JSON-RPC 仕様で指定されている正確な RPC メソッド名を使用してください
- **パラメータ**：単一パラメータの場合でも、常に JSON 配列としてパラメータを提供してください
- **ノードのサポート**：すべてのノードがすべてのメソッドをサポートしているわけではありません（例：デバッグメソッドにはフルノードが必要）
- **アーカイブノード**：履歴状態のクエリにはアーカイブノードが必要です
- **カスタムヘッダー**：認証用のカスタムヘッダーを設定するには RPC 認証情報を使用してください
- **エラー処理**：サポートされていないメソッドを適切に処理するには「失敗時に続行」を有効にしてください
- **レート制限**：複数のリクエストを行う際は RPC プロバイダーのレート制限に注意してください

## カスタム RPC を使用するタイミング

以下が必要な場合にカスタム RPC を使用してください：

- 他のリソースでは利用できないメソッドへのアクセス
- トランザクション分析のためのデバッグまたはトレースメソッドの使用
- 特定のブロックパラメータを使用した履歴状態データのクエリ
- ノード固有またはネットワーク固有の RPC メソッドへのアクセス
- 専用リソースサポート前の新機能のプロトタイピング
- カスタムまたは拡張 RPC API の使用

標準操作の場合は、専用リソース（Account、Block、Transaction など）の使用をお勧めします。これらは型安全性とパラメータ検証が向上しています。
