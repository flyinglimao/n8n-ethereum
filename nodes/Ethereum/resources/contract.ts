import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
} from "n8n-workflow";
import {
    PublicClient,
    WalletClient,
    decodeEventLog,
} from "viem";

export const contractProperties: INodeProperties[] = [
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
    context: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: WalletClient | null,
    operation: string,
    i: number
): Promise<any> {
    let responseData: any = {};

    if (operation === "read") {
        const contractAddress = context.getNodeParameter("contractAddress", i) as string;
        const abiStr = context.getNodeParameter("abi", i) as string;
        const abi = JSON.parse(abiStr);
        const useRawCalldata = context.getNodeParameter("useRawCalldata", i) as boolean;

        if (useRawCalldata) {
            const calldata = context.getNodeParameter("calldata", i) as string;
            const result = await publicClient.call({
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
            });
            responseData = {
                data: result.data,
            };
        } else {
            const functionName = context.getNodeParameter("functionName", i) as string;
            const parametersStr = context.getNodeParameter("parameters", i, "[]") as string;
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
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required for write operations"
            );
        }

        const contractAddress = context.getNodeParameter("contractAddress", i) as string;
        const abiStr = context.getNodeParameter("abi", i) as string;
        const abi = JSON.parse(abiStr);
        const useRawCalldata = context.getNodeParameter("useRawCalldata", i) as boolean;

        if (useRawCalldata) {
            const calldata = context.getNodeParameter("calldata", i) as string;
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
            const functionName = context.getNodeParameter("functionName", i) as string;
            const parametersStr = context.getNodeParameter("parameters", i, "[]") as string;
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
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required for deployment"
            );
        }

        const abiStr = context.getNodeParameter("abi", i) as string;
        const abi = JSON.parse(abiStr);
        const bytecode = context.getNodeParameter("bytecode", i) as string;
        const constructorArgsStr = context.getNodeParameter("constructorArgs", i, "[]") as string;
        const constructorArgs = JSON.parse(constructorArgsStr);

        const hash = await walletClient.deployContract({
            abi,
            bytecode: bytecode as `0x${string}`,
            args: constructorArgs,
            account: walletClient.account!,
            chain: undefined,
        });

        // Wait for transaction receipt to get contract address
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        responseData = {
            transactionHash: hash,
            contractAddress: receipt.contractAddress,
        };
    } else if (operation === "getLogs") {
        const contractAddress = context.getNodeParameter("contractAddress", i) as string;
        const abiStr = context.getNodeParameter("logsAbi", i) as string;
        const abi = JSON.parse(abiStr);
        const eventName = context.getNodeParameter("eventName", i) as string;
        const eventArgsStr = context.getNodeParameter("eventArgs", i, "{}") as string;
        const eventArgs = JSON.parse(eventArgsStr);
        const fromBlockStr = context.getNodeParameter("fromBlock", i) as string;
        const toBlockStr = context.getNodeParameter("toBlock", i) as string;

        const fromBlock = parseBlockIdentifier(fromBlockStr);
        const toBlock = parseBlockIdentifier(toBlockStr);

        // Find event in ABI
        const eventAbi = abi.find(
            (item: any) => item.type === "event" && item.name === eventName
        );

        if (!eventAbi) {
            throw new NodeOperationError(
                context.getNode(),
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

    return responseData;
}
