import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
} from "n8n-workflow";
import { PublicClient, WalletClient, decodeEventLog } from "viem";
import {
    safeJsonParse,
    validateAddress,
    parseAndValidateAbi,
    validateNameInAbi,
} from "../../../utils/inputValidation";

export const contractProperties: INodeProperties[] = [
    // Contract: Read / Write
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
        description: "Whether to use raw hex data instead of function name and arguments",
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
        description: "Arguments for the function call",
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
    },

    // Contract: Get Logs
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
    },
    {
        displayName: "Logs ABI",
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
        description: "ABI containing the event definition",
    },
    {
        displayName: "Event Arguments",
        name: "eventArgs",
        type: "json",
        displayOptions: {
            show: {
                resource: ["contract"],
                operation: ["getLogs"],
            },
        },
        default: "{}",
        description: "Indexed arguments to filter by",
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
    const returnData: Record<string, unknown> = {};

    if (operation === "read") {
        const contractAddress = this.getNodeParameter("contractAddress", i) as string;

        // Validate contract address
        validateAddress(contractAddress, "Contract Address");

        const abiStr = this.getNodeParameter("abi", i) as string;
        const abi = parseAndValidateAbi(abiStr, "ABI");
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
        } else {
            const functionName = this.getNodeParameter("functionName", i) as string;

            // Validate function exists in ABI
            validateNameInAbi(abi, functionName, "function", "Function Name");

            const parametersStr = this.getNodeParameter("parameters", i, "[]") as string;
            const parameters = safeJsonParse(parametersStr, "Parameters", "array");

            const result = await publicClient.readContract({
                address: contractAddress as `0x${string}`,
                abi,
                functionName,
                args: parameters,
            });

            return {
                result,
            };
        }
    } else if (operation === "write") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for write operations"
            );
        }

        const contractAddress = this.getNodeParameter("contractAddress", i) as string;

        // Validate contract address
        validateAddress(contractAddress, "Contract Address");

        const abiStr = this.getNodeParameter("abi", i) as string;
        const abi = parseAndValidateAbi(abiStr, "ABI");
        const useRawCalldata = this.getNodeParameter("useRawCalldata", i) as boolean;

        if (useRawCalldata) {
            const calldata = this.getNodeParameter("calldata", i) as string;
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: contractAddress as `0x${string}`,
                data: calldata as `0x${string}`,
                chain: undefined,
            });
            return {
                transactionHash: hash,
            };
        } else {
            const functionName = this.getNodeParameter("functionName", i) as string;

            // Validate function exists in ABI
            validateNameInAbi(abi, functionName, "function", "Function Name");

            const parametersStr = this.getNodeParameter("parameters", i, "[]") as string;
            const parameters = safeJsonParse(parametersStr, "Parameters", "array");

            const hash = await walletClient.writeContract({
                address: contractAddress as `0x${string}`,
                abi,
                functionName,
                args: parameters,
                account: walletClient.account,
                chain: undefined,
            });

            return {
                transactionHash: hash,
            };
        }
    } else if (operation === "deploy") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for deployment"
            );
        }

        const abiStr = this.getNodeParameter("abi", i) as string;
        const abi = parseAndValidateAbi(abiStr, "ABI");
        const bytecode = this.getNodeParameter("bytecode", i) as string;
        const constructorArgsStr = this.getNodeParameter("constructorArgs", i, "[]") as string;
        const constructorArgs = safeJsonParse(constructorArgsStr, "Constructor Arguments", "array");

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

        // Validate contract address
        validateAddress(contractAddress, "Contract Address");

        const abiStr = this.getNodeParameter("logsAbi", i) as string;
        const abi = parseAndValidateAbi(abiStr, "Logs ABI");
        const eventName = this.getNodeParameter("eventName", i) as string;

        // Validate event exists in ABI
        validateNameInAbi(abi, eventName, "event", "Event Name");

        const eventArgsStr = this.getNodeParameter("eventArgs", i, "{}") as string;
        const eventArgs = safeJsonParse(eventArgsStr, "Event Arguments", "object");
        const fromBlockStr = this.getNodeParameter("fromBlock", i) as string;
        const toBlockStr = this.getNodeParameter("toBlock", i) as string;

        const fromBlock = parseBlockIdentifier(fromBlockStr);
        const toBlock = parseBlockIdentifier(toBlockStr);

        const eventAbi = abi.find(
            (item: any) => item.type === "event" && item.name === eventName
        ) as any;

        if (!eventAbi) {
            throw new NodeOperationError(
                this.getNode(),
                `Event "${eventName}" not found in ABI`
            );
        }

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
