---
sidebar_position: 3
---

# 認証情報

Ethereumノードを使用するには、2種類の認証情報を設定する必要があります：**Ethereum RPC**（必須）と **Ethereum Account**（オプション、書き込み操作のみ）。

## Ethereum RPC 認証情報

Ethereum RPC認証情報は、Ethereumノードに接続するために使用されます。この認証情報はすべての操作で**必須**です。

### 設定手順：

1. **認証情報に移動**
   - n8nで、**認証情報** → **新規** → 「Ethereum RPC」を検索

2. **チェーンを選択**
   - 事前設定されたネットワークから選択：
     - **Ethereum**：メインネット、Sepolia、Goerli、Holesky
     - **Layer 2**：Arbitrum、Optimism、Base（およびそのテストネット）
     - **サイドチェーン**：Polygon、BSC、Avalanche、Gnosis、Celo（およびそのテストネット）
     - **Custom**（カスタム）：その他のEVM互換ネットワーク

3. **RPC URLを入力**
   - HTTP(S)またはWebSocketエンドポイントを提供
   - 例：
     - Infura: `https://mainnet.infura.io/v3/YOUR-API-KEY`
     - Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
     - QuickNode: `https://YOUR-ENDPOINT.quiknode.pro/YOUR-API-KEY/`
     - パブリックRPC: `https://eth.llamarpc.com`（本番環境には推奨されません）

4. **カスタムヘッダー**（オプション）
   - RPCプロバイダーが必要とする場合、認証ヘッダーを追加
   - 形式：JSONオブジェクト
   - 例：`{"Authorization": "Bearer YOUR-TOKEN"}`

### 推奨RPCプロバイダー：

| プロバイダー | 無料枠 | 備考 |
|-------------|--------|------|
| [Infura](https://infura.io/) | 1日100,000リクエスト | 信頼性が高く、広く使用されている |
| [Alchemy](https://www.alchemy.com/) | 月間3億コンピュートユニット | 高度な機能、優れたドキュメント |
| [QuickNode](https://www.quicknode.com/) | 限定的な無料トライアル | 高速、マルチチェーン |
| [Ankr](https://www.ankr.com/) | パブリックエンドポイント | 無料だがレート制限あり |
| [LlamaNodes](https://llamanodes.com/) | パブリックエンドポイント | コミュニティ運営 |

### 設定例：

```json
{
  "chain": "Ethereum Mainnet",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR-API-KEY",
  "customHeaders": {}
}
```

## Ethereum Account 認証情報

Ethereum Account認証情報には、ウォレットの秘密鍵またはニーモニックフレーズが含まれます。この認証情報は**オプション**で、以下の場合にのみ必要です：

- トランザクションの送信
- スマートコントラクトへの書き込み
- メッセージへの署名
- ウォレット署名が必要な操作

:::caution セキュリティ警告
秘密鍵やニーモニックフレーズを決して共有しないでください。これらの認証情報はn8nの認証情報システムに安全に保存してください。本番環境では、限られた資金を持つ専用ウォレットの使用を検討してください。
:::

### 設定手順：

1. **認証情報に移動**
   - n8nで、**認証情報** → **新規** → 「Ethereum Account」を検索

2. **認証方法を選択**
   - **Private Key**（秘密鍵）または **Mnemonic Phrase**（ニーモニックフレーズ）のいずれかを使用できます（両方ではありません）

3. **オプションA：秘密鍵**
   - ウォレットの秘密鍵を入力（64個の16進数文字）
   - `0x`プレフィックスありまたはなしで開始できます
   - 例：`0x1234567890abcdef...`

4. **オプションB：ニーモニックフレーズ**
   - 12または24単語のシードフレーズを入力
   - 例：`word1 word2 word3 ... word12`
   - **Account Index**（アカウントインデックス）を設定（デフォルト：0）して、同じニーモニックから異なるアカウントを派生させます

### セキュリティのベストプラクティス：

1. **専用ウォレットを使用**
   - n8n自動化専用の別のウォレットを作成
   - 操作に必要な金額のみを入金

2. **最初にテストネットでテスト**
   - メインネットを使用する前に、常にテストネット（Sepolia、Goerli）でワークフローをテスト
   - テストネットETHはフォーセットから無料で入手可能

3. **アクティビティを監視**
   - ウォレットのトランザクションを定期的に確認
   - 予期しないアクティビティに対するアラートを設定

4. **権限を制限**
   - 必要なユーザーにのみn8n認証情報へのアクセスを許可
   - n8nの認証情報共有機能を賢く使用

### この認証情報が必要な場合は？

**必要な操作：**
- Transaction → Send Transaction
- Contract → Write Contract
- Contract → Deploy Contract
- ERC20 → Transfer、Approve、Transfer From
- ERC721 → Transfer From、Safe Transfer From、Approve、Set Approval For All
- ERC1155 → Safe Transfer From、Safe Batch Transfer From、Set Approval For All
- Signature → Sign Message、Sign Typed Data

**不要な操作：**
- Account → Get Balance、Get Transaction Count、Get Code
- Block → Get Block、Get Block Number
- Transaction → Get Transaction、Get Transaction Receipt、Estimate Gas
- Contract → Read Contract、Multicall、Simulate Contract、Get Logs
- ERC20 → Get Balance、Get Allowance、Get Total Supply、Get Decimals、Get Name、Get Symbol
- ERC721 → Get Balance、Owner Of、Get Approved、Is Approved For All、Token URI
- ERC1155 → Balance Of、Balance Of Batch、Is Approved For All、URI
- ENS → すべての操作
- Gas → すべての操作
- Utils → すべての操作

### 設定例：

**秘密鍵を使用：**
```json
{
  "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**ニーモニックを使用：**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "accountIndex": 0
}
```

## 認証情報のテスト

認証情報を設定したら、テストします：

1. **RPC接続をテスト**
   - Ethereumノードを含むワークフローを作成
   - リソースを選択：**Block** → 操作：**Get Block Number**
   - RPC認証情報を選択
   - ノードを実行
   - 現在のブロック番号を取得できるはずです

2. **アカウント認証情報をテスト**（設定済みの場合）
   - リソースを選択：**Account** → 操作：**Get Balance**
   - アドレスを空白のままにする（認証情報のウォレットアドレスを使用）
   - RPCとAccount認証情報の両方を選択
   - ノードを実行
   - ウォレットの残高が表示されるはずです

## トラブルシューティング

### RPC接続の問題

- **無効なRPC URL**：URLが正しく、プロトコル（https://）を含んでいることを確認
- **レート制限**：プロバイダーのレート制限を超えた可能性があります
- **ネットワークの不一致**：選択したチェーンがRPCエンドポイントと一致していることを確認
- **ファイアウォール/プロキシ**：ネットワークがRPCエンドポイントへの接続を許可しているか確認

### アカウント認証情報の問題

- **無効な秘密鍵**：64個の16進数文字（0xありまたはなし）であることを確認
- **無効なニーモニック**：すべての単語が正しくスペルされ、順序が正しいことを確認
- **間違ったアカウント**：ニーモニックを使用している場合は、異なるアカウントインデックスを試してください

## 次のステップ

認証情報を設定したら、[利用可能なリソース](resources/overview)を探索してワークフローの構築を開始してください。
