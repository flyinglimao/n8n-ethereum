import {
  INodeType,
  INodeTypeDescription,
  IPollFunctions,
  INodeExecutionData,
  IDataObject,
  NodeOperationError,
} from "n8n-workflow";
import {
  createPublicClient as viemCreatePublicClient,
  http,
  webSocket,
  decodeEventLog,
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
        description: "Contract addresses to monitor (comma-separated, leave empty for all)",
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
            description: "Provide full ABI and event name",
          },
          {
            name: "Topics",
            value: "topics",
            description: "Provide raw topics array",
          },
        ],
        default: "abiEvent",
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
        description: "The contract ABI as JSON array",
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
        description: "Name of the event to listen for",
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
        placeholder: '["0x..."]',
        description: "Event topics as JSON array",
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
      },

      // ===========================================
      //          Transaction Event
      // ===========================================
      {
        displayName: "Addresses",
        name: "txAddresses",
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
        name: "txFromBlock",
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
        name: "txFromBlockNumber",
        type: "number",
        displayOptions: {
          show: {
            event: ["transaction"],
            txFromBlock: ["custom"],
          },
        },
        default: 0,
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    try {
      const event = this.getNodeParameter("event") as string;
      const credentials = await this.getCredentials("ethereumRpc");

      // Get workflow static data for state persistence
      const workflowStaticData = this.getWorkflowStaticData("node");

      // Create public client
      const publicClient = createPublicClient(credentials);

      const items: INodeExecutionData[] = [];

      // ===========================================
      //          New Block Event
      // ===========================================
      if (event === "newBlock") {
        const currentBlock = await publicClient.getBlockNumber();

        // Initialize lastBlock on first run - fetch current block
        if (!workflowStaticData.lastBlock) {
          const block = await publicClient.getBlock({
            blockNumber: currentBlock,
            includeTransactions: false,
          });

          items.push({
            json: {
              number: block.number.toString(),
              hash: block.hash,
              parentHash: block.parentHash,
              timestamp: block.timestamp.toString(),
              timestampDate: new Date(Number(block.timestamp) * 1000).toISOString(),
              transactionsCount: block.transactions.length,
              miner: block.miner,
              gasLimit: block.gasLimit.toString(),
              gasUsed: block.gasUsed.toString(),
              baseFeePerGas: block.baseFeePerGas?.toString(),
              difficulty: block.difficulty?.toString(),
              extraData: block.extraData,
            } as IDataObject,
          });

          workflowStaticData.lastBlock = currentBlock.toString();
          return [items];
        }

        const lastBlock = BigInt(workflowStaticData.lastBlock as string);

        // No new blocks
        if (currentBlock <= lastBlock) {
          return null;
        }

        // Fetch all blocks from lastBlock+1 to currentBlock
        for (let blockNum = lastBlock + 1n; blockNum <= currentBlock; blockNum++) {
          const block = await publicClient.getBlock({
            blockNumber: blockNum,
            includeTransactions: false,
          });

          items.push({
            json: {
              number: block.number.toString(),
              hash: block.hash,
              parentHash: block.parentHash,
              timestamp: block.timestamp.toString(),
              timestampDate: new Date(Number(block.timestamp) * 1000).toISOString(),
              transactionsCount: block.transactions.length,
              miner: block.miner,
              gasLimit: block.gasLimit.toString(),
              gasUsed: block.gasUsed.toString(),
              baseFeePerGas: block.baseFeePerGas?.toString(),
              difficulty: block.difficulty?.toString(),
              extraData: block.extraData,
            } as IDataObject,
          });
        }

        // Update last processed block
        workflowStaticData.lastBlock = currentBlock.toString();
      }

      // ===========================================
      //          Contract Event
      // ===========================================
      else if (event === "contractEvent") {
        const addressesStr = this.getNodeParameter("addresses", "") as string;
        const abiInput = this.getNodeParameter("abiInput") as string;

        let addresses: `0x${string}`[] | undefined;
        if (addressesStr.trim()) {
          addresses = addressesStr
            .split(",")
            .map((addr) => addr.trim() as `0x${string}`)
            .filter((addr) => addr);
        }

        const currentBlock = await publicClient.getBlockNumber();

        // Initialize on first run - fetch events without fromBlock (RPC will return recent events)
        if (!workflowStaticData.lastEventBlock) {
          let logs;
          if (abiInput === "abiEvent") {
            const abiStr = this.getNodeParameter("abi") as string;
            const abi = JSON.parse(abiStr);
            const eventName = this.getNodeParameter("eventName") as string;

            const eventAbi = abi.find(
              (item: any) => item.type === "event" && item.name === eventName
            );

            if (!eventAbi) {
              throw new NodeOperationError(
                this.getNode(),
                `Event "${eventName}" not found in ABI`
              );
            }

            // First run: no fromBlock, only toBlock (RPC will use its default range)
            logs = await publicClient.getLogs({
              address: addresses,
              event: eventAbi,
              toBlock: currentBlock,
            });

            for (const log of logs) {
              try {
                const decoded: any = decodeEventLog({
                  abi,
                  data: log.data,
                  topics: log.topics,
                });

                items.push({
                  json: {
                    address: log.address,
                    blockNumber: log.blockNumber.toString(),
                    blockHash: log.blockHash,
                    transactionHash: log.transactionHash,
                    transactionIndex: log.transactionIndex,
                    logIndex: log.logIndex,
                    removed: log.removed,
                    eventName: decoded.eventName,
                    args: decoded.args,
                  } as IDataObject,
                });
              } catch (error) {
                items.push({
                  json: {
                    address: log.address,
                    blockNumber: log.blockNumber.toString(),
                    blockHash: log.blockHash,
                    transactionHash: log.transactionHash,
                    data: log.data,
                    topics: log.topics,
                    error: "Failed to decode event",
                  } as IDataObject,
                });
              }
            }
          } else {
            // Topics-based filtering - first run
            logs = await publicClient.getLogs({
              address: addresses,
              toBlock: currentBlock,
            } as any);

            for (const log of logs) {
              items.push({
                json: {
                  address: log.address,
                  blockNumber: log.blockNumber.toString(),
                  blockHash: log.blockHash,
                  transactionHash: log.transactionHash,
                  transactionIndex: log.transactionIndex,
                  logIndex: log.logIndex,
                  removed: log.removed,
                  data: log.data,
                  topics: log.topics,
                } as IDataObject,
              });
            }
          }

          workflowStaticData.lastEventBlock = currentBlock.toString();
          return items.length > 0 ? [items] : null;
        }

        const lastEventBlock = BigInt(workflowStaticData.lastEventBlock as string);
        const startBlock = lastEventBlock + 1n;

        // No new blocks
        if (currentBlock < startBlock) {
          return null;
        }

        let logs;
        if (abiInput === "abiEvent") {
          const abiStr = this.getNodeParameter("abi") as string;
          const abi = JSON.parse(abiStr);
          const eventName = this.getNodeParameter("eventName") as string;

          const eventAbi = abi.find(
            (item: any) => item.type === "event" && item.name === eventName
          );

          if (!eventAbi) {
            throw new NodeOperationError(
              this.getNode(),
              `Event "${eventName}" not found in ABI`
            );
          }

          logs = await publicClient.getLogs({
            address: addresses,
            event: eventAbi,
            fromBlock: startBlock,
            toBlock: currentBlock,
          });

          for (const log of logs) {
            try {
              const decoded: any = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics,
              });

              items.push({
                json: {
                  address: log.address,
                  blockNumber: log.blockNumber.toString(),
                  blockHash: log.blockHash,
                  transactionHash: log.transactionHash,
                  transactionIndex: log.transactionIndex,
                  logIndex: log.logIndex,
                  removed: log.removed,
                  eventName: decoded.eventName,
                  args: decoded.args,
                } as IDataObject,
              });
            } catch (error) {
              items.push({
                json: {
                  address: log.address,
                  blockNumber: log.blockNumber.toString(),
                  blockHash: log.blockHash,
                  transactionHash: log.transactionHash,
                  data: log.data,
                  topics: log.topics,
                  error: "Failed to decode event",
                } as IDataObject,
              });
            }
          }
        } else {
          // Topics-based filtering
          logs = await publicClient.getLogs({
            address: addresses,
            fromBlock: startBlock,
            toBlock: currentBlock,
          } as any);

          for (const log of logs) {
            items.push({
              json: {
                address: log.address,
                blockNumber: log.blockNumber.toString(),
                blockHash: log.blockHash,
                transactionHash: log.transactionHash,
                transactionIndex: log.transactionIndex,
                logIndex: log.logIndex,
                removed: log.removed,
                data: log.data,
                topics: log.topics,
              } as IDataObject,
            });
          }
        }

        // Update last processed block
        workflowStaticData.lastEventBlock = currentBlock.toString();
      }

      // ===========================================
      //          Transaction Event
      // ===========================================
      else if (event === "transaction") {
        const addressesStr = this.getNodeParameter("txAddresses") as string;
        const direction = this.getNodeParameter("direction") as string;

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

        const currentBlock = await publicClient.getBlockNumber();

        // Initialize on first run - scan only current block
        if (!workflowStaticData.lastTxBlock) {
          const processedTxHashes = new Set<string>();

          const block = await publicClient.getBlock({
            blockNumber: currentBlock,
            includeTransactions: true,
          });

          for (const tx of block.transactions as any[]) {
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

              items.push({
                json: {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value.toString(),
                  valueEth: (Number(tx.value) / 1e18).toString(),
                  blockNumber: tx.blockNumber.toString(),
                  blockHash: tx.blockHash,
                  transactionIndex: tx.transactionIndex,
                  nonce: tx.nonce,
                  gas: tx.gas.toString(),
                  gasPrice: tx.gasPrice?.toString(),
                  maxFeePerGas: tx.maxFeePerGas?.toString(),
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
                  input: tx.input,
                  type: tx.type,
                  chainId: tx.chainId,
                } as IDataObject,
              });
            }
          }

          workflowStaticData.lastTxBlock = currentBlock.toString();
          workflowStaticData.processedTxHashes = Array.from(processedTxHashes);
          return items.length > 0 ? [items] : null;
        }

        const lastTxBlock = BigInt(workflowStaticData.lastTxBlock as string);
        const startBlock = lastTxBlock + 1n;

        // No new blocks
        if (currentBlock < startBlock) {
          return null;
        }

        const processedTxHashes = new Set<string>(
          (workflowStaticData.processedTxHashes as string[]) || []
        );

        // Fetch transactions from all new blocks
        for (let blockNum = startBlock; blockNum <= currentBlock; blockNum++) {
          const block = await publicClient.getBlock({
            blockNumber: blockNum,
            includeTransactions: true,
          });

          for (const tx of block.transactions as any[]) {
            // Skip if already processed
            if (processedTxHashes.has(tx.hash)) {
              continue;
            }

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

              items.push({
                json: {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value.toString(),
                  valueEth: (Number(tx.value) / 1e18).toString(),
                  blockNumber: tx.blockNumber.toString(),
                  blockHash: tx.blockHash,
                  transactionIndex: tx.transactionIndex,
                  nonce: tx.nonce,
                  gas: tx.gas.toString(),
                  gasPrice: tx.gasPrice?.toString(),
                  maxFeePerGas: tx.maxFeePerGas?.toString(),
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
                  input: tx.input,
                  type: tx.type,
                  chainId: tx.chainId,
                } as IDataObject,
              });
            }
          }
        }

        // Update state - keep only recent hashes (last 10000)
        const recentHashes = Array.from(processedTxHashes).slice(-10000);
        workflowStaticData.processedTxHashes = recentHashes;
        workflowStaticData.lastTxBlock = currentBlock.toString();
      }

      // Return items or null if no new data
      return items.length > 0 ? [items] : null;
    } catch (error) {
      const errorMessage = parseViemError(error);
      throw new NodeOperationError(this.getNode(), errorMessage);
    }
  }
}
