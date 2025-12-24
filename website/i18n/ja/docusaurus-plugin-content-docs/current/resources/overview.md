---
sidebar_position: 1
---

# リソース概要

Ethereumノードは、さまざまなブロックチェーンリソースへのアクセスを提供します。各リソースには、Ethereumブロックチェーンのさまざまな側面とやり取りするための特定の操作が含まれています。

## 利用可能なリソース

### コアブロックチェーンリソース

- **[Account](./account.md)**：アカウント残高、トランザクション数、コントラクトコードの照会
- **[Block](./block.md)**：ブロック情報と現在のブロックチェーン高の取得
- **[Transaction](./transaction.md)**：トランザクションの送信、ステータスの確認、ガスコストの見積もり
- **[Gas](./gas.md)**：最適なトランザクション価格設定のためのガス価格と手数料履歴の取得

### スマートコントラクトリソース

- **[Contract](./contract.md)**：スマートコントラクトの読み取りと書き込み、新しいコントラクトのデプロイ、イベントログの照会
- **[ERC20](./erc20.md)**：ERC20トークンコントラクトとのやり取り（転送、承認、残高）
- **[ERC721](./erc721.md)**：ERC721 NFT操作の管理（転送、所有権、メタデータ）
- **[ERC1155](./erc1155.md)**：ERC1155マルチトークン規格での作業（バッチ操作、残高）

### ユーティリティリソース

- **[ENS](./ens.md)**：Ethereum Name Serviceドメインと逆引き参照の解決
- **[Signature](./signature.md)**：メッセージと型付きデータの署名と検証（EIP-712）
- **[Utils](./utils.md)**：フォーマット、エンコード、検証のためのユーティリティ関数

## リソース選択

Ethereumノードを使用する場合：

1. ドロップダウンから **Resource**（リソース）を選択
2. そのリソース内で **Operation**（操作）を選択
3. 操作固有のパラメータを設定
4. 必要な認証情報を追加（すべてにRPC、書き込み操作にAccount）

## クイックリファレンス

### 読み取り操作（RPCのみ）

これらの操作には **Ethereum RPC** 認証情報のみが必要です：

| リソース | 操作 |
|---------|------|
| Account | Get Balance、Get Transaction Count、Get Code |
| Block | Get Block、Get Block Number |
| Transaction | Get Transaction、Get Transaction Receipt |
| Contract | Read Contract、Multicall、Simulate Contract、Get Logs |
| ERC20 | Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol |
| ERC721 | Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI |
| ERC1155 | Balance Of、Balance Of Batch、Is Approved For All、URI |
| ENS | すべての操作 |
| Gas | すべての操作 |
| Utils | ほとんどの操作 |

### 書き込み操作（RPC + Account）

これらの操作には **Ethereum RPC** と **Ethereum Account** の両方の認証情報が必要です：

| リソース | 操作 |
|---------|------|
| Transaction | Send Transaction、Wait For Transaction |
| Contract | Write Contract、Deploy Contract |
| ERC20 | Transfer、Approve、Transfer From |
| ERC721 | Transfer From、Safe Transfer From、Approve、Set Approval For All |
| ERC1155 | Safe Transfer From、Safe Batch Transfer From、Set Approval For All |
| Signature | Sign Message、Sign Typed Data |

## 一般的なパターン

### ブロックチェーンデータの読み取り

```
[Schedule Trigger] → [Ethereum: Contract - Read Contract] → [Process Data]
```

### トランザクションの実行

```
[Trigger] → [Ethereum: Contract - Write Contract] → [Ethereum: Transaction - Wait For Transaction] → [Notification]
```

### トークン操作

```
[Trigger] → [Ethereum: ERC20 - Transfer] → [Ethereum: Transaction - Wait For Transaction] → [Store Result]
```

### イベント監視

```
[Ethereum Trigger: Event] → [Process Event Data] → [Action]
```

## 次のステップ

各リソースの詳細を調べて、特定の操作とパラメータについて学びます：

- 基本的なブロックチェーン照会のために [Account](./account.md) から始める
- ETHの送信のために [Transactions](./transaction.md) について学ぶ
- スマートコントラクトのやり取りのために [Contract](./contract.md) を深く掘り下げる
- トークン規格を探索：[ERC20](./erc20.md)、[ERC721](./erc721.md)、[ERC1155](./erc1155.md)
