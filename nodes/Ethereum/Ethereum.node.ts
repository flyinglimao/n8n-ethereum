import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
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
  keccak256,
  PublicClient,
  recoverMessageAddress,
  verifyMessage,
} from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { parseViemError } from "../../utils/errorHandling";
import {
  parseAbiJson,
  getFunctionOptions,
  getEventOptions,
  findAbiFunction,
  abiWithSingleFunction,
} from "../../utils/abiHelpers";
import {
  executeAccount,
  executeBlock,
  transactionProperties,
  executeTransaction,
  contractProperties,
  executeContract,
  customRpcProperties,
  executeCustomRpc,
  erc20Properties,
  executeErc20,
  erc721Properties,
  executeErc721,
  erc1155Properties,
  executeErc1155,
} from "./resources";

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
      ...transactionProperties,

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

      ...contractProperties,

      // ===========================================
      ...erc20Properties,

      ...erc721Properties,

      ...erc1155Properties,

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
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["encodeFunctionData", "decodeFunctionData"],
          },
        },
        default: "[]",
        description:
          "The contract ABI as a JSON array. Once provided, the function can be picked from a dropdown.",
      },
      {
        displayName: "Function",
        name: "functionName",
        type: "options",
        required: true,
        typeOptions: {
          loadOptionsMethod: "getAllFunctions",
          loadOptionsDependsOn: ["abi"],
        },
        displayOptions: {
          show: {
            resource: ["utils"],
            operation: ["encodeFunctionData"],
          },
        },
        default: "",
        description:
          'Function to encode, loaded from the ABI. Choose from the list, or specify a name or full signature using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
      ...customRpcProperties,
    ],
  };

  methods = {
    loadOptions: {
      async getReadFunctions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        return getFunctionOptions(this.getCurrentNodeParameter("abi"), "read");
      },
      async getWriteFunctions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        return getFunctionOptions(this.getCurrentNodeParameter("abi"), "write");
      },
      async getAllFunctions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        return getFunctionOptions(this.getCurrentNodeParameter("abi"), "all");
      },
      async getLogEvents(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        return getEventOptions(this.getCurrentNodeParameter("logsAbi"));
      },
    },
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
          let walletClient;
          if (walletCredentials) {
            walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
          }
          responseData = await executeAccount(
            this,
            i,
            publicClient,
            walletClient
          );
        }

        // ===========================================
        //          Block Resource
        // ===========================================
        else if (resource === "block") {
          responseData = await executeBlock(this, i, publicClient);
        }

        // ===========================================
        //          Transaction Resource
        // ===========================================
        else if (resource === "transaction") {
          let walletClient = null;
          if (walletCredentials) {
            walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
          }

          responseData = await executeTransaction.call(
            this,
            publicClient,
            walletClient,
            operation,
            i
          );
        }

        // ===========================================
        //          Contract Resource
        // ===========================================
        else if (resource === "contract") {
          let walletClient;
          if (walletCredentials) {
            walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
          }
          responseData = await executeContract.call(
            this,
            publicClient,
            walletClient,
            operation,
            i
          );
        }

        // ===========================================
        //          ERC20 Resource
        // ===========================================
        else if (resource === "erc20") {
          responseData = await executeErc20.call(
            this,
            publicClient,
            walletCredentials
              ? createWalletClient(publicClient, rpcCredentials, walletCredentials)
              : undefined,
            operation,
            i
          );
        }

        // ===========================================
        //          ERC721 Resource
        // ===========================================
        else if (resource === "erc721") {
          let walletClient;
          if (walletCredentials) {
            walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
          }
          responseData = await executeErc721.call(
            this,
            publicClient,
            walletClient,
            operation,
            i
          );
        }

        // ===========================================
        //          ERC1155 Resource
        // ===========================================
        else if (resource === "erc1155") {
          let walletClient;
          if (walletCredentials) {
            walletClient = createWalletClient(
              publicClient,
              rpcCredentials,
              walletCredentials
            );
          }
          const executionData = await executeErc1155.call(
            this,
            publicClient,
            walletClient,
            operation,
            i
          );
          responseData = executionData.json;
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
              isValid: valid,
            };
          } else if (operation === "getChainId") {
            const chainId = await publicClient.getChainId();
            responseData = {
              chainId,
            };
          } else if (operation === "encodeFunctionData") {
            const abi = parseAbiJson(this.getNodeParameter("abi", i));
            const functionSelector = this.getNodeParameter(
              "functionName",
              i
            ) as string;
            const argsStr = this.getNodeParameter("args", i, "[]") as string;
            const args = JSON.parse(argsStr);
            const fn = findAbiFunction(abi, functionSelector);

            const data = encodeFunctionData({
              abi: abiWithSingleFunction(abi, fn),
              functionName: fn.name,
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
          const operation = this.getNodeParameter("operation", i) as string;
          const rpcMethod = this.getNodeParameter("rpcMethod", i, "") as string;
          const rpcParams = this.getNodeParameter(
            "rpcParams",
            i,
            "[]"
          ) as string;

          responseData = await executeCustomRpc(publicClient, {
            operation,
            rpcMethod,
            rpcParams,
          });
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
