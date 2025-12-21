# n8n-ethereum Implementation TODO

This document outlines the implementation roadmap for all nodes defined in PLAN.md.

## Project Structure

```
n8n-ethereum/
├── credentials/
│   ├── WalletCredential.credentials.ts
│   ├── RpcNodeCredential.credentials.ts
│   └── AbiCredential.credentials.ts
├── nodes/
│   ├── triggers/
│   │   ├── EventTrigger/
│   │   ├── BlockTrigger/
│   │   ├── TransactionTrigger/
│   │   └── PendingTransactionTrigger/
│   ├── Account/
│   │   ├── GetBalance/
│   │   ├── GetTransactionCount/
│   │   └── GetCode/
│   ├── Block/
│   │   ├── GetBlock/
│   │   ├── GetBlockNumber/
│   │   ├── GetBlockTransactionCount/
│   │   └── WatchBlocks/
│   ├── Transaction/
│   │   ├── SendTransaction/
│   │   ├── GetTransaction/
│   │   ├── GetTransactionReceipt/
│   │   ├── WaitForTransaction/
│   │   ├── EstimateGas/
│   │   ├── PrepareTransaction/
│   │   └── SendRawTransaction/
│   ├── Contract/
│   │   ├── ReadContract/
│   │   ├── WriteContract/
│   │   ├── DeployContract/
│   │   ├── Multicall/
│   │   ├── SimulateContract/
│   │   ├── GetStorageAt/
│   │   ├── GetLogs/
│   │   └── EstimateContractGas/
│   ├── Ens/
│   │   ├── GetEnsAddress/
│   │   ├── GetEnsName/
│   │   ├── GetEnsAvatar/
│   │   ├── GetEnsText/
│   │   └── GetEnsResolver/
│   ├── Gas/
│   │   ├── GetGasPrice/
│   │   ├── GetFeeHistory/
│   │   └── EstimateMaxPriorityFee/
│   ├── Signature/
│   │   ├── SignMessage/
│   │   ├── SignTypedData/
│   │   ├── VerifyMessage/
│   │   ├── VerifyTypedData/
│   │   ├── RecoverAddress/
│   │   ├── HashMessage/
│   │   └── HashTypedData/
│   ├── Erc20/
│   │   ├── GetBalance/
│   │   ├── Transfer/
│   │   ├── Approve/
│   │   ├── TransferFrom/
│   │   ├── GetAllowance/
│   │   ├── GetTotalSupply/
│   │   ├── GetDecimals/
│   │   ├── GetName/
│   │   └── GetSymbol/
│   ├── Erc721/
│   │   ├── GetBalance/
│   │   ├── OwnerOf/
│   │   ├── TransferFrom/
│   │   ├── SafeTransferFrom/
│   │   ├── Approve/
│   │   ├── SetApprovalForAll/
│   │   ├── GetApproved/
│   │   ├── IsApprovedForAll/
│   │   └── TokenUri/
│   ├── Erc1155/
│   │   ├── BalanceOf/
│   │   ├── BalanceOfBatch/
│   │   ├── SafeTransferFrom/
│   │   ├── SafeBatchTransferFrom/
│   │   ├── SetApprovalForAll/
│   │   ├── IsApprovedForAll/
│   │   └── Uri/
│   ├── Utils/
│   │   ├── FormatUnits/
│   │   ├── ParseUnits/
│   │   ├── EncodeFunctionData/
│   │   ├── DecodeFunctionData/
│   │   ├── EncodeEventTopics/
│   │   ├── DecodeEventLog/
│   │   ├── GetContractAddress/
│   │   ├── ValidateAddress/
│   │   ├── GetChainId/
│   │   └── GetChain/
│   └── Advanced/
│       ├── GetProof/
│       ├── Call/
│       ├── CreateBlockFilter/
│       ├── CreateEventFilter/
│       ├── CreatePendingTransactionFilter/
│       ├── GetFilterChanges/
│       ├── GetFilterLogs/
│       └── UninstallFilter/
├── utils/
│   ├── viemClient.ts          # Viem client factory
│   ├── walletClient.ts        # Wallet client helper
│   ├── publicClient.ts        # Public client helper
│   ├── chainConfig.ts         # Chain configurations
│   ├── abiHelpers.ts          # ABI parsing and validation
│   ├── errorHandling.ts       # Error handling utilities
│   └── types.ts               # Common types
└── package.json
```

## Implementation Phases

### Phase 0: Project Setup ✓ (Completed in previous work)

- [x] Initialize npm project
- [x] Install dependencies (viem, n8n-workflow, n8n-core)
- [x] Setup TypeScript configuration
- [x] Create basic project structure

### Phase 1: Core Infrastructure

#### 1.1 Utilities Setup
- [ ] Create `utils/viemClient.ts`
  - Factory function for creating public client
  - Handle RPC endpoint configuration
  - Support custom headers
  - Error handling

- [ ] Create `utils/walletClient.ts`
  - Factory for wallet client
  - Support private key
  - Support mnemonic
  - Account derivation

- [ ] Create `utils/publicClient.ts`
  - Helper functions for public client operations
  - Common patterns and wrappers

- [ ] Create `utils/chainConfig.ts`
  - Chain definitions (Ethereum, Polygon, BSC, Arbitrum, etc.)
  - Chain ID mapping
  - Default RPC endpoints
  - Explorer URLs

- [ ] Create `utils/abiHelpers.ts`
  - Parse and validate ABI
  - Extract function signatures
  - Extract event signatures
  - Type helpers

- [ ] Create `utils/errorHandling.ts`
  - Viem error parsing
  - User-friendly error messages
  - Revert reason extraction

- [ ] Create `utils/types.ts`
  - Common type definitions
  - Shared interfaces

#### 1.2 Credentials Implementation
- [ ] Implement `WalletCredential.credentials.ts`
  - Private key field (password/hidden)
  - Mnemonic phrase field (password/hidden)
  - Option to choose between private key or mnemonic
  - Validation

- [ ] Implement `RpcNodeCredential.credentials.ts`
  - RPC endpoint URL field
  - Custom headers field (JSON)
  - Chain selection dropdown
  - Test connection button
  - Validation

- [ ] Implement `AbiCredential.credentials.ts`
  - Contract address field (optional)
  - ABI field (JSON)
  - Validation
  - Function/event list display

### Phase 2: Core Nodes (MVP - Week 1-2)

#### 2.1 Basic Account Operations
- [ ] **GetBalance** node
  - Input: address, block number (optional)
  - Output: balance in wei/gwei/ether
  - Support batch addresses

- [ ] **GetTransactionCount** node
  - Input: address, block tag
  - Output: nonce/transaction count

- [ ] **GetCode** node
  - Input: address
  - Output: bytecode (check if contract)

#### 2.2 Block Operations
- [ ] **GetBlock** node (already in README)
  - Input: block number/hash/tag
  - Output: block data
  - Option to include transactions

- [ ] **GetBlockNumber** node
  - Output: current block number

#### 2.3 Transaction Operations
- [ ] **SendTransaction** node (already in README)
  - Input: to, value, data, gas settings
  - Wallet credential required
  - Output: transaction hash

- [ ] **GetTransaction** node
  - Input: transaction hash
  - Output: transaction data

- [ ] **GetTransactionReceipt** node
  - Input: transaction hash
  - Output: receipt with status, logs, gas used

- [ ] **WaitForTransaction** node (already in README)
  - Input: transaction hash, confirmations, timeout
  - Wait for confirmation
  - Output: receipt

- [ ] **EstimateGas** node
  - Input: transaction parameters
  - Output: estimated gas

- [ ] **PrepareTransaction** node
  - Input: basic transaction parameters
  - Auto-fill nonce, gas, chain ID
  - Output: prepared transaction

#### 2.4 Contract Operations - Core
- [ ] **ReadContract** node (already in README)
  - ABI credential required
  - Function selector dropdown
  - Dynamic parameter inputs based on function
  - Output: decoded return values

- [ ] **WriteContract** node (already in README)
  - ABI credential required
  - Wallet credential required
  - Function selector dropdown
  - Dynamic parameter inputs
  - Gas settings
  - Value field for payable functions
  - Output: transaction hash

- [ ] **DeployContract** node
  - Input: bytecode, constructor arguments
  - Wallet credential required
  - Output: contract address, transaction hash

- [ ] **Multicall** node
  - Input: array of contract calls
  - Batch multiple reads
  - Output: array of results

- [ ] **SimulateContract** node
  - Similar to WriteContract but simulation only
  - No transaction sent
  - Output: simulated result or revert reason

- [ ] **GetLogs** node
  - Input: address, topics, block range
  - Filter options
  - Output: decoded logs

- [ ] **EstimateContractGas** node
  - Input: contract call parameters
  - Output: estimated gas

### Phase 3: Triggers (Week 2-3)

- [ ] **EventTrigger** (already in README)
  - Polling or WebSocket mode
  - ABI credential for event decoding
  - Filter by address (support multiple)
  - Filter by event type (support multiple)
  - Output: decoded event data

- [ ] **BlockTrigger** (already in README)
  - Polling or WebSocket mode
  - Trigger on each new block
  - Output: block data

- [ ] **TransactionTrigger** (already in README)
  - Watch specific addresses
  - Filter incoming/outgoing/both
  - Filter by value
  - Output: transaction data

- [ ] **PendingTransactionTrigger**
  - Watch mempool
  - Filter by sender/receiver
  - Output: pending transaction data

### Phase 4: Token Standards (Week 3-4)

#### 4.1 ERC20 Operations
- [ ] **ERC20/GetBalance** node
  - Input: token address, account address
  - Output: balance with decimals

- [ ] **ERC20/Transfer** node
  - Input: token address, to, amount
  - Wallet credential required
  - Output: transaction hash

- [ ] **ERC20/Approve** node
  - Input: token address, spender, amount
  - Output: transaction hash

- [ ] **ERC20/TransferFrom** node
  - Input: token address, from, to, amount
  - Output: transaction hash

- [ ] **ERC20/GetAllowance** node
  - Input: token address, owner, spender
  - Output: allowance amount

- [ ] **ERC20/GetTotalSupply** node
  - Input: token address
  - Output: total supply

- [ ] **ERC20/GetDecimals** node
  - Input: token address
  - Output: decimals

- [ ] **ERC20/GetName** node
  - Input: token address
  - Output: token name

- [ ] **ERC20/GetSymbol** node
  - Input: token address
  - Output: token symbol

#### 4.2 ERC721 Operations
- [ ] **ERC721/GetBalance** node
  - Input: contract address, owner address
  - Output: NFT count

- [ ] **ERC721/OwnerOf** node
  - Input: contract address, token ID
  - Output: owner address

- [ ] **ERC721/TransferFrom** node
  - Input: contract address, from, to, token ID
  - Output: transaction hash

- [ ] **ERC721/SafeTransferFrom** node
  - Input: contract address, from, to, token ID, data
  - Output: transaction hash

- [ ] **ERC721/Approve** node
  - Input: contract address, to, token ID
  - Output: transaction hash

- [ ] **ERC721/SetApprovalForAll** node
  - Input: contract address, operator, approved
  - Output: transaction hash

- [ ] **ERC721/GetApproved** node
  - Input: contract address, token ID
  - Output: approved address

- [ ] **ERC721/IsApprovedForAll** node
  - Input: contract address, owner, operator
  - Output: boolean

- [ ] **ERC721/TokenUri** node
  - Input: contract address, token ID
  - Output: metadata URI

#### 4.3 ERC1155 Operations
- [ ] **ERC1155/BalanceOf** node
  - Input: contract address, account, token ID
  - Output: balance

- [ ] **ERC1155/BalanceOfBatch** node
  - Input: contract address, accounts[], token IDs[]
  - Output: balances[]

- [ ] **ERC1155/SafeTransferFrom** node
  - Input: contract address, from, to, token ID, amount, data
  - Output: transaction hash

- [ ] **ERC1155/SafeBatchTransferFrom** node
  - Input: contract address, from, to, token IDs[], amounts[], data
  - Output: transaction hash

- [ ] **ERC1155/SetApprovalForAll** node
  - Input: contract address, operator, approved
  - Output: transaction hash

- [ ] **ERC1155/IsApprovedForAll** node
  - Input: contract address, owner, operator
  - Output: boolean

- [ ] **ERC1155/Uri** node
  - Input: contract address, token ID
  - Output: metadata URI

### Phase 5: ENS Support (Week 4)

- [ ] **GetEnsAddress** node
  - Input: ENS name
  - Output: resolved address

- [ ] **GetEnsName** node
  - Input: address
  - Output: ENS name (reverse resolution)

- [ ] **GetEnsAvatar** node
  - Input: ENS name
  - Output: avatar URI

- [ ] **GetEnsText** node
  - Input: ENS name, key
  - Output: text record value

- [ ] **GetEnsResolver** node
  - Input: ENS name
  - Output: resolver address

### Phase 6: Gas & Fee Operations (Week 5)

- [ ] **GetGasPrice** node
  - Output: current gas price (legacy)

- [ ] **GetFeeHistory** node
  - Input: block count, newest block, reward percentiles
  - Output: fee history data

- [ ] **EstimateMaxPriorityFee** node
  - Output: estimated max priority fee per gas (EIP-1559)

### Phase 7: Signature Operations (Week 5)

- [ ] **SignMessage** node
  - Input: message
  - Wallet credential required
  - Output: signature

- [ ] **SignTypedData** node
  - Input: domain, types, message
  - Wallet credential required
  - Output: signature

- [ ] **VerifyMessage** node
  - Input: message, signature, address
  - Output: boolean (is valid)

- [ ] **VerifyTypedData** node
  - Input: domain, types, message, signature, address
  - Output: boolean

- [ ] **RecoverAddress** node
  - Input: message, signature
  - Output: recovered address

- [ ] **HashMessage** node
  - Input: message
  - Output: message hash

- [ ] **HashTypedData** node
  - Input: domain, types, message
  - Output: typed data hash

### Phase 8: Utility Nodes (Week 6)

- [ ] **FormatUnits** node
  - Input: value (wei), decimals
  - Output: formatted string

- [ ] **ParseUnits** node
  - Input: value (string), decimals
  - Output: bigint (wei)

- [ ] **EncodeFunctionData** node
  - Input: ABI, function name, args
  - Output: encoded data

- [ ] **DecodeFunctionData** node
  - Input: ABI, encoded data
  - Output: decoded function and args

- [ ] **EncodeEventTopics** node
  - Input: ABI, event name, args
  - Output: encoded topics

- [ ] **DecodeEventLog** node
  - Input: ABI, topics, data
  - Output: decoded event data

- [ ] **GetContractAddress** node
  - Input: deployer address, nonce (or salt for CREATE2)
  - Output: predicted contract address

- [ ] **ValidateAddress** node
  - Input: address string
  - Output: boolean, checksummed address

- [ ] **GetChainId** node
  - Output: current chain ID

- [ ] **GetChain** node
  - Output: chain information

### Phase 9: Advanced Operations (Week 7)

- [ ] **GetStorageAt** node
  - Input: address, storage slot, block
  - Output: storage value

- [ ] **GetProof** node
  - Input: address, storage keys, block
  - Output: account proof

- [ ] **Call** node
  - Input: to, data, from, gas, value
  - Output: call result

- [ ] **CreateBlockFilter** node
  - Output: filter ID

- [ ] **CreateEventFilter** node
  - Input: address, topics, from block, to block
  - Output: filter ID

- [ ] **CreatePendingTransactionFilter** node
  - Output: filter ID

- [ ] **GetFilterChanges** node
  - Input: filter ID
  - Output: changes since last poll

- [ ] **GetFilterLogs** node
  - Input: filter ID
  - Output: all logs for filter

- [ ] **UninstallFilter** node
  - Input: filter ID
  - Output: success boolean

## Implementation Guidelines

### Node Implementation Template

Each node should follow this structure:

```typescript
import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';
import { createPublicClient, http } from 'viem';
// Import other necessary functions

export class NodeName implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Node Display Name',
    name: 'nodeName',
    group: ['transform'],
    version: 1,
    description: 'Node description',
    defaults: {
      name: 'Node Name',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      // List required credentials
    ],
    properties: [
      // Define input fields
    ],
  };

  async execute(this: IExecuteFunctions) {
    // Implementation
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // Get credentials
        // Create viem client
        // Perform operation
        // Format output

        returnData.push({
          json: { /* result */ },
        });
      } catch (error) {
        // Handle errors
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}
```

### Best Practices

1. **Error Handling**
   - Catch and parse viem errors
   - Provide user-friendly error messages
   - Support `continueOnFail` mode
   - Extract revert reasons from contract errors

2. **Type Safety**
   - Use TypeScript strictly
   - Leverage viem's type system
   - Define clear input/output types

3. **Performance**
   - Reuse client instances when possible
   - Implement batching where applicable
   - Add caching for repeated calls

4. **User Experience**
   - Provide helpful descriptions
   - Use sensible defaults
   - Add input validation
   - Support both simple and advanced modes

5. **Testing**
   - Unit tests for utility functions
   - Integration tests with test networks
   - Mock viem clients for unit tests

6. **Documentation**
   - Clear node descriptions
   - Example workflows
   - Parameter documentation
   - Common use cases

## Testing Strategy

### Unit Tests
- Test utility functions
- Test ABI parsing
- Test error handling
- Mock viem clients

### Integration Tests
- Test against local Hardhat/Anvil node
- Test against public testnets
- Test with real contracts

### End-to-End Tests
- Complete workflows
- Multi-node interactions
- Trigger functionality

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "n8n-workflow": "latest",
    "n8n-core": "latest",
    "viem": "^2.x",
    "abitype": "^1.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "typescript": "^5.x",
    "hardhat": "^2.x",
    "@nomicfoundation/hardhat-viem": "^2.x",
    "vitest": "^1.x"
  }
}
```

## Milestones

- **Week 1-2**: Core infrastructure + basic operations (15 nodes)
- **Week 3**: Triggers + advanced contract operations (8 components)
- **Week 4**: Token standards ERC20/721 (18 nodes)
- **Week 5**: ERC1155 + ENS + Gas + Signatures (19 nodes)
- **Week 6**: Utility nodes (10 nodes)
- **Week 7**: Advanced operations + Polish (8 nodes)
- **Week 8**: Testing, documentation, examples

## Success Criteria

- [ ] All 84 components implemented
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] Example workflows provided
- [ ] Published to npm
- [ ] Listed in n8n community nodes

## Future Enhancements

- Support for layer 2 solutions (Optimism, zkSync, etc.)
- GraphQL integration for The Graph
- IPFS integration for metadata
- Wallet Connect support
- Hardware wallet support
- Multi-sig wallet support
- Flashbots integration
- MEV protection
- Advanced DeFi protocols (Uniswap, Aave, etc.)
- Cross-chain bridge integrations
