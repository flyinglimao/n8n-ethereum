import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
    IDataObject,
} from "n8n-workflow";
import { formatUnits, PublicClient, WalletClient } from "viem";

export const accountOperations: INodeProperties = {
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
};

export const accountProperties: INodeProperties[] = [
    // Account: Get Balance / Get Transaction Count / Get Code
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
];

export async function executeAccount(
    context: IExecuteFunctions,
    itemIndex: number,
    publicClient: PublicClient,
    walletClient?: WalletClient
): Promise<IDataObject> {
    const operation = context.getNodeParameter("operation", itemIndex) as string;

    if (operation === "getCurrentAddress") {
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required to get current address"
            );
        }
        return {
            address: walletClient.account!.address,
        };
    }

    // Get address from parameter or credential
    let address = context.getNodeParameter("address", itemIndex, "") as string;
    if (!address || address.trim() === "") {
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Either provide an address or configure Ethereum Account credential"
            );
        }
        address = walletClient.account!.address;
    }

    const blockTag = context.getNodeParameter("blockTag", itemIndex) as string;
    let blockNumber: bigint | undefined;
    if (blockTag === "custom") {
        blockNumber = BigInt(
            context.getNodeParameter("blockNumber", itemIndex) as number
        );
    }

    if (operation === "getBalance") {
        const balance = await publicClient.getBalance({
            address: address as `0x${string}`,
            blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
            blockNumber: blockNumber,
        });
        return {
            address,
            balance: balance.toString(),
            balanceInEth: formatUnits(balance, 18),
        };
    } else if (operation === "getTransactionCount") {
        const count = await publicClient.getTransactionCount({
            address: address as `0x${string}`,
            blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
            blockNumber: blockNumber,
        });
        return {
            address,
            transactionCount: count.toString(), // Fixed: return as string
        };
    } else if (operation === "getCode") {
        const code = await publicClient.getCode({
            address: address as `0x${string}`,
            blockTag: blockTag !== "custom" ? (blockTag as any) : undefined,
            blockNumber: blockNumber,
        });
        return {
            address,
            code: code || "0x",
            isContract: code !== undefined && code !== "0x",
        };
    }

    return {};
}
