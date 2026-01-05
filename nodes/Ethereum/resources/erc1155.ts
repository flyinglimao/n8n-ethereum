import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
    NodeOperationError,
    IDataObject,
} from "n8n-workflow";
import { PublicClient } from "viem";
import { ERC1155_ABI } from "../../../utils/constants";

export const erc1155Properties: INodeProperties[] = [
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
        description: "ERC1155 contract address",
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
];

export async function executeErc1155(
    this: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: any | undefined,
    operation: string,
    i: number
): Promise<INodeExecutionData> {
    const contractAddress = this.getNodeParameter("contractAddress", i) as string;
    let responseData: IDataObject;

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
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
            );
        }

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
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
            );
        }

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
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approval"
            );
        }

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
            uri: uri as string,
        };
    } else {
        throw new NodeOperationError(
            this.getNode(),
            `Unknown ERC1155 operation: ${operation}`
        );
    }

    return {
        json: responseData,
        pairedItem: { item: i },
    };
}
