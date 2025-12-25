---
sidebar_position: 3
---

# Credentials

To use the Ethereum nodes, you need to configure two types of credentials: **Ethereum RPC** (required) and **Ethereum Account** (optional, only for write operations).

## Ethereum RPC Credential

The Ethereum RPC credential is used to connect to an Ethereum node. This credential is **required** for all operations.

### Configuration Steps:

1. **Navigate to Credentials**
   - In n8n, go to **Credentials** → **New** → Search for "Ethereum RPC"

2. **Enter RPC URL** (Required)
   - Provide the HTTP(S) or WebSocket endpoint for your Ethereum node
   - You must explicitly provide an RPC endpoint URL
   - Examples:
     - Infura: `https://mainnet.infura.io/v3/YOUR-API-KEY`
     - Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
     - QuickNode: `https://YOUR-ENDPOINT.quiknode.pro/YOUR-API-KEY/`
     - Public RPC: `https://eth.llamarpc.com` (not recommended for production)

3. **Custom Headers** (Optional)
   - Add authentication headers if required by your RPC provider
   - Format: JSON object
   - Example: `{"Authorization": "Bearer YOUR-TOKEN"}`

4. **Block Limit** (Optional)
   - Maximum number of blocks to query in a single request (default: 1000)
   - Used to prevent timeouts when querying large block ranges

### Recommended RPC Providers:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Infura](https://infura.io/) | 100,000 requests/day | Reliable, widely used |
| [Alchemy](https://www.alchemy.com/) | 300M compute units/month | Advanced features, good docs |
| [QuickNode](https://www.quicknode.com/) | Limited free trial | Fast, multiple chains |
| [Ankr](https://www.ankr.com/) | Public endpoints | Free but rate limited |
| [LlamaNodes](https://llamanodes.com/) | Public endpoints | Community-run |

### Example Configuration:

```json
{
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR-API-KEY",
  "customHeaders": {},
  "blockLimit": 1000
}
```

## Ethereum Account Credential

The Ethereum Account credential contains your wallet's private key or mnemonic phrase. This credential is **optional** and only required for:

- Sending transactions
- Writing to smart contracts
- Signing messages
- Any operation that requires a wallet signature

:::caution Security Warning
Never share your private key or mnemonic phrase. Store these credentials securely in n8n's credential system. For production use, consider using a dedicated wallet with limited funds.
:::

### Configuration Steps:

1. **Navigate to Credentials**
   - In n8n, go to **Credentials** → **New** → Search for "Ethereum Account"

2. **Choose Authentication Method**
   - You can use either **Private Key** OR **Mnemonic Phrase** (not both)

3. **Option A: Private Key**
   - Enter your wallet's private key (64 hex characters)
   - Can start with or without `0x` prefix
   - Example: `0x1234567890abcdef...`

4. **Option B: Mnemonic Phrase**
   - Enter your 12 or 24-word seed phrase
   - Example: `word1 word2 word3 ... word12`
   - Set **Account Index** (default: 0) to derive different accounts from the same mnemonic

### Security Best Practices:

1. **Use Dedicated Wallets**
   - Create a separate wallet specifically for n8n automation
   - Only fund it with the amount needed for operations

2. **Test on Testnet First**
   - Always test your workflows on testnets (Sepolia, Goerli) before using mainnet
   - Testnet ETH is free from faucets

3. **Monitor Activity**
   - Regularly check wallet transactions
   - Set up alerts for unexpected activity

4. **Limit Permissions**
   - Only give n8n credentials access to users who need it
   - Use n8n's credential sharing features wisely

### When Do You Need This Credential?

**Required for:**
- Transaction → Send Transaction
- Contract → Write Contract
- Contract → Deploy Contract
- ERC20 → Transfer, Approve, Transfer From
- ERC721 → Transfer From, Safe Transfer From, Approve, Set Approval For All
- ERC1155 → Safe Transfer From, Safe Batch Transfer From, Set Approval For All
- Signature → Sign Message, Sign Typed Data

**NOT Required for:**
- Account → Get Balance, Get Transaction Count, Get Code
- Block → Get Block, Get Block Number
- Transaction → Get Transaction, Get Transaction Receipt, Estimate Gas
- Contract → Read Contract, Multicall, Simulate Contract, Get Logs
- ERC20 → Get Balance, Get Allowance, Get Total Supply, Get Decimals, Get Name, Get Symbol
- ERC721 → Get Balance, Owner Of, Get Approved, Is Approved For All, Token URI
- ERC1155 → Balance Of, Balance Of Batch, Is Approved For All, URI
- ENS → All operations
- Gas → All operations
- Utils → All operations

### Example Configuration:

**Using Private Key:**
```json
{
  "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**Using Mnemonic:**
```json
{
  "mnemonic": "test test test test test test test test test test test junk",
  "accountIndex": 0
}
```

## Testing Your Credentials

After configuring credentials, test them:

1. **Test RPC Connection**
   - Create a workflow with an Ethereum node
   - Select Resource: **Block** → Operation: **Get Block Number**
   - Select your RPC credential
   - Execute the node
   - You should get the current block number

2. **Test Account Credential (if configured)**
   - Select Resource: **Account** → Operation: **Get Balance**
   - Leave address empty (uses credential's wallet address)
   - Select both RPC and Account credentials
   - Execute the node
   - You should see your wallet's balance

## Troubleshooting

### RPC Connection Issues

- **Invalid RPC URL**: Verify the URL is correct and includes protocol (https://)
- **Rate Limited**: You may have exceeded your provider's rate limit
- **Firewall/Proxy**: Check if your network allows connections to the RPC endpoint
- **Wrong Network**: Ensure your RPC endpoint points to the correct network (mainnet, testnet, etc.)

### Account Credential Issues

- **Invalid Private Key**: Ensure it's 64 hex characters (with or without 0x)
- **Invalid Mnemonic**: Verify all words are spelled correctly and in order
- **Wrong Account**: If using mnemonic, try different account indexes

## Next Steps

After configuring your credentials, explore the [available resources](resources/overview) to start building workflows.
