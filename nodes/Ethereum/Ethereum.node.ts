import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from "n8n-workflow";
import {
  createPublicClient as viemCreatePublicClient,
  createWalletClient as viemCreateWalletClient,
  http,
  webSocket,
  formatUnits,
  parseUnits,
  isAddress,
  encodeFunctionData,
  decodeFunctionData,
  decodeEventLog,
  keccak256,
  toHex,
  fromHex,
  parseAbi,
  PublicClient,
  recoverMessageAddress,
  verifyMessage,
} from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { getChain } from "../../utils/chainConfig";
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI } from "../../utils/constants";
import { parseViemError } from "../../utils/errorHandling";

// Helper functions
function createPublicClient(credentials: any) {
  const rpcUrl = credentials.rpcUrl as string;

  let headers: Record<string, string> = {};
  if (credentials.customHeaders) {
    try {
      headers = JSON.parse(credentials.customHeaders as string);
    } catch (error) {
      throw new Error("Invalid custom headers JSON");
    }
  }

  const isWebSocket = rpcUrl.startsWith("ws://") || rpcUrl.startsWith("wss://");

  const transport = isWebSocket
    ? webSocket(rpcUrl)
    : http(rpcUrl, {
        fetchOptions: {
          headers,
        },
      });

  return viemCreatePublicClient({
    transport,
  });
}

function createWalletClient(
  publicClient: PublicClient,
  rpcCredentials: any,
  accountCredentials: any
) {
  const hasPrivateKey =
    accountCredentials.privateKey &&
    (accountCredentials.privateKey as string).trim() !== "";
  const hasMnemonic =
    accountCredentials.mnemonic &&
    (accountCredentials.mnemonic as string).trim() !== "";

  let account;
  if (hasPrivateKey) {
    const privateKey = accountCredentials.privateKey as string;
    const formattedKey = privateKey.startsWith("0x")
      ? (privateKey as `0x${string}`)
      : (`0x${privateKey}` as `0x${string}`);
    
    // Validate private key format
    const keyWithoutPrefix = formattedKey.slice(2);
    if (keyWithoutPrefix.length !== 64 || !/^[0-9a-fA-F]+$/.test(keyWithoutPrefix)) {
      throw new Error('Invalid private key format. Must be 64 hexadecimal characters.');
    }
    
    try {
      account = privateKeyToAccount(formattedKey);
    } catch (error: any) {
      throw new Error(`Invalid private key: ${error.message}`);
    }
  } else if (hasMnemonic) {
    const mnemonic = accountCredentials.mnemonic as string;
    
    // Validate mnemonic format (12 or 24 words)
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Invalid mnemonic: must be either 12 or 24 words');
    }
    
    const path = (accountCredentials.path as string) || "m/44'/60'/0'/0/0";
    const passphrase = (accountCredentials.passphrase as string) || '';
    
    // Validate path format (must start with m/44'/60'/)
    if (!path.startsWith("m/44'/60'/")) {
      throw new Error(`Invalid derivation path: must start with m/44'/60'/`);
    }
    
    try {
      // Type assertion is necessary here as the path string format cannot be 
      // statically verified to match viem's template literal type at compile time
      account = mnemonicToAccount(mnemonic, {
        path: path as `m/44'/60'/${string}`,
        ...(passphrase && { passphrase }),
      });
    } catch (error: any) {
      throw new Error(`Invalid mnemonic or derivation path: ${error.message}`);
    }
  } else {
    throw new Error(
      "Private Key or Mnemonic Phrase is required in the Ethereum Account credential for write operations"
    );
  }

  // Recreate transport from RPC credentials
  const rpcUrl = rpcCredentials.rpcUrl as string;
  let headers: Record<string, string> = {};
  if (rpcCredentials.customHeaders) {
    try {
      headers = JSON.parse(rpcCredentials.customHeaders as string);
    } catch (error) {
      throw new Error("Invalid custom headers JSON");
    }
  }

  const isWebSocket = rpcUrl.startsWith("ws://") || rpcUrl.startsWith("wss://");
  const transport = isWebSocket
    ? webSocket(rpcUrl)
    : http(rpcUrl, {
        fetchOptions: {
          headers,
        },
      });

  return viemCreateWalletClient({
    account,
    chain: publicClient.chain,
    transport,
  });
}

function parseBlockIdentifier(blockStr: string): any {
  if (
    blockStr === "latest" ||
    blockStr === "earliest" ||
    blockStr === "pending"
  ) {
    return blockStr;
  }
  return BigInt(blockStr);
}

function parseTokenAmount(amountStr: string, decimals: number): bigint {
  // Check if it's already in wei (numeric string with no decimal point)
  if (/^\d+$/.test(amountStr)) {
    return BigInt(amountStr);
  }
  // Otherwise parse as decimal
  return parseUnits(amountStr, decimals);
}

export class Ethereum implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Ethereum",
    name: "ethereum",
    icon: "file:ethereum.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: "Interact with Ethereum blockchain",
    defaults: {
      name: "Ethereum",
    },
    inputs: ["main"],
    outputs: ["main"],
    documentationUrl: "https://flyinglimao.github.io/n8n-ethereum/",
    credentials: [
      {
        name: "ethereumRpc",
        required: true,
      },
      {
        name: "ethereumAccount",
        required: false,
      },
    ],
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Account",
            value: "account",
          },
          {
            name: "Block",
            value: "block",
          },
          {
            name: "Transaction",
            value: "transaction",
          },
          {
            name: "Contract",
            value: "contract",
          },
          {
            name: "ERC20",
            value: "erc20",
          },
          {
            name: "ERC721",
            value: "erc721",
          },
          {
            name: "ERC1155",
            value: "erc1155",
          },
          {
            name: "Gas",
            value: "gas",
          },
          {
            name: "Signature",
            value: "signature",
          },
          {
            name: "Utils",
            value: "utils",
          },
          {
            name: "Custom RPC",
            value: "customRpc",
          },
        ],
        default: "account",
      },

      // ===========================================
      //          Account Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["account"],
          },
        },
        options: [
          {
            name: "Get Balance",
            value: "getBalance",
            description: "Get ETH balance of an address",
            action: "Get balance of an account",
          },
          {
            name: "Get Transaction Count",
            value: "getTransactionCount",
            description: "Get nonce of an address",
            action: "Get transaction count of an account",
          },
          {
            name: "Get Code",
            value: "getCode",
            description: "Check if address is a contract",
            action: "Get code of an account",
          },
          {
            name: "Get Current Address",
            value: "getCurrentAddress",
            description: "Get address of the current wallet credential",
            action: "Get current wallet address",
          },
        ],
        default: "getBalance",
      },

      // Account: Get Balance
      {
        displayName: "Address",
        name: "address",
        type: "string",
        displayOptions: {
          show: {
            resource: ["account"],
            operation: ["getBalance", "getTransactionCount", "getCode"],
          },
        },
        default: "",
        placeholder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        description:
          "The Ethereum address to query (leave empty to use credential address)",
      },
      {
        displayName: "Block",
        name: "blockTag",
        type: "options",
        displayOptions: {
          show: {
            resource: ["account"],
            operation: ["getBalance", "getTransactionCount", "getCode"],
          },
        },
        options: [
          {
            name: "Latest",
            value: "latest",
          },
          {
            name: "Earliest",
            value: "earliest",
          },
          {
            name: "Pending",
            value: "pending",
          },
          {
            name: "Custom Block Number",
            value: "custom",
          },
        ],
        default: "latest",
      },
      {
        displayName: "Block Number",
        name: "blockNumber",
        type: "number",
        displayOptions: {
          show: {
            resource: ["account"],
            operation: ["getBalance", "getTransactionCount", "getCode"],
            blockTag: ["custom"],
          },
        },
        default: 0,
        description: "The block number to query",
      },

      // ===========================================
      //          Block Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["block"],
          },
        },
        options: [
          {
            name: "Get Block",
            value: "getBlock",
            description: "Get block by number or hash",
            action: "Get a block",
          },
          {
            name: "Get Block Number",
            value: "getBlockNumber",
            description: "Get latest block number",
            action: "Get block number",
          },
        ],
        default: "getBlock",
      },

      // Block: Get Block
      {
        displayName: "Block Identifier Type",
        name: "blockIdentifierType",
        type: "options",
        displayOptions: {
          show: {
            resource: ["block"],
            operation: ["getBlock"],
          },
        },
        options: [
          {
            name: "Block Number",
            value: "number",
          },
          {
            name: "Block Hash",
            value: "hash",
          },
          {
            name: "Block Tag",
            value: "tag",
          },
        ],
        default: "tag",
      },
      {
        displayName: "Block Number",
        name: "blockNumber",
        type: "number",
        displayOptions: {
          show: {
            resource: ["block"],
            operation: ["getBlock"],
            blockIdentifierType: ["number"],
          },
        },
        default: 0,
      },
      {
        displayName: "Block Hash",
        name: "blockHash",
        type: "string",
        displayOptions: {
          show: {
            resource: ["block"],
            operation: ["getBlock"],
            blockIdentifierType: ["hash"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Block Tag",
        name: "blockTag",
        type: "options",
        displayOptions: {
          show: {
            resource: ["block"],
            operation: ["getBlock"],
            blockIdentifierType: ["tag"],
          },
        },
        options: [
          {
            name: "Latest",
            value: "latest",
          },
          {
            name: "Earliest",
            value: "earliest",
          },
          {
            name: "Pending",
            value: "pending",
          },
        ],
        default: "latest",
      },
      {
        displayName: "Include Transactions",
        name: "includeTransactions",
        type: "boolean",
        displayOptions: {
          show: {
            resource: ["block"],
            operation: ["getBlock"],
          },
        },
        default: false,
        description:
          "Whether to include full transaction objects or just transaction hashes",
      },

      // ===========================================
      //          Transaction Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["transaction"],
          },
        },
        options: [
          {
            name: "Send Transaction",
            value: "sendTransaction",
            description: "Send ETH with optional data",
            action: "Send a transaction",
          },
          {
            name: "Get Transaction",
            value: "getTransaction",
            description: "Get transaction by hash",
            action: "Get a transaction",
          },
          {
            name: "Get Transaction Receipt",
            value: "getTransactionReceipt",
            description: "Get transaction receipt",
            action: "Get transaction receipt",
          },
          {
            name: "Wait For Transaction",
            value: "waitForTransaction",
            description: "Wait for transaction confirmation",
            action: "Wait for transaction",
          },
          {
            name: "Estimate Gas",
            value: "estimateGas",
            description: "Estimate gas for a transaction",
            action: "Estimate gas",
          },
        ],
        default: "sendTransaction",
      },

      // Transaction: Send Transaction
      {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["transaction"],
            operation: ["sendTransaction", "estimateGas"],
          },
        },
        default: "",
        placeholder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      },
      {
        displayName: "Value (ETH)",
        name: "value",
        type: "string",
        displayOptions: {
          show: {
            resource: ["transaction"],
            operation: ["sendTransaction", "estimateGas"],
          },
        },
        default: "0",
        description: 'Amount of ETH to send (e.g., "0.1" for 0.1 ETH)',
      },
      {
        displayName: "Data",
        name: "data",
        type: "string",
        displayOptions: {
          show: {
            resource: ["transaction"],
            operation: ["sendTransaction", "estimateGas"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "Transaction data (optional)",
      },

      // Transaction: Get Transaction / Get Receipt / Wait
      {
        displayName: "Transaction Hash",
        name: "transactionHash",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["transaction"],
            operation: [
              "getTransaction",
              "getTransactionReceipt",
              "waitForTransaction",
            ],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Confirmations",
        name: "confirmations",
        type: "number",
        displayOptions: {
          show: {
            resource: ["transaction"],
            operation: ["waitForTransaction"],
          },
        },
        default: 1,
        description: "Number of confirmations to wait for",
      },

      // ===========================================
      //          Contract Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["contract"],
          },
        },
        options: [
          {
            name: "Read",
            value: "read",
            description: "Call view/pure function",
            action: "Read from contract",
          },
          {
            name: "Write",
            value: "write",
            description: "Execute state-changing function",
            action: "Write to contract",
          },
          {
            name: "Deploy",
            value: "deploy",
            description: "Deploy a new contract",
            action: "Deploy contract",
          },
          {
            name: "Get Logs",
            value: "getLogs",
            description: "Query contract events",
            action: "Get contract logs",
          },
        ],
        default: "read",
      },

      // Contract: Read/Write
      {
        displayName: "Contract Address",
        name: "contractAddress",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write", "getLogs"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "ABI",
        name: "abi",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write", "deploy"],
          },
        },
        default: "[]",
        description: "Contract ABI as JSON array",
      },
      {
        displayName: "Use Raw Calldata",
        name: "useRawCalldata",
        type: "boolean",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write"],
          },
        },
        default: false,
        description:
          "Whether to use raw calldata instead of function name and parameters",
      },
      {
        displayName: "Function Name",
        name: "functionName",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write"],
            useRawCalldata: [false],
          },
        },
        default: "",
        description: "Name of the function to call",
      },
      {
        displayName: "Parameters",
        name: "parameters",
        type: "json",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write"],
            useRawCalldata: [false],
          },
        },
        default: "[]",
        description: "Function parameters as JSON array",
      },
      {
        displayName: "Calldata",
        name: "calldata",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["read", "write"],
            useRawCalldata: [true],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "Raw calldata for the function call",
      },

      // Contract: Deploy
      {
        displayName: "Bytecode",
        name: "bytecode",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["deploy"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "Contract bytecode",
      },
      {
        displayName: "Constructor Arguments",
        name: "constructorArgs",
        type: "json",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["deploy"],
          },
        },
        default: "[]",
        description: "Constructor arguments as JSON array",
      },

      // Contract: Get Logs
      {
        displayName: "ABI",
        name: "logsAbi",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["getLogs"],
          },
        },
        default: "[]",
        description: "Contract ABI as JSON array",
      },
      {
        displayName: "Event Name",
        name: "eventName",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["getLogs"],
          },
        },
        default: "",
        placeholder: "Transfer",
        description: "Event name to filter",
      },
      {
        displayName: "Event Arguments Filter",
        name: "eventArgs",
        type: "json",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["getLogs"],
          },
        },
        default: "{}",
        placeholder: '{"from": "0x...", "to": "0x..."}',
        description: "Filter logs by indexed event arguments (optional)",
      },
      {
        displayName: "From Block",
        name: "fromBlock",
        type: "string",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["getLogs"],
          },
        },
        default: "latest",
        description: 'Starting block (number or "latest"/"earliest")',
      },
      {
        displayName: "To Block",
        name: "toBlock",
        type: "string",
        displayOptions: {
          show: {
            resource: ["contract"],
            operation: ["getLogs"],
          },
        },
        default: "latest",
        description: 'Ending block (number or "latest"/"earliest")',
      },

      // ===========================================
      //          ERC20 Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
          },
        },
        options: [
          {
            name: "Get Balance",
            value: "getBalance",
            description: "Get token balance of an address",
            action: "Get ERC20 balance",
          },
          {
            name: "Get Token Info",
            value: "getTokenInfo",
            description: "Get name, symbol, decimals, and total supply",
            action: "Get token info",
          },
          {
            name: "Transfer",
            value: "transfer",
            description: "Transfer tokens",
            action: "Transfer ERC20 tokens",
          },
          {
            name: "Approve",
            value: "approve",
            description: "Approve spender",
            action: "Approve ERC20 spender",
          },
          {
            name: "Transfer From",
            value: "transferFrom",
            description: "Transfer tokens from address",
            action: "Transfer ERC20 from",
          },
          {
            name: "Get Allowance",
            value: "getAllowance",
            description: "Get allowance",
            action: "Get ERC20 allowance",
          },
        ],
        default: "getBalance",
      },

      // ERC20: Common
      {
        displayName: "Token Address",
        name: "tokenAddress",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "ERC20 token contract address",
      },

      // ERC20: Get Balance
      {
        displayName: "Address",
        name: "address",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["getBalance"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ERC20: Transfer
      {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["transfer"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Amount",
        name: "amount",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["transfer", "approve"],
          },
        },
        default: "",
        description:
          'Amount in token units (e.g., "1.5" for 1.5 tokens) or wei',
      },

      // ERC20: Approve
      {
        displayName: "Spender Address",
        name: "spender",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["approve"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ERC20: Transfer From
      {
        displayName: "From Address",
        name: "from",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["transferFrom"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["transferFrom"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Amount",
        name: "amount",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["transferFrom"],
          },
        },
        default: "",
      },

      // ERC20: Get Allowance
      {
        displayName: "Owner Address",
        name: "owner",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["getAllowance"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Spender Address",
        name: "spender",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc20"],
            operation: ["getAllowance"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ===========================================
      //          ERC721 Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
          },
        },
        options: [
          {
            name: "Get Balance",
            value: "getBalance",
            description: "Get NFT balance",
            action: "Get ERC721 balance",
          },
          {
            name: "Owner Of",
            value: "ownerOf",
            description: "Get owner of token ID",
            action: "Get owner of ERC721 token",
          },
          {
            name: "Transfer From",
            value: "transferFrom",
            description: "Transfer NFT",
            action: "Transfer ERC721 token",
          },
          {
            name: "Safe Transfer From",
            value: "safeTransferFrom",
            description: "Safely transfer NFT",
            action: "Safe transfer ERC721 token",
          },
          {
            name: "Approve",
            value: "approve",
            description: "Approve address for token",
            action: "Approve ERC721 token",
          },
          {
            name: "Set Approval For All",
            value: "setApprovalForAll",
            description: "Set operator approval",
            action: "Set ERC721 approval for all",
          },
          {
            name: "Get Approved",
            value: "getApproved",
            description: "Get approved address",
            action: "Get ERC721 approved",
          },
          {
            name: "Is Approved For All",
            value: "isApprovedForAll",
            description: "Check operator approval",
            action: "Check ERC721 approval",
          },
          {
            name: "Token URI",
            value: "tokenURI",
            description: "Get token metadata URI",
            action: "Get ERC721 token URI",
          },
        ],
        default: "getBalance",
      },

      // ERC721: Common
      {
        displayName: "Contract Address",
        name: "contractAddress",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "ERC721 NFT contract address",
      },

      // ERC721: Get Balance
      {
        displayName: "Owner Address",
        name: "owner",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["getBalance"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ERC721: Token ID operations
      {
        displayName: "Token ID",
        name: "tokenId",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: [
              "ownerOf",
              "transferFrom",
              "safeTransferFrom",
              "approve",
              "getApproved",
              "tokenURI",
            ],
          },
        },
        default: "",
      },

      // ERC721: Transfer operations
      {
        displayName: "From Address",
        name: "from",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["transferFrom", "safeTransferFrom"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["transferFrom", "safeTransferFrom", "approve"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Data",
        name: "data",
        type: "string",
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["safeTransferFrom"],
          },
        },
        default: "0x",
        description: "Additional data to send with safe transfer",
      },

      // ERC721: Approval operations
      {
        displayName: "Operator Address",
        name: "operator",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["setApprovalForAll", "isApprovedForAll"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Approved",
        name: "approved",
        type: "boolean",
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["setApprovalForAll"],
          },
        },
        default: true,
      },
      {
        displayName: "Owner Address",
        name: "owner",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc721"],
            operation: ["isApprovedForAll"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ===========================================
      //          ERC1155 Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
          },
        },
        options: [
          {
            name: "Balance Of",
            value: "balanceOf",
            description: "Get token balance",
            action: "Get ERC1155 balance",
          },
          {
            name: "Balance Of Batch",
            value: "balanceOfBatch",
            description: "Get multiple balances",
            action: "Get ERC1155 batch balances",
          },
          {
            name: "Safe Transfer From",
            value: "safeTransferFrom",
            description: "Transfer tokens",
            action: "Transfer ERC1155 tokens",
          },
          {
            name: "Safe Batch Transfer From",
            value: "safeBatchTransferFrom",
            description: "Batch transfer tokens",
            action: "Batch transfer ERC1155 tokens",
          },
          {
            name: "Set Approval For All",
            value: "setApprovalForAll",
            description: "Set operator approval",
            action: "Set ERC1155 approval",
          },
          {
            name: "Is Approved For All",
            value: "isApprovedForAll",
            description: "Check operator approval",
            action: "Check ERC1155 approval",
          },
          {
            name: "URI",
            value: "uri",
            description: "Get token metadata URI",
            action: "Get ERC1155 URI",
          },
        ],
        default: "balanceOf",
      },

      // ERC1155: Common
      {
        displayName: "Contract Address",
        name: "contractAddress",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ERC1155: Balance Of
      {
        displayName: "Account Address",
        name: "account",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["balanceOf"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Token ID",
        name: "id",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["balanceOf", "uri"],
          },
        },
        default: "",
      },

      // ERC1155: Balance Of Batch
      {
        displayName: "Accounts",
        name: "accounts",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["balanceOfBatch"],
          },
        },
        default: "[]",
        description: "Array of account addresses",
      },
      {
        displayName: "Token IDs",
        name: "ids",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["balanceOfBatch"],
          },
        },
        default: "[]",
        description: "Array of token IDs",
      },

      // ERC1155: Transfer operations
      {
        displayName: "From Address",
        name: "from",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeTransferFrom", "safeBatchTransferFrom"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeTransferFrom", "safeBatchTransferFrom"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Token ID",
        name: "id",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeTransferFrom"],
          },
        },
        default: "",
      },
      {
        displayName: "Amount",
        name: "amount",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeTransferFrom"],
          },
        },
        default: "",
      },
      {
        displayName: "Token IDs",
        name: "ids",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeBatchTransferFrom"],
          },
        },
        default: "[]",
      },
      {
        displayName: "Amounts",
        name: "amounts",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeBatchTransferFrom"],
          },
        },
        default: "[]",
      },
      {
        displayName: "Data",
        name: "data",
        type: "string",
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["safeTransferFrom", "safeBatchTransferFrom"],
          },
        },
        default: "0x",
      },

      // ERC1155: Approval operations
      {
        displayName: "Operator Address",
        name: "operator",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["setApprovalForAll", "isApprovedForAll"],
          },
        },
        default: "",
        placeholder: "0x...",
      },
      {
        displayName: "Approved",
        name: "approved",
        type: "boolean",
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["setApprovalForAll"],
          },
        },
        default: true,
      },
      {
        displayName: "Account Address",
        name: "account",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["erc1155"],
            operation: ["isApprovedForAll"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ===========================================
      //          Signature Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["signature"],
          },
        },
        options: [
          {
            name: "Sign Message",
            value: "signMessage",
            description: "Sign a raw message",
            action: "Sign a message",
          },
          {
            name: "Sign Typed Data",
            value: "signTypedData",
            description: "Sign EIP-712 typed data",
            action: "Sign typed data",
          },
          {
            name: "Sign SIWE Message",
            value: "signSiwe",
            description: "Sign-In with Ethereum (EIP-4361)",
            action: "Sign SIWE message",
          },
          {
            name: "Recover Address",
            value: "recoverAddress",
            description: "Recover address from signature",
            action: "Recover address from signature",
          },
          {
            name: "Verify Message",
            value: "verifyMessage",
            description: "Verify a message signature",
            action: "Verify message signature",
          },
        ],
        default: "signMessage",
      },

      // Signature: Sign Message
      {
        displayName: "Message",
        name: "message",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signMessage", "verifyMessage", "recoverAddress"],
          },
        },
        default: "",
        placeholder: "Hello, Ethereum!",
        description: "The message to sign or verify",
      },

      // Signature: Sign Typed Data
      {
        displayName: "Typed Data",
        name: "typedData",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signTypedData"],
          },
        },
        default: "{}",
        description: "EIP-712 typed data object",
        placeholder: '{"domain": {...}, "types": {...}, "message": {...}}',
      },

      // Signature: Sign SIWE
      {
        displayName: "Domain",
        name: "siweDomain",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signSiwe"],
          },
        },
        default: "",
        placeholder: "example.com",
        description: "The domain requesting the signature",
      },
      {
        displayName: "Statement",
        name: "siweStatement",
        type: "string",
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signSiwe"],
          },
        },
        default: "",
        placeholder: "Sign in to Example",
        description: "Human-readable statement",
      },
      {
        displayName: "URI",
        name: "siweUri",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signSiwe"],
          },
        },
        default: "",
        placeholder: "https://example.com",
        description: "URI of the requesting application",
      },
      {
        displayName: "Nonce",
        name: "siweNonce",
        type: "string",
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["signSiwe"],
          },
        },
        default: "",
        placeholder: "random-nonce",
        description: "Random nonce for replay protection",
      },

      // Signature: Verify Message / Recover Address
      {
        displayName: "Signature",
        name: "signature",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["verifyMessage", "recoverAddress"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "The signature to verify",
      },
      {
        displayName: "Address",
        name: "address",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["signature"],
            operation: ["verifyMessage"],
          },
        },
        default: "",
        placeholder: "0x...",
        description: "The address that supposedly signed the message",
      },

      // ===========================================
      //          Gas Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["gas"],
          },
        },
        options: [
          {
            name: "Get Gas Price",
            value: "getGasPrice",
            description: "Get current gas price",
            action: "Get gas price",
          },
          {
            name: "Get Fee History",
            value: "getFeeHistory",
            description: "Get historical fee data",
            action: "Get fee history",
          },
          {
            name: "Estimate Max Priority Fee",
            value: "estimateMaxPriorityFee",
            description: "Estimate EIP-1559 priority fee",
            action: "Estimate max priority fee",
          },
        ],
        default: "getGasPrice",
      },

      // Gas: Get Fee History
      {
        displayName: "Block Count",
        name: "blockCount",
        type: "number",
        displayOptions: {
          show: {
            resource: ["gas"],
            operation: ["getFeeHistory"],
          },
        },
        default: 4,
        description: "Number of blocks to include",
      },
      {
        displayName: "Reward Percentiles",
        name: "rewardPercentiles",
        type: "json",
        displayOptions: {
          show: {
            resource: ["gas"],
            operation: ["getFeeHistory"],
          },
        },
        default: "[25, 50, 75]",
        description: "Array of reward percentiles",
      },

      // ===========================================
      //          Utils Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["utils"],
          },
        },
        options: [
          {
            name: "Format Units",
            value: "formatUnits",
            description: "Convert wei to decimal",
            action: "Format units",
          },
          {
            name: "Parse Units",
            value: "parseUnits",
            description: "Convert decimal to wei",
            action: "Parse units",
          },
          {
            name: "Validate Address",
            value: "validateAddress",
            description: "Check if valid Ethereum address",
            action: "Validate address",
          },
          {
            name: "Get Chain ID",
            value: "getChainId",
            description: "Get current chain ID",
            action: "Get chain ID",
          },
          {
            name: "Encode Function Data",
            value: "encodeFunctionData",
            description: "Encode function call data",
            action: "Encode function data",
          },
          {
            name: "Decode Function Data",
            value: "decodeFunctionData",
            description: "Decode calldata",
            action: "Decode function data",
          },
          {
            name: "Keccak256",
            value: "keccak256",
            description: "Hash data with keccak256",
            action: "Hash with keccak256",
          },
        ],
        default: "formatUnits",
      },

      // Utils: Format Units
      {
        displayName: "Value",
        name: "value",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["formatUnits"],
          },
        },
        default: "",
        description: "Value in wei",
      },
      {
        displayName: "Decimals",
        name: "decimals",
        type: "number",
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["formatUnits", "parseUnits"],
          },
        },
        default: 18,
        description: "Number of decimals (18 for ETH)",
      },

      // Utils: Parse Units
      {
        displayName: "Value",
        name: "value",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["parseUnits"],
          },
        },
        default: "",
        description: 'Decimal value (e.g., "1.5")',
      },

      // Utils: Validate Address
      {
        displayName: "Address",
        name: "address",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["validateAddress"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // Utils: Encode/Decode Function Data
      {
        displayName: "ABI",
        name: "abi",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["encodeFunctionData", "decodeFunctionData"],
          },
        },
        default: "[]",
      },
      {
        displayName: "Function Name",
        name: "functionName",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["encodeFunctionData"],
          },
        },
        default: "",
      },
      {
        displayName: "Arguments",
        name: "args",
        type: "json",
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["encodeFunctionData"],
          },
        },
        default: "[]",
      },
      {
        displayName: "Data",
        name: "data",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["decodeFunctionData", "keccak256"],
          },
        },
        default: "",
        placeholder: "0x...",
      },

      // ===========================================
      //          Custom RPC Resource
      // ===========================================
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["customRpc"],
          },
        },
        options: [
          {
            name: "Request",
            value: "request",
            description: "Send a custom RPC request",
            action: "Send custom RPC request",
          },
        ],
        default: "request",
      },

      // Custom RPC: Request
      {
        displayName: "RPC Method",
        name: "rpcMethod",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            resource: ["customRpc"],
            operation: ["request"],
          },
        },
        default: "",
        placeholder: "eth_getBalance",
        description: "The RPC method to call (e.g., eth_getBalance, eth_call, debug_traceTransaction)",
      },
      {
        displayName: "RPC Parameters",
        name: "rpcParams",
        type: "json",
        displayOptions: {
          show: {
            resource: ["customRpc"],
            operation: ["request"],
          },
        },
        default: "[]",
        placeholder: '["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]',
        description: "The parameters for the RPC method as a JSON array",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const rpcCredentials = await this.getCredentials("ethereumRpc");
    let walletCredentials;
    try {
      walletCredentials = await this.getCredentials("ethereumAccount");
    } catch (error) {
      // Wallet credentials are optional
    }

    // Create clients
    const publicClient = createPublicClient(rpcCredentials);

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter("resource", i) as string;
        const operation = this.getNodeParameter("operation", i) as string;

        let responseData: any = {};

        // ===========================================
        //          Account Resource
        // ===========================================
        if (resource === "account") {
          if (operation === "getCurrentAddress") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required to get current address"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
            responseData = {
              address: walletClient.account!.address,
            };
          } else {
            // Get address from parameter or credential
            let address = this.getNodeParameter("address", i, "") as string;
            if (!address || address.trim() === "") {
              if (!walletCredentials) {
                throw new NodeOperationError(
                  this.getNode(),
                  "Either provide an address or configure Ethereum Account credential"
                );
              }
              const walletClient = createWalletClient(
                publicClient,
                rpcCredentials,
                walletCredentials
              );
              address = walletClient.account!.address;
            }

            const blockTag = this.getNodeParameter("blockTag", i) as string;
            let blockNumber: bigint | undefined;
            if (blockTag === "custom") {
              blockNumber = BigInt(
                this.getNodeParameter("blockNumber", i) as number
              );
            }

            if (operation === "getBalance") {
              const balance = await publicClient.getBalance({
                address: address as `0x${string}`,
                blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
                blockNumber: blockNumber,
              });
              responseData = {
                address,
                balance: balance.toString(),
                balanceEth: formatUnits(balance, 18),
              };
            } else if (operation === "getTransactionCount") {
              const count = await publicClient.getTransactionCount({
                address: address as `0x${string}`,
                blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
                blockNumber: blockNumber,
              });
              responseData = {
                address,
                transactionCount: count,
              };
            } else if (operation === "getCode") {
              const code = await publicClient.getCode({
                address: address as `0x${string}`,
                blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
                blockNumber: blockNumber,
              });
              responseData = {
                address,
                code: code || "0x",
                isContract: code && code !== "0x",
              };
            }
          }
        }

        // ===========================================
        //          Block Resource
        // ===========================================
        else if (resource === "block") {
          if (operation === "getBlock") {
            const identifierType = this.getNodeParameter(
              "blockIdentifierType",
              i
            ) as string;
            const includeTransactions = this.getNodeParameter(
              "includeTransactions",
              i
            ) as boolean;

            let block;
            if (identifierType === "number") {
              const blockNumber = BigInt(
                this.getNodeParameter("blockNumber", i) as number
              );
              block = await publicClient.getBlock({
                blockNumber,
                includeTransactions,
              } as any);
            } else if (identifierType === "hash") {
              const blockHash = this.getNodeParameter("blockHash", i) as string;
              block = await publicClient.getBlock({
                blockHash: blockHash as `0x${string}`,
                includeTransactions,
              } as any);
            } else {
              const blockTag = this.getNodeParameter("blockTag", i) as string;
              block = await publicClient.getBlock({
                blockTag: blockTag as any,
                includeTransactions,
              } as any);
            }
            responseData = {
              ...block,
              number: block.number?.toString(),
              timestamp: block.timestamp.toString(),
              gasLimit: block.gasLimit.toString(),
              gasUsed: block.gasUsed.toString(),
              baseFeePerGas: block.baseFeePerGas?.toString(),
            };
          } else if (operation === "getBlockNumber") {
            const blockNumber = await publicClient.getBlockNumber();
            responseData = {
              blockNumber: blockNumber.toString(),
            };
          }
        }

        // ===========================================
        //          Transaction Resource
        // ===========================================
        else if (resource === "transaction") {
          if (operation === "sendTransaction") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transaction operations"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const to = this.getNodeParameter("to", i) as string;
            const valueStr = this.getNodeParameter("value", i) as string;
            const data = this.getNodeParameter("data", i, "0x") as string;

            const value = parseUnits(valueStr || "0", 18);

            const hash = await walletClient.sendTransaction({
              account: walletClient.account!,
              to: to as `0x${string}`,
              value,
              data: data as `0x${string}`,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "getTransaction") {
            const hash = this.getNodeParameter("transactionHash", i) as string;
            const tx = await publicClient.getTransaction({
              hash: hash as `0x${string}`,
            });
            responseData = {
              ...tx,
              value: tx.value.toString(),
              gas: tx.gas.toString(),
              gasPrice: tx.gasPrice?.toString(),
              maxFeePerGas: tx.maxFeePerGas?.toString(),
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
            };
          } else if (operation === "getTransactionReceipt") {
            const hash = this.getNodeParameter("transactionHash", i) as string;
            const receipt = await publicClient.getTransactionReceipt({
              hash: hash as `0x${string}`,
            });
            responseData = {
              ...receipt,
              blockNumber: receipt.blockNumber.toString(),
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice.toString(),
              cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            };
          } else if (operation === "waitForTransaction") {
            const hash = this.getNodeParameter("transactionHash", i) as string;
            const confirmations = this.getNodeParameter(
              "confirmations",
              i
            ) as number;
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: hash as `0x${string}`,
              confirmations,
            });
            responseData = {
              ...receipt,
              blockNumber: receipt.blockNumber.toString(),
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            };
          } else if (operation === "estimateGas") {
            const to = this.getNodeParameter("to", i) as string;
            const valueStr = this.getNodeParameter("value", i) as string;
            const data = this.getNodeParameter("data", i, "0x") as string;

            const value = parseUnits(valueStr || "0", 18);

            const gas = await publicClient.estimateGas({
              to: to as `0x${string}`,
              value,
              data: data as `0x${string}`,
            });

            responseData = {
              gas: gas.toString(),
            };
          }
        }

        // ===========================================
        //          Contract Resource
        // ===========================================
        else if (resource === "contract") {
          if (operation === "read") {
            const contractAddress = this.getNodeParameter(
              "contractAddress",
              i
            ) as string;
            const abiStr = this.getNodeParameter("abi", i) as string;
            const abi = JSON.parse(abiStr);
            const useRawCalldata = this.getNodeParameter(
              "useRawCalldata",
              i
            ) as boolean;

            if (useRawCalldata) {
              const calldata = this.getNodeParameter("calldata", i) as string;
              const result = await publicClient.call({
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
              });
              responseData = {
                data: result.data,
              };
            } else {
              const functionName = this.getNodeParameter(
                "functionName",
                i
              ) as string;
              const parametersStr = this.getNodeParameter(
                "parameters",
                i,
                "[]"
              ) as string;
              const parameters = JSON.parse(parametersStr);

              const result = await publicClient.readContract({
                address: contractAddress as `0x${string}`,
                abi,
                functionName,
                args: parameters,
              });

              responseData = {
                result,
              };
            }
          } else if (operation === "write") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for write operations"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const contractAddress = this.getNodeParameter(
              "contractAddress",
              i
            ) as string;
            const abiStr = this.getNodeParameter("abi", i) as string;
            const abi = JSON.parse(abiStr);
            const useRawCalldata = this.getNodeParameter(
              "useRawCalldata",
              i
            ) as boolean;

            if (useRawCalldata) {
              const calldata = this.getNodeParameter("calldata", i) as string;
              const hash = await walletClient.sendTransaction({
                account: walletClient.account!,
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
                chain: undefined,
              });
              responseData = {
                transactionHash: hash,
              };
            } else {
              const functionName = this.getNodeParameter(
                "functionName",
                i
              ) as string;
              const parametersStr = this.getNodeParameter(
                "parameters",
                i,
                "[]"
              ) as string;
              const parameters = JSON.parse(parametersStr);

              const hash = await walletClient.writeContract({
                address: contractAddress as `0x${string}`,
                abi,
                functionName,
                args: parameters,
                account: walletClient.account!,
                chain: undefined,
              });

              responseData = {
                transactionHash: hash,
              };
            }
          } else if (operation === "deploy") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for deployment"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const abiStr = this.getNodeParameter("abi", i) as string;
            const abi = JSON.parse(abiStr);
            const bytecode = this.getNodeParameter("bytecode", i) as string;
            const constructorArgsStr = this.getNodeParameter(
              "constructorArgs",
              i,
              "[]"
            ) as string;
            const constructorArgs = JSON.parse(constructorArgsStr);

            const hash = await walletClient.deployContract({
              abi,
              bytecode: bytecode as `0x${string}`,
              args: constructorArgs,
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "getLogs") {
            const contractAddress = this.getNodeParameter(
              "contractAddress",
              i
            ) as string;
            const abiStr = this.getNodeParameter("logsAbi", i) as string;
            const abi = JSON.parse(abiStr);
            const eventName = this.getNodeParameter("eventName", i) as string;
            const eventArgsStr = this.getNodeParameter(
              "eventArgs",
              i,
              "{}"
            ) as string;
            const eventArgs = JSON.parse(eventArgsStr);
            const fromBlockStr = this.getNodeParameter(
              "fromBlock",
              i
            ) as string;
            const toBlockStr = this.getNodeParameter("toBlock", i) as string;

            const fromBlock = parseBlockIdentifier(fromBlockStr);
            const toBlock = parseBlockIdentifier(toBlockStr);

            // Find event in ABI
            const eventAbi = abi.find(
              (item: any) => item.type === "event" && item.name === eventName
            );

            if (!eventAbi) {
              throw new NodeOperationError(
                this.getNode(),
                `Event "${eventName}" not found in ABI`
              );
            }

            // Get logs with event filtering
            const logs = await publicClient.getLogs({
              address: contractAddress as `0x${string}`,
              event: eventAbi,
              args: Object.keys(eventArgs).length > 0 ? eventArgs : undefined,
              fromBlock,
              toBlock,
            });

            // Decode logs
            const decodedLogs = logs.map((log: any) => {
              try {
                const decoded: any = decodeEventLog({
                  abi,
                  data: log.data,
                  topics: log.topics,
                });

                return {
                  address: log.address,
                  blockNumber: log.blockNumber.toString(),
                  blockHash: log.blockHash,
                  transactionHash: log.transactionHash,
                  transactionIndex: log.transactionIndex,
                  logIndex: log.logIndex,
                  removed: log.removed,
                  eventName: decoded.eventName,
                  args: decoded.args,
                };
              } catch (error) {
                return {
                  address: log.address,
                  blockNumber: log.blockNumber.toString(),
                  blockHash: log.blockHash,
                  transactionHash: log.transactionHash,
                  data: log.data,
                  topics: log.topics,
                  error: "Failed to decode event",
                };
              }
            });

            responseData = {
              logs: decodedLogs,
            };
          }
        }

        // ===========================================
        //          ERC20 Resource
        // ===========================================
        else if (resource === "erc20") {
          const tokenAddress = this.getNodeParameter(
            "tokenAddress",
            i
          ) as string;

          if (operation === "getBalance") {
            const address = this.getNodeParameter("address", i) as string;
            const balance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            });
            responseData = {
              address,
              balance: (balance as bigint).toString(),
            };
          } else if (operation === "getTokenInfo") {
            const [name, symbol, decimals, totalSupply] = await Promise.all([
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "name",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "symbol",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "totalSupply",
              }),
            ]);
            responseData = {
              name,
              symbol,
              decimals,
              totalSupply: (totalSupply as bigint).toString(),
            };
          } else if (operation === "transfer") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const to = this.getNodeParameter("to", i) as string;
            const amountStr = this.getNodeParameter("amount", i) as string;

            // Get decimals to parse amount
            const decimals = (await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "decimals",
            })) as number;

            const amount = parseTokenAmount(amountStr, decimals);

            const hash = await walletClient.writeContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "transfer",
              args: [to as `0x${string}`, amount],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "approve") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approve"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const spender = this.getNodeParameter("spender", i) as string;
            const amountStr = this.getNodeParameter("amount", i) as string;

            const decimals = (await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "decimals",
            })) as number;

            const amount = parseTokenAmount(amountStr, decimals);

            const hash = await walletClient.writeContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [spender as `0x${string}`, amount],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "transferFrom") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transferFrom"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const from = this.getNodeParameter("from", i) as string;
            const to = this.getNodeParameter("to", i) as string;
            const amountStr = this.getNodeParameter("amount", i) as string;

            const decimals = (await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "decimals",
            })) as number;

            const amount = parseTokenAmount(amountStr, decimals);

            const hash = await walletClient.writeContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "transferFrom",
              args: [from as `0x${string}`, to as `0x${string}`, amount],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "getAllowance") {
            const owner = this.getNodeParameter("owner", i) as string;
            const spender = this.getNodeParameter("spender", i) as string;

            const allowance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [owner as `0x${string}`, spender as `0x${string}`],
            });

            responseData = {
              owner,
              spender,
              allowance: (allowance as bigint).toString(),
            };
          }
        }

        // ===========================================
        //          ERC721 Resource
        // ===========================================
        else if (resource === "erc721") {
          const contractAddress = this.getNodeParameter(
            "contractAddress",
            i
          ) as string;

          if (operation === "getBalance") {
            const owner = this.getNodeParameter("owner", i) as string;
            const balance = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "balanceOf",
              args: [owner as `0x${string}`],
            });
            responseData = {
              owner,
              balance: (balance as bigint).toString(),
            };
          } else if (operation === "ownerOf") {
            const tokenId = this.getNodeParameter("tokenId", i) as string;
            const owner = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "ownerOf",
              args: [BigInt(tokenId)],
            });
            responseData = {
              tokenId,
              owner,
            };
          } else if (operation === "transferFrom") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const from = this.getNodeParameter("from", i) as string;
            const to = this.getNodeParameter("to", i) as string;
            const tokenId = this.getNodeParameter("tokenId", i) as string;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "transferFrom",
              args: [
                from as `0x${string}`,
                to as `0x${string}`,
                BigInt(tokenId),
              ],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "safeTransferFrom") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const from = this.getNodeParameter("from", i) as string;
            const to = this.getNodeParameter("to", i) as string;
            const tokenId = this.getNodeParameter("tokenId", i) as string;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "safeTransferFrom",
              args: [
                from as `0x${string}`,
                to as `0x${string}`,
                BigInt(tokenId),
              ],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "approve") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approve"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const to = this.getNodeParameter("to", i) as string;
            const tokenId = this.getNodeParameter("tokenId", i) as string;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "approve",
              args: [to as `0x${string}`, BigInt(tokenId)],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "setApprovalForAll") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approval"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const operator = this.getNodeParameter("operator", i) as string;
            const approved = this.getNodeParameter("approved", i) as boolean;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "setApprovalForAll",
              args: [operator as `0x${string}`, approved],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "getApproved") {
            const tokenId = this.getNodeParameter("tokenId", i) as string;
            const approved = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "getApproved",
              args: [BigInt(tokenId)],
            });
            responseData = {
              tokenId,
              approved,
            };
          } else if (operation === "isApprovedForAll") {
            const owner = this.getNodeParameter("owner", i) as string;
            const operator = this.getNodeParameter("operator", i) as string;
            const approved = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "isApprovedForAll",
              args: [owner as `0x${string}`, operator as `0x${string}`],
            });
            responseData = {
              owner,
              operator,
              approved,
            };
          } else if (operation === "tokenURI") {
            const tokenId = this.getNodeParameter("tokenId", i) as string;
            const uri = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: "tokenURI",
              args: [BigInt(tokenId)],
            });
            responseData = {
              tokenId,
              uri,
            };
          }
        }

        // ===========================================
        //          ERC1155 Resource
        // ===========================================
        else if (resource === "erc1155") {
          const contractAddress = this.getNodeParameter(
            "contractAddress",
            i
          ) as string;

          if (operation === "balanceOf") {
            const account = this.getNodeParameter("account", i) as string;
            const id = this.getNodeParameter("id", i) as string;
            const balance = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "balanceOf",
              args: [account as `0x${string}`, BigInt(id)],
            });
            responseData = {
              account,
              id,
              balance: (balance as bigint).toString(),
            };
          } else if (operation === "balanceOfBatch") {
            const accountsStr = this.getNodeParameter("accounts", i) as string;
            const idsStr = this.getNodeParameter("ids", i) as string;
            const accounts = JSON.parse(accountsStr);
            const ids = JSON.parse(idsStr).map((id: string) => BigInt(id));

            const balances = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "balanceOfBatch",
              args: [accounts, ids],
            });
            responseData = {
              accounts,
              ids: ids.map((id: bigint) => id.toString()),
              balances: (balances as bigint[]).map((b) => b.toString()),
            };
          } else if (operation === "safeTransferFrom") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const from = this.getNodeParameter("from", i) as string;
            const to = this.getNodeParameter("to", i) as string;
            const id = this.getNodeParameter("id", i) as string;
            const amount = this.getNodeParameter("amount", i) as string;
            const data = this.getNodeParameter("data", i, "0x") as string;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "safeTransferFrom",
              args: [
                from as `0x${string}`,
                to as `0x${string}`,
                BigInt(id),
                BigInt(amount),
                data as `0x${string}`,
              ],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "safeBatchTransferFrom") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const from = this.getNodeParameter("from", i) as string;
            const to = this.getNodeParameter("to", i) as string;
            const idsStr = this.getNodeParameter("ids", i) as string;
            const amountsStr = this.getNodeParameter("amounts", i) as string;
            const data = this.getNodeParameter("data", i, "0x") as string;

            const ids = JSON.parse(idsStr).map((id: string) => BigInt(id));
            const amounts = JSON.parse(amountsStr).map((amount: string) =>
              BigInt(amount)
            );

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "safeBatchTransferFrom",
              args: [
                from as `0x${string}`,
                to as `0x${string}`,
                ids,
                amounts,
                data as `0x${string}`,
              ],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "setApprovalForAll") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approval"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const operator = this.getNodeParameter("operator", i) as string;
            const approved = this.getNodeParameter("approved", i) as boolean;

            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "setApprovalForAll",
              args: [operator as `0x${string}`, approved],
              account: walletClient.account!,
              chain: undefined,
            });

            responseData = {
              transactionHash: hash,
            };
          } else if (operation === "isApprovedForAll") {
            const account = this.getNodeParameter("account", i) as string;
            const operator = this.getNodeParameter("operator", i) as string;
            const approved = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "isApprovedForAll",
              args: [account as `0x${string}`, operator as `0x${string}`],
            });
            responseData = {
              account,
              operator,
              approved,
            };
          } else if (operation === "uri") {
            const id = this.getNodeParameter("id", i) as string;
            const uri = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ERC1155_ABI,
              functionName: "uri",
              args: [BigInt(id)],
            });
            responseData = {
              id,
              uri,
            };
          }
        }

        // ===========================================
        //          Signature Resource
        // ===========================================
        else if (resource === "signature") {
          if (operation === "signMessage") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for signing"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const message = this.getNodeParameter("message", i) as string;
            const signature = await walletClient.signMessage({
              account: walletClient.account!,
              message,
            });

            responseData = {
              message,
              signature,
              address: walletClient.account!.address,
            };
          } else if (operation === "signTypedData") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for signing"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const typedDataStr = this.getNodeParameter("typedData", i) as string;
            const typedData = JSON.parse(typedDataStr);

            const signature = await walletClient.signTypedData({
              account: walletClient.account!,
              domain: typedData.domain,
              types: typedData.types,
              primaryType: typedData.primaryType,
              message: typedData.message,
            });

            responseData = {
              typedData,
              signature,
              address: walletClient.account!.address,
            };
          } else if (operation === "signSiwe") {
            if (!walletCredentials) {
              throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for signing"
              );
            }
            const walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );

            const domain = this.getNodeParameter("siweDomain", i) as string;
            const statement = this.getNodeParameter(
              "siweStatement",
              i,
              ""
            ) as string;
            const uri = this.getNodeParameter("siweUri", i) as string;
            const nonce = this.getNodeParameter(
              "siweNonce",
              i,
              Math.random().toString(36).substring(7)
            ) as string;

            // Build SIWE message
            const address = walletClient.account!.address;
            const chainId = await publicClient.getChainId();
            const issuedAt = new Date().toISOString();

            const siweMessage = [
              `${domain} wants you to sign in with your Ethereum account:`,
              address,
              "",
              statement || "Sign in with Ethereum",
              "",
              `URI: ${uri}`,
              `Version: 1`,
              `Chain ID: ${chainId}`,
              `Nonce: ${nonce}`,
              `Issued At: ${issuedAt}`,
            ].join("\n");

            const signature = await walletClient.signMessage({
              account: walletClient.account!,
              message: siweMessage,
            });

            responseData = {
              message: siweMessage,
              signature,
              address,
              domain,
              uri,
              nonce,
              chainId,
              issuedAt,
            };
          } else if (operation === "recoverAddress") {
            const message = this.getNodeParameter("message", i) as string;
            const signature = this.getNodeParameter("signature", i) as string;

            const recoveredAddress = await recoverMessageAddress({
              message,
              signature: signature as `0x${string}`,
            });

            responseData = {
              message,
              signature,
              recoveredAddress,
            };
          } else if (operation === "verifyMessage") {
            const message = this.getNodeParameter("message", i) as string;
            const signature = this.getNodeParameter("signature", i) as string;
            const address = this.getNodeParameter("address", i) as string;

            const isValid = await verifyMessage({
              address: address as `0x${string}`,
              message,
              signature: signature as `0x${string}`,
            });

            responseData = {
              message,
              signature,
              address,
              isValid,
            };
          }
        }

        // ===========================================
        //          Gas Resource
        // ===========================================
        else if (resource === "gas") {
          if (operation === "getGasPrice") {
            const gasPrice = await publicClient.getGasPrice();
            responseData = {
              gasPrice: gasPrice.toString(),
              gasPriceGwei: formatUnits(gasPrice, 9),
            };
          } else if (operation === "getFeeHistory") {
            const blockCount = this.getNodeParameter("blockCount", i) as number;
            const rewardPercentilesStr = this.getNodeParameter(
              "rewardPercentiles",
              i
            ) as string;
            const rewardPercentiles = JSON.parse(rewardPercentilesStr);

            const feeHistory = await publicClient.getFeeHistory({
              blockCount,
              rewardPercentiles,
            });
            responseData = {
              ...feeHistory,
              baseFeePerGas: feeHistory.baseFeePerGas.map((fee: any) =>
                fee.toString()
              ),
              gasUsedRatio: feeHistory.gasUsedRatio,
              reward: feeHistory.reward?.map((r: any) =>
                r.map((v: any) => v.toString())
              ),
            };
          } else if (operation === "estimateMaxPriorityFee") {
            const maxPriorityFee =
              await publicClient.estimateMaxPriorityFeePerGas();
            responseData = {
              maxPriorityFeePerGas: maxPriorityFee.toString(),
              maxPriorityFeePerGasGwei: formatUnits(maxPriorityFee, 9),
            };
          }
        }

        // ===========================================
        //          Utils Resource
        // ===========================================
        else if (resource === "utils") {
          if (operation === "formatUnits") {
            const value = this.getNodeParameter("value", i) as string;
            const decimals = this.getNodeParameter("decimals", i) as number;
            const formatted = formatUnits(BigInt(value), decimals);
            responseData = {
              value,
              decimals,
              formatted,
            };
          } else if (operation === "parseUnits") {
            const value = this.getNodeParameter("value", i) as string;
            const decimals = this.getNodeParameter("decimals", i) as number;
            const parsed = parseUnits(value, decimals);
            responseData = {
              value,
              decimals,
              parsed: parsed.toString(),
            };
          } else if (operation === "validateAddress") {
            const address = this.getNodeParameter("address", i) as string;
            const valid = isAddress(address);
            responseData = {
              address,
              valid,
            };
          } else if (operation === "getChainId") {
            const chainId = await publicClient.getChainId();
            responseData = {
              chainId,
            };
          } else if (operation === "encodeFunctionData") {
            const abiStr = this.getNodeParameter("abi", i) as string;
            const abi = JSON.parse(abiStr);
            const functionName = this.getNodeParameter(
              "functionName",
              i
            ) as string;
            const argsStr = this.getNodeParameter("args", i, "[]") as string;
            const args = JSON.parse(argsStr);

            const data = encodeFunctionData({
              abi,
              functionName,
              args,
            });
            responseData = {
              data,
            };
          } else if (operation === "decodeFunctionData") {
            const abiStr = this.getNodeParameter("abi", i) as string;
            const abi = JSON.parse(abiStr);
            const data = this.getNodeParameter("data", i) as string;

            const decoded = decodeFunctionData({
              abi,
              data: data as `0x${string}`,
            });
            responseData = {
              functionName: decoded.functionName,
              args: decoded.args,
            };
          } else if (operation === "keccak256") {
            const data = this.getNodeParameter("data", i) as string;
            const hash = keccak256(data as `0x${string}`);
            responseData = {
              data,
              hash,
            };
          }
        }

        // ===========================================
        //          Custom RPC Resource
        // ===========================================
        else if (resource === "customRpc") {
          if (operation === "request") {
            const rpcMethod = this.getNodeParameter("rpcMethod", i) as string;
            const rpcParamsStr = this.getNodeParameter(
              "rpcParams",
              i,
              "[]"
            ) as string;
            const rpcParams = JSON.parse(rpcParamsStr);

            // Make the raw RPC request using the public client's transport
            const result = await publicClient.request({
              method: rpcMethod as any,
              params: rpcParams,
            });

            responseData = {
              method: rpcMethod,
              params: rpcParams,
              result,
            };
          }
        }

        returnData.push({
          json: responseData,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: parseViemError(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), parseViemError(error), {
          itemIndex: i,
        });
      }
    }

    return [returnData];
  }
}
