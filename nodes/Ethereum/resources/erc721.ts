import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
    NodeOperationError,
    IDataObject,
} from "n8n-workflow";
import { PublicClient } from "viem";
import { ERC721_ABI } from "../../../utils/constants";

export const erc721Properties: INodeProperties[] = [
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
];

export async function executeErc721(
    this: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: any | undefined,
    operation: string,
    i: number
): Promise<INodeExecutionData> {
    const contractAddress = this.getNodeParameter("contractAddress", i) as string;
    let responseData: IDataObject;

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
            owner: owner as string,
        };
    } else if (operation === "transferFrom") {
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
            );
        }

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
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
            );
        }

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
        if (!walletClient) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approve"
            );
        }

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
            tokenURI: uri as string,
        };
    } else {
        throw new NodeOperationError(
            this.getNode(),
            `Unknown ERC721 operation: ${operation}`
        );
    }

    return {
        json: responseData,
        pairedItem: { item: i },
    };
}
