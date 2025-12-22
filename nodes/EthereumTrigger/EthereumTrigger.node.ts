import {
  INodeType,
  INodeTypeDescription,
  ITriggerFunctions,
  ITriggerResponse,
  IDataObject,
  NodeOperationError,
} from "n8n-workflow";
import {
  createPublicClient as viemCreatePublicClient,
  http,
  webSocket,
  decodeEventLog,
  parseAbi,
} from "viem";
import { getChain } from "../../utils/chainConfig";
import { parseViemError } from "../../utils/errorHandling";

// Helper function
function createPublicClient(credentials: any) {
  const rpcUrl = credentials.rpcUrl as string;
  const chainKey = credentials.chain as string;

  let headers: Record<string, string> = {};
  if (credentials.customHeaders) {
    try {
      headers = JSON.parse(credentials.customHeaders as string);
    } catch (error) {
      throw new Error("Invalid custom headers JSON");
    }
  }

  let chain;
  if (chainKey && chainKey !== "custom") {
    chain = getChain(chainKey);
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
    chain,
    transport,
  });
}

export class EthereumTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Ethereum Trigger",
    name: "ethereumTrigger",
    icon: "file:ethereum.svg",
    group: ["trigger"],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: "Listen to Ethereum blockchain events",
    defaults: {
      name: "Ethereum Trigger",
    },
    inputs: [],
    outputs: ["main"],
    credentials: [
      {
        name: "ethereumRpc",
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: "Event",
        name: "event",
        type: "options",
        options: [
          {
            name: "New Block",
            value: "newBlock",
            description: "Trigger on new blocks",
          },
          {
            name: "Contract Event",
            value: "contractEvent",
            description: "Trigger on contract events",
          },
          {
            name: "Transaction",
            value: "transaction",
            description: "Trigger on transactions",
          },
        ],
        default: "newBlock",
        description: "The type of event to listen for",
      },

      // ===========================================
      //          New Block Event
      // ===========================================
      {
        displayName: "Polling Interval (ms)",
        name: "pollingInterval",
        type: "number",
        displayOptions: {
          show: {
            event: ["newBlock"],
          },
        },
        default: 12000,
        description: "How often to check for new blocks (in milliseconds)",
      },

      // ===========================================
      //          Contract Event
      // ===========================================
      {
        displayName: "Contract Addresses",
        name: "addresses",
        type: "string",
        displayOptions: {
          show: {
            event: ["contractEvent"],
          },
        },
        default: "",
        placeholder: "0x..., 0x...",
        description:
          "Contract addresses to monitor (comma-separated). Leave empty for all addresses.",
      },
      {
        displayName: "ABI Input Method",
        name: "abiInput",
        type: "options",
        displayOptions: {
          show: {
            event: ["contractEvent"],
          },
        },
        options: [
          {
            name: "ABI + Event Name",
            value: "abiEvent",
          },
          {
            name: "Topics (Advanced)",
            value: "topics",
          },
        ],
        default: "abiEvent",
        description: "How to specify the event to monitor",
      },
      {
        displayName: "ABI",
        name: "abi",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            event: ["contractEvent"],
            abiInput: ["abiEvent"],
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
            event: ["contractEvent"],
            abiInput: ["abiEvent"],
          },
        },
        default: "",
        placeholder: "Transfer",
        description: "Name of the event to monitor",
      },
      {
        displayName: "Topics",
        name: "topics",
        type: "json",
        required: true,
        displayOptions: {
          show: {
            event: ["contractEvent"],
            abiInput: ["topics"],
          },
        },
        default: "[]",
        placeholder: '["0x...", null, "0x..."]',
        description: "Event topics array (use null for wildcards)",
      },
      {
        displayName: "From Block",
        name: "fromBlock",
        type: "options",
        displayOptions: {
          show: {
            event: ["contractEvent"],
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
            name: "Custom Block Number",
            value: "custom",
          },
        ],
        default: "latest",
        description: "Starting block for event monitoring",
      },
      {
        displayName: "Block Number",
        name: "fromBlockNumber",
        type: "number",
        displayOptions: {
          show: {
            event: ["contractEvent"],
            fromBlock: ["custom"],
          },
        },
        default: 0,
        description: "Custom starting block number",
      },
      {
        displayName: "Polling Interval (ms)",
        name: "pollingInterval",
        type: "number",
        displayOptions: {
          show: {
            event: ["contractEvent"],
          },
        },
        default: 12000,
        description: "How often to check for new events (in milliseconds)",
      },

      // ===========================================
      //          Transaction Event
      // ===========================================
      {
        displayName: "Addresses",
        name: "addresses",
        type: "string",
        required: true,
        displayOptions: {
          show: {
            event: ["transaction"],
          },
        },
        default: "",
        placeholder: "0x..., 0x...",
        description: "Addresses to monitor (comma-separated)",
      },
      {
        displayName: "Direction",
        name: "direction",
        type: "options",
        displayOptions: {
          show: {
            event: ["transaction"],
          },
        },
        options: [
          {
            name: "All",
            value: "all",
            description: "Any transaction involving the address",
          },
          {
            name: "From",
            value: "from",
            description: "Transactions sent from the address",
          },
          {
            name: "To",
            value: "to",
            description: "Transactions sent to the address",
          },
          {
            name: "Value Transfer",
            value: "value",
            description: "Only ETH transfers (value > 0)",
          },
        ],
        default: "all",
      },
      {
        displayName: "From Block",
        name: "fromBlock",
        type: "options",
        displayOptions: {
          show: {
            event: ["transaction"],
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
            name: "Custom Block Number",
            value: "custom",
          },
        ],
        default: "latest",
      },
      {
        displayName: "Block Number",
        name: "fromBlockNumber",
        type: "number",
        displayOptions: {
          show: {
            event: ["transaction"],
            fromBlock: ["custom"],
          },
        },
        default: 0,
      },
      {
        displayName: "Polling Interval (ms)",
        name: "pollingInterval",
        type: "number",
        displayOptions: {
          show: {
            event: ["transaction"],
          },
        },
        default: 12000,
        description:
          "How often to check for new transactions (in milliseconds)",
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const event = this.getNodeParameter("event") as string;
    const credentials = await this.getCredentials("ethereumRpc");

    // Create public client
    const publicClient = createPublicClient(credentials);

    // State management using closures
    let lastBlockNumber: bigint = 0n;
    let lastEventBlock: bigint = 0n;
    let lastTxBlock: bigint = 0n;
    let processedTxHashes = new Set<string>();

    const emit = (data: IDataObject[]) => {
      data.forEach((item) => {
        this.emit([this.helpers.returnJsonArray([item])]);
      });
    };

    // Polling logic
    const poll = async () => {
      try {
        if (event === "newBlock") {
          const currentBlock = await publicClient.getBlockNumber();
          if (lastBlockNumber === 0n) {
            lastBlockNumber = currentBlock;
            return;
          }
          if (currentBlock > lastBlockNumber) {
            for (
              let blockNum = lastBlockNumber + 1n;
              blockNum <= currentBlock;
              blockNum++
            ) {
              const block = await publicClient.getBlock({
                blockNumber: blockNum,
                includeTransactions: false,
              });
              emit([
                {
                  number: block.number.toString(),
                  hash: block.hash,
                  parentHash: block.parentHash,
                  timestamp: block.timestamp.toString(),
                  timestampDate: new Date(
                    Number(block.timestamp) * 1000
                  ).toISOString(),
                  transactionsCount: block.transactions.length,
                  miner: block.miner,
                  gasLimit: block.gasLimit.toString(),
                  gasUsed: block.gasUsed.toString(),
                  baseFeePerGas: block.baseFeePerGas?.toString(),
                  difficulty: block.difficulty?.toString(),
                  extraData: block.extraData,
                },
              ]);
            }
            lastBlockNumber = currentBlock;
          }
        } else if (event === "contractEvent") {
          const addressesStr = this.getNodeParameter("addresses", "") as string;
          const abiInput = this.getNodeParameter("abiInput") as string;
          const fromBlock = this.getNodeParameter("fromBlock") as string;

          let addresses: `0x${string}`[] | undefined;
          if (addressesStr.trim()) {
            addresses = addressesStr
              .split(",")
              .map((addr) => addr.trim() as `0x${string}`)
              .filter((addr) => addr);
          }

          let startBlock: bigint;
          if (lastEventBlock === 0n) {
            if (fromBlock === "custom") {
              startBlock = BigInt(
                this.getNodeParameter("fromBlockNumber") as number
              );
            } else {
              const currentBlock = await publicClient.getBlockNumber();
              startBlock = fromBlock === "earliest" ? 0n : currentBlock;
            }
            lastEventBlock = startBlock;
            return;
          } else {
            startBlock = lastEventBlock + 1n;
          }

          const currentBlock = await publicClient.getBlockNumber();
          if (currentBlock < startBlock) return;

          let logs;
          if (abiInput === "abiEvent") {
            const abiStr = this.getNodeParameter("abi") as string;
            const abi = JSON.parse(abiStr);
            const eventName = this.getNodeParameter("eventName") as string;

            logs = await publicClient.getLogs({
              address: addresses,
              event: abi.find(
                (item: any) => item.type === "event" && item.name === eventName
              ),
              fromBlock: startBlock,
              toBlock: currentBlock,
            });

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
            emit(decodedLogs);
          } else {
            const topicsStr = this.getNodeParameter("topics") as string;
            const topics = JSON.parse(topicsStr);
            logs = await publicClient.getLogs({
              address: addresses,
              fromBlock: startBlock,
              toBlock: currentBlock,
            } as any);
            emit(
              logs.map((log: any) => ({
                address: log.address,
                blockNumber: log.blockNumber.toString(),
                blockHash: log.blockHash,
                transactionHash: log.transactionHash,
                transactionIndex: log.transactionIndex,
                logIndex: log.logIndex,
                removed: log.removed,
                data: log.data,
                topics: log.topics,
              }))
            );
          }
          lastEventBlock = currentBlock;
        } else if (event === "transaction") {
          const addressesStr = this.getNodeParameter("addresses") as string;
          const direction = this.getNodeParameter("direction") as string;
          const fromBlock = this.getNodeParameter("fromBlock") as string;

          const addresses = addressesStr
            .split(",")
            .map((addr) => addr.trim().toLowerCase())
            .filter((addr) => addr);
          if (addresses.length === 0) {
            throw new NodeOperationError(
              this.getNode(),
              "At least one address is required"
            );
          }

          let startBlock: bigint;
          if (lastTxBlock === 0n) {
            if (fromBlock === "custom") {
              startBlock = BigInt(
                this.getNodeParameter("fromBlockNumber") as number
              );
            } else {
              const currentBlock = await publicClient.getBlockNumber();
              startBlock = fromBlock === "earliest" ? 0n : currentBlock;
            }
            lastTxBlock = startBlock;
            return;
          } else {
            startBlock = lastTxBlock + 1n;
          }

          const currentBlock = await publicClient.getBlockNumber();
          if (currentBlock < startBlock) return;

          const matchingTransactions: IDataObject[] = [];
          for (
            let blockNum = startBlock;
            blockNum <= currentBlock;
            blockNum++
          ) {
            const block = await publicClient.getBlock({
              blockNumber: blockNum,
              includeTransactions: true,
            });

            for (const tx of block.transactions) {
              if (processedTxHashes.has(tx.hash)) continue;

              const fromMatch = addresses.includes(tx.from.toLowerCase());
              const toMatch = tx.to && addresses.includes(tx.to.toLowerCase());

              let shouldEmit = false;
              if (direction === "all") shouldEmit = fromMatch || !!toMatch;
              else if (direction === "from") shouldEmit = fromMatch;
              else if (direction === "to") shouldEmit = !!toMatch;
              else if (direction === "value")
                shouldEmit = (fromMatch || !!toMatch) && tx.value > 0n;

              if (shouldEmit) {
                processedTxHashes.add(tx.hash);
                matchingTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value.toString(),
                  valueEth: (Number(tx.value) / 1e18).toString(),
                  blockNumber: tx.blockNumber?.toString(),
                  blockHash: tx.blockHash,
                  gas: tx.gas.toString(),
                  gasPrice: tx.gasPrice?.toString(),
                  maxFeePerGas: tx.maxFeePerGas?.toString(),
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
                  input: tx.input,
                  nonce: tx.nonce,
                  transactionIndex: tx.transactionIndex,
                  type: tx.type,
                });
              }
            }
          }

          if (matchingTransactions.length > 0) {
            emit(matchingTransactions);
          }

          lastTxBlock = currentBlock;
          if (processedTxHashes.size > 10000) {
            const hashesArray = Array.from(processedTxHashes);
            processedTxHashes = new Set(hashesArray.slice(-5000));
          }
        }
      } catch (error) {
        const errorMessage = parseViemError(error);
        throw new NodeOperationError(
          this.getNode(),
          `Polling error: ${errorMessage}`
        );
      }
    };

    // Manual trigger mode
    const manualTriggerFunction = async () => {
      await poll();
    };

    if (this.getMode() === "manual") {
      await manualTriggerFunction();
    }

    const pollingInterval = this.getNodeParameter(
      "pollingInterval",
      12000
    ) as number;
    const interval = setInterval(poll, pollingInterval);

    const closeFunction = async () => {
      clearInterval(interval);
    };

    return {
      closeFunction,
      manualTriggerFunction,
    };
  }
}
