import { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { PublicClient } from "viem";

export const blockOperations: INodeProperties = {
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
};

export const blockProperties: INodeProperties[] = [
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
];

export async function executeBlock(
    context: IExecuteFunctions,
    itemIndex: number,
    publicClient: PublicClient
): Promise<Record<string, unknown>> {
    const operation = context.getNodeParameter("operation", itemIndex) as string;

    if (operation === "getBlock") {
        const identifierType = context.getNodeParameter(
            "blockIdentifierType",
            itemIndex
        ) as string;
        const includeTransactions = context.getNodeParameter(
            "includeTransactions",
            itemIndex
        ) as boolean;

        let block;
        if (identifierType === "number") {
            const blockNumber = BigInt(
                context.getNodeParameter("blockNumber", itemIndex) as number
            );
            block = await publicClient.getBlock({
                blockNumber,
                includeTransactions,
            } as any);
        } else if (identifierType === "hash") {
            const blockHash = context.getNodeParameter(
                "blockHash",
                itemIndex
            ) as string;
            block = await publicClient.getBlock({
                blockHash: blockHash as `0x${string}`,
                includeTransactions,
            } as any);
        } else {
            const blockTag = context.getNodeParameter("blockTag", itemIndex) as string;
            block = await publicClient.getBlock({
                blockTag: blockTag as any,
                includeTransactions,
            } as any);
        }

        return {
            ...block,
            number: block.number?.toString(),
            timestamp: block.timestamp.toString(),
            gasLimit: block.gasLimit.toString(),
            gasUsed: block.gasUsed.toString(),
            baseFeePerGas: block.baseFeePerGas?.toString(),
        };
    } else if (operation === "getBlockNumber") {
        const blockNumber = await publicClient.getBlockNumber();
        return {
            blockNumber: blockNumber.toString(),
        };
    }

    return {};
}
