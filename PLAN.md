# n8n-ethereum Node Implementation Plan

This document outlines all the nodes to be implemented for comprehensive Ethereum blockchain integration in n8n using viem.

## Credentials

### 1. Wallet Credential
- Private Key
- Mnemonic phrase

### 2. RPC Node Credential
- RPC Endpoint URL
- Custom Headers (for API keys)

### 3. ABI Credential
- Contract Address (optional)
- ABI (Application Binary Interface)

## Triggers

### 1. Event Trigger
Monitor smart contract events with filtering capabilities.
- Monitor all contracts or specific addresses
- Filter by event types
- Decode event data

### 2. Block Trigger
Trigger on new blocks.
- Get complete block data
- Filter by block properties

### 3. Transaction Trigger
Monitor transactions at addresses.
- Watch incoming transactions
- Watch outgoing transactions
- Filter by value, from, to

### 4. Pending Transaction Trigger
Monitor mempool for pending transactions.
- Filter by sender/receiver
- Filter by value

## Nodes

### Account & Balance Operations

#### 1. Get Balance
Get native token balance (ETH, MATIC, etc.).
- Support multiple addresses
- Get balance at specific block
- Output in wei, gwei, or ether

#### 2. Get Transaction Count
Get the number of transactions sent from an address (nonce).
- Useful for transaction management
- Get at specific block

#### 3. Get Code
Check if an address is a smart contract.
- Returns bytecode if contract
- Returns empty if EOA (Externally Owned Account)

### Block Operations

#### 4. Get Block
Retrieve block information.
- By block number
- By block hash
- Latest, pending, earliest
- Include full transactions or just hashes

#### 5. Get Block Number
Get the current block number.
- Simple, fast operation

#### 6. Get Block Transaction Count
Get the number of transactions in a block.

#### 7. Watch Blocks
Continuously watch for new blocks.
- Polling or WebSocket support

### Transaction Operations

#### 8. Send Transaction
Send native token transactions.
- Set gas limit, gas price, max fee
- Support EIP-1559 transactions
- Return transaction hash

#### 9. Get Transaction
Retrieve transaction details by hash.
- Full transaction data
- Status information

#### 10. Get Transaction Receipt
Get transaction receipt after execution.
- Success/failure status
- Gas used
- Logs/events emitted
- Contract address (if deployment)

#### 11. Wait for Transaction
Wait for transaction confirmation.
- Configurable confirmations
- Timeout settings
- Return receipt

#### 12. Estimate Gas
Estimate gas for a transaction.
- For send transaction
- For contract calls
- Helps prevent out-of-gas errors

#### 13. Prepare Transaction
Prepare a transaction request.
- Auto-fill nonce, gas, chain ID
- Validate before sending

#### 14. Send Raw Transaction
Send a signed raw transaction.
- For pre-signed transactions

### Contract Operations - Read

#### 15. Read Contract
Call view/pure contract functions.
- Decode return values
- Support multiple parameters
- At specific block

#### 16. Multicall
Batch multiple contract reads in one call.
- Efficient for multiple reads
- Reduces RPC calls
- Support different contracts

#### 17. Simulate Contract
Simulate a contract write operation without sending.
- Test before executing
- Estimate outcomes
- Check for reverts

#### 18. Get Storage At
Read raw storage slot.
- Low-level storage access
- For advanced use cases

#### 19. Get Logs
Query historical logs/events.
- Filter by address, topics, block range
- Decode event data

### Contract Operations - Write

#### 20. Write Contract
Execute state-changing contract functions.
- Send with value (payable functions)
- Custom gas settings
- Return transaction hash

#### 21. Deploy Contract
Deploy a new smart contract.
- Provide bytecode and constructor args
- Return contract address
- Return transaction hash

#### 22. Estimate Contract Gas
Estimate gas for contract calls.
- Before writing to contract
- Helps set appropriate gas limit

### ENS (Ethereum Name Service)

#### 23. Get ENS Address
Resolve ENS name to address.
- e.g., "vitalik.eth" → 0x...

#### 24. Get ENS Name
Reverse resolve address to ENS name.
- e.g., 0x... → "vitalik.eth"

#### 25. Get ENS Avatar
Get avatar URL from ENS profile.

#### 26. Get ENS Text
Get text records from ENS.
- Email, URL, description, etc.

#### 27. Get ENS Resolver
Get the resolver contract for an ENS name.

### Gas & Fee Operations

#### 28. Get Gas Price
Get current gas price.
- Legacy gas price

#### 29. Get Fee History
Get historical fee data.
- Base fee per gas
- Priority fees
- Useful for EIP-1559 transactions

#### 30. Estimate Max Priority Fee
Estimate max priority fee per gas.
- For EIP-1559 transactions

### Signature Operations

#### 31. Sign Message
Sign a message with wallet.
- Personal sign
- Return signature

#### 32. Sign Typed Data
Sign structured typed data (EIP-712).
- Domain, types, message
- Return signature

#### 33. Verify Message
Verify a signed message.
- Check signature validity
- Recover signer address

#### 34. Verify Typed Data
Verify signed typed data.
- EIP-712 verification

#### 35. Recover Address
Recover signer address from signature.
- From message and signature

#### 36. Hash Message
Hash a message for signing.
- Keccak256 hash

#### 37. Hash Typed Data
Hash typed data for signing.
- EIP-712 hash

### Token Operations (ERC20)

#### 38. ERC20 - Get Balance
Get ERC20 token balance.
- Standard token balance

#### 39. ERC20 - Transfer
Transfer ERC20 tokens.
- To address, amount

#### 40. ERC20 - Approve
Approve spender for tokens.
- Standard approval

#### 41. ERC20 - Transfer From
Transfer tokens on behalf of owner.
- Requires approval

#### 42. ERC20 - Get Allowance
Check approved amount.

#### 43. ERC20 - Get Total Supply
Get token total supply.

#### 44. ERC20 - Get Decimals
Get token decimals.

#### 45. ERC20 - Get Name
Get token name.

#### 46. ERC20 - Get Symbol
Get token symbol.

### Token Operations (ERC721 - NFT)

#### 47. ERC721 - Get Balance
Get NFT count owned by address.

#### 48. ERC721 - Owner Of
Get owner of specific token ID.

#### 49. ERC721 - Transfer From
Transfer NFT.

#### 50. ERC721 - Safe Transfer From
Safe transfer with callback check.

#### 51. ERC721 - Approve
Approve address for token ID.

#### 52. ERC721 - Set Approval For All
Approve operator for all tokens.

#### 53. ERC721 - Get Approved
Get approved address for token.

#### 54. ERC721 - Is Approved For All
Check if operator is approved.

#### 55. ERC721 - Token URI
Get metadata URI for token.

### Token Operations (ERC1155 - Multi Token)

#### 56. ERC1155 - Balance Of
Get balance of token ID.

#### 57. ERC1155 - Balance Of Batch
Get balances for multiple token IDs.

#### 58. ERC1155 - Safe Transfer From
Transfer single token type.

#### 59. ERC1155 - Safe Batch Transfer From
Transfer multiple token types.

#### 60. ERC1155 - Set Approval For All
Approve operator.

#### 61. ERC1155 - Is Approved For All
Check operator approval.

#### 62. ERC1155 - URI
Get metadata URI.

### Utility Nodes

#### 63. Format Units
Convert wei to ether/gwei/etc.
- From wei to human readable

#### 64. Parse Units
Convert ether/gwei to wei.
- From human readable to wei

#### 65. Encode Function Data
Encode function call data.
- For advanced transaction building

#### 66. Decode Function Data
Decode function call data.
- Parse transaction input

#### 67. Encode Event Topics
Encode event topics for filtering.

#### 68. Decode Event Log
Decode event log data.

#### 69. Get Contract Address
Calculate contract deployment address.
- Before deployment (CREATE/CREATE2)

#### 70. Validate Address
Check if address is valid.
- Checksum validation

#### 71. Get Chain ID
Get current chain ID.

#### 72. Get Chain
Get chain information.
- Name, currency, explorer

### Advanced Operations

#### 73. Get Proof
Get Merkle proof for account/storage.
- For verification

#### 74. Call
Make a read-only call.
- Raw call without ABI

#### 75. Create Block Filter
Create filter for new blocks.
- For efficient polling

#### 76. Create Event Filter
Create filter for events.
- For efficient log polling

#### 77. Create Pending Transaction Filter
Create filter for pending transactions.

#### 78. Get Filter Changes
Get changes since last poll.
- For filters

#### 79. Get Filter Logs
Get all logs for filter.

#### 80. Uninstall Filter
Remove a filter.

## Implementation Priority

### Phase 1 - Core Functionality (MVP)
✓ Already in README:
- Event Trigger
- Block Trigger
- Transaction Trigger
- Read Contract
- Write Contract
- Wait Transaction
- Get Block
- Send Transaction

Additional Priority:
- Get Balance
- Get Transaction
- Get Transaction Receipt
- Deploy Contract
- Multicall
- Estimate Gas

### Phase 2 - Token Support
- All ERC20 operations
- All ERC721 operations
- All ERC1155 operations

### Phase 3 - ENS Support
- All ENS operations

### Phase 4 - Advanced Features
- Signature operations
- Gas optimization features
- Utility nodes
- Filter operations

### Phase 5 - Additional Features
- Proof operations
- Advanced transaction building
- Create2 support

## Use Case Coverage

This comprehensive node set covers:
- ✅ DeFi applications (token swaps, liquidity provision)
- ✅ NFT marketplaces (minting, transfers, trading)
- ✅ DAO operations (voting, governance)
- ✅ Multi-signature wallets
- ✅ Payment processing
- ✅ Event monitoring and automation
- ✅ Cross-chain bridging preparation
- ✅ Smart contract deployment and testing
- ✅ Wallet management
- ✅ ENS domain management
- ✅ Gas optimization
- ✅ Transaction batching
- ✅ Analytics and monitoring

## Total Node Count

- **Triggers**: 4
- **Account & Balance**: 3
- **Block Operations**: 4
- **Transaction Operations**: 7
- **Contract Read Operations**: 5
- **Contract Write Operations**: 3
- **ENS Operations**: 5
- **Gas & Fee Operations**: 3
- **Signature Operations**: 7
- **ERC20 Operations**: 9
- **ERC721 Operations**: 9
- **ERC1155 Operations**: 7
- **Utility Nodes**: 10
- **Advanced Operations**: 8

**Total: ~80 nodes + 4 triggers = 84 components**
