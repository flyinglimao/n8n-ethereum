import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
} from "n8n-workflow";
import { PublicClient, WalletClient, decodeEventLog } from "viem";
import {
    parseAbiJson,
    findAbiFunction,
    findAbiEvent,
    abiWithSingleFunction,
} from "../../../utils/abiHelpers";

export const contractProperties: INodeProperties[] = [
    // Contract: Read / Write / Get Logs
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
        placeholder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
        description: "The address of the smart contract",
    },
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
                resource: ["contract"],
                operation: ["read", "write", "deploy"],
            },
        },
        default: "[]",
        description:
            "The contract ABI as a JSON array (e.g. copied from Etherscan or your compiler output). Once provided, functions can be picked from a dropdown.",
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
        description: "Whether to use raw hex calldata instead of picking a function and passing arguments",
    },

    // Function dropdowns (populated from the ABI)
    {
        displayName: "Function",
        name: "functionName",
        type: "options",
        required: true,
        typeOptions: {
            loadOptionsMethod: "getReadFunctions",
            loadOptionsDependsOn: ["abi"],
        },
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["read"],
                useRawCalldata: [false],
            },
        },
        default: "",
        description:
            'View/pure function to call, loaded from the ABI. Choose "Expression" to set it dynamically. Choose from the list, or specify a name or full signature using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    {
        displayName: "Function",
        name: "functionName",
        type: "options",
        required: true,
        typeOptions: {
            loadOptionsMethod: "getWriteFunctions",
            loadOptionsDependsOn: ["abi"],
        },
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["write"],
                useRawCalldata: [false],
            },
        },
        default: "",
        description:
            'State-changing function to execute, loaded from the ABI. Choose from the list, or specify a name or full signature using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    {
        displayName: "Arguments",
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
        placeholder: '["0x742d…", "1000000000000000000"]',
        description:
            "Function arguments as a JSON array, in the order shown in the function signature. Use strings for large numbers (uint256 etc.).",
    },
    {
        displayName: "Value (Wei)",
        name: "payableValue",
        type: "string",
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["write"],
            },
        },
        default: "",
        placeholder: "1000000000000000000",
        description:
            "Native token amount in wei to send along with the call (for payable functions). Leave empty to send none.",
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
        default: "0x",
        placeholder: "0xa9059cbb…",
        description: "Raw ABI-encoded calldata for the call",
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
        default: "0x",
        placeholder: "0x6080604052…",
        description: "The compiled contract bytecode",
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
        description: "Constructor arguments as a JSON array, in order",
    },

    // Contract: Get Logs
    {
        displayName: "ABI",
        name: "logsAbi",
        type: "json",
        required: true,
        typeOptions: {
            rows: 4,
        },
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["getLogs"],
            },
        },
        default: "[]",
        description:
            "The contract ABI as a JSON array. Once provided, the event can be picked from a dropdown.",
    },
    {
        displayName: "Event",
        name: "eventName",
        type: "options",
        required: true,
        typeOptions: {
            loadOptionsMethod: "getLogEvents",
            loadOptionsDependsOn: ["logsAbi"],
        },
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["getLogs"],
            },
        },
        default: "",
        description:
            'Event to query, loaded from the ABI. Choose from the list, or specify a name or full signature using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        placeholder: '{"from": "0x…", "to": "0x…"}',
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
        description: 'Starting block: a number, or "latest"/"earliest"',
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
        description: 'Ending block: a number, or "latest"/"earliest"',
    },
];

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

export async function executeContract(
    this: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: WalletClient | undefined | null,
    operation: string,
    i: number
): Promise<Record<string, unknown>> {
    if (operation === "read") {
        const contractAddress = this.getNodeParameter("contractAddress", i) as string;
        const abi = parseAbiJson(this.getNodeParameter("abi", i));
        const useRawCalldata = this.getNodeParameter("useRawCalldata", i) as boolean;

        if (useRawCalldata) {
            const calldata = this.getNodeParameter("calldata", i) as string;
            const result = await publicClient.call({
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
            });
            return {
                data: result.data,
            };
        }

        const functionSelector = this.getNodeParameter("functionName", i) as string;
        const parametersStr = this.getNodeParameter("parameters", i, "[]") as string;
        const parameters = JSON.parse(parametersStr);
        const fn = findAbiFunction(abi, functionSelector);

        const result = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: abiWithSingleFunction(abi, fn),
            functionName: fn.name,
            args: parameters,
        });

        return {
            result,
        };
    } else if (operation === "write") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for write operations"
            );
        }

        const contractAddress = this.getNodeParameter("contractAddress", i) as string;
        const abi = parseAbiJson(this.getNodeParameter("abi", i));
        const useRawCalldata = this.getNodeParameter("useRawCalldata", i) as boolean;
        const payableValueStr = this.getNodeParameter("payableValue", i, "") as string;
        const value = payableValueStr.trim() !== "" ? BigInt(payableValueStr) : undefined;

        if (useRawCalldata) {
            const calldata = this.getNodeParameter("calldata", i) as string;
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
                value,
                chain: undefined,
            });
            return {
                transactionHash: hash,
            };
        }

        const functionSelector = this.getNodeParameter("functionName", i) as string;
        const parametersStr = this.getNodeParameter("parameters", i, "[]") as string;
        const parameters = JSON.parse(parametersStr);
        const fn = findAbiFunction(abi, functionSelector);

        const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: abiWithSingleFunction(abi, fn),
            functionName: fn.name,
            args: parameters,
            value,
            account: walletClient.account,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    } else if (operation === "deploy") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for deployment"
            );
        }

        const abi = parseAbiJson(this.getNodeParameter("abi", i));
        const bytecode = this.getNodeParameter("bytecode", i) as string;
        const constructorArgsStr = this.getNodeParameter("constructorArgs", i, "[]") as string;
        const constructorArgs = JSON.parse(constructorArgsStr);

        const hash = await walletClient.deployContract({
            abi,
            bytecode: bytecode as `0x${string}`,
            args: constructorArgs,
            account: walletClient.account,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    } else if (operation === "getLogs") {
        const contractAddress = this.getNodeParameter("contractAddress", i) as string;
        const abi = parseAbiJson(this.getNodeParameter("logsAbi", i));
        const eventSelector = this.getNodeParameter("eventName", i) as string;
        const eventArgsStr = this.getNodeParameter("eventArgs", i, "{}") as string;
        const eventArgs = JSON.parse(eventArgsStr);
        const fromBlockStr = this.getNodeParameter("fromBlock", i) as string;
        const toBlockStr = this.getNodeParameter("toBlock", i) as string;

        const fromBlock = parseBlockIdentifier(fromBlockStr);
        const toBlock = parseBlockIdentifier(toBlockStr);

        const eventAbi = findAbiEvent(abi, eventSelector);

        const logs = await publicClient.getLogs({
            address: contractAddress as `0x${string}`,
            event: eventAbi,
            args: Object.keys(eventArgs).length > 0 ? eventArgs : undefined,
            fromBlock,
            toBlock,
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

        return {
            logs: decodedLogs,
        };
    }

    return {};
}
