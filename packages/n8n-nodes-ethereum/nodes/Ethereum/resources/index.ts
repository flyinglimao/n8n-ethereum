/**
 * Ethereum Resources Module Index
 *
 * Re-exports all resource properties and execute functions.
 * Each resource module provides:
 * - Operations definition (INodeProperties)
 * - Properties definitions (INodeProperties[])
 * - Execute function for handling operations
 */

// Account Resource
export {
    accountOperations,
    accountProperties,
    executeAccount,
} from "./account";

// Block Resource
export {
    blockOperations,
    blockProperties,
    executeBlock,
} from "./block";

// Gas Resource
export {
    gasOperations,
    gasProperties,
    executeGas,
} from "./gas";

// Transaction Resource
export {
    transactionProperties,
    executeTransaction,
    type TransactionExecuteParams,
} from "./transaction";

// Custom RPC Resource
export {
    customRpcProperties,
    executeCustomRpc,
    type CustomRpcExecuteParams,
} from "./customRpc";

// Utils Resource
export {
    utilsOperations,
    utilsProperties,
    executeUtils,
} from "./utils";

// Contract Resource
export {
    contractProperties,
    executeContract,
} from "./contract";

// Signature Resource
export {
    signatureProperties,
    executeSignature,
} from "./signature";

// ERC20 Resource
export { erc20Properties, executeErc20 } from "./erc20";

// ERC721 Resource
export { erc721Properties, executeErc721 } from "./erc721";

// ERC1155 Resource
export { erc1155Properties, executeErc1155 } from "./erc1155";
