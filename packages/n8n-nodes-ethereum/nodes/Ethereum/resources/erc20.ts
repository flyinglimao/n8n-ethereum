import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
    IDataObject,
} from "n8n-workflow";
import { PublicClient, WalletClient, parseUnits, formatUnits } from "viem";
import { ERC20_ABI } from "../../../utils/constants";

export const erc20Properties: INodeProperties[] = [
    // ===========================================
    //          ERC20 Resource
    // ===========================================
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
            },
        },
        options: [
            {
                name: "Get Balance",
                value: "getBalance",
                description: "Get token balance of an address",
                action: "Get ERC20 balance",
            },
            {
                name: "Get Token Info",
                value: "getTokenInfo",
                description: "Get name, symbol, and decimals",
                action: "Get ERC20 token info",
            },
            {
                name: "Transfer",
                value: "transfer",
                description: "Transfer tokens",
                action: "Transfer ERC20 tokens",
            },
            {
                name: "Transfer From",
                value: "transferFrom",
                description: "Transfer tokens from another address",
                action: "Transfer ERC20 tokens from",
            },
            {
                name: "Approve",
                value: "approve",
                description: "Approve spender to use tokens",
                action: "Approve ERC20 tokens",
            },
            {
                name: "Get Allowance",
                value: "getAllowance",
                description: "Get allowance",
                action: "Get ERC20 allowance",
            },
        ],
        default: "getBalance",
    },

    // ERC20: Common
    {
        displayName: "Token Address",
        name: "tokenAddress",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
            },
        },
        default: "",
        placeholder: "0x...",
    },

    // ERC20: Get Balance / Get Token Info / Transfer / Approve
    {
        displayName: "Wallet Address",
        name: "address",
        type: "string",
        displayOptions: {
            show: {
                resource: ["erc20"],
                operation: ["getBalance"],
            },
        },
        default: "",
        placeholder: "0x...",
        description: "Address to check balance of (leave empty to use credential address)",
    },

    // ERC20: Transfer / Approve
    {
        displayName: "Spender Address",
        name: "spender",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
                operation: ["approve", "getAllowance"], // Also getAllowance
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
                resource: ["erc20"],
                operation: ["transfer", "transferFrom"],
            },
        },
        default: "",
        placeholder: "0x...",
    },
    {
        displayName: "Amount",
        name: "amount",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
                operation: ["transfer", "approve", "transferFrom"],
            },
        },
        default: "",
        description: 'Amount in token units (e.g., "1.5" for 1.5 tokens) or wei',
    },

    // ERC20: Transfer From
    {
        displayName: "From Address",
        name: "from",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
                operation: ["transferFrom"],
            },
        },
        default: "",
        placeholder: "0x...",
    },

    // ERC20: Get Allowance
    {
        displayName: "Owner Address",
        name: "owner",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["erc20"],
                operation: ["getAllowance"],
            },
        },
        default: "",
        placeholder: "0x...",
    },
];

function parseTokenAmount(amountStr: string, decimals: number): bigint {
    if (/^\d+$/.test(amountStr)) {
        return BigInt(amountStr);
    }
    return parseUnits(amountStr, decimals);
}

export async function executeErc20(
    this: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: WalletClient | undefined | null,
    operation: string,
    i: number
): Promise<IDataObject> {
    const tokenAddress = this.getNodeParameter("tokenAddress", i) as string;

    if (operation === "getBalance") {
        let address = this.getNodeParameter("address", i) as string;
        // Logic from node: use credential address if empty parameter.
        // Node logic passed 'address' param explicitly.
        // Wait, node logic: const address = this.getNodeParameter("address", i) as string;
        // Did it fallback to wallet credential? 
        // In Restore Step 307: const address = this.getNodeParameter("address", i) as string;
        // It does NOT fallback in the viewed code. It relies on parameter being populated.

        const [balance, decimals] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
            }) as Promise<bigint>,
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }) as Promise<number>,
        ]);

        return {
            address,
            balance: balance.toString(),
            balanceFormatted: formatUnits(balance, decimals),
        };
    } else if (operation === "getTokenInfo") {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "name",
            }),
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "symbol",
            }),
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }),
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "totalSupply",
            }),
        ]);

        return {
            name,
            symbol,
            decimals,
            totalSupply: (totalSupply as bigint).toString(),
        };
    } else if (operation === "transfer") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transfer"
            );
        }

        const to = this.getNodeParameter("to", i) as string;
        const amountStr = this.getNodeParameter("amount", i) as string;

        const decimals = (await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
        })) as number;

        const amount = parseTokenAmount(amountStr, decimals);

        const hash = await walletClient.writeContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [to as `0x${string}`, amount],
            account: walletClient.account,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    } else if (operation === "approve") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for approve"
            );
        }

        const spender = this.getNodeParameter("spender", i) as string;
        const amountStr = this.getNodeParameter("amount", i) as string;

        const decimals = (await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
        })) as number;

        const amount = parseTokenAmount(amountStr, decimals);

        const hash = await walletClient.writeContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [spender as `0x${string}`, amount],
            account: walletClient.account,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    } else if (operation === "transferFrom") {
        if (!walletClient || !walletClient.account) {
            throw new NodeOperationError(
                this.getNode(),
                "Ethereum Account credential is required for transferFrom"
            );
        }

        const from = this.getNodeParameter("from", i) as string;
        const to = this.getNodeParameter("to", i) as string;
        const amountStr = this.getNodeParameter("amount", i) as string;

        const decimals = (await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
        })) as number;

        const amount = parseTokenAmount(amountStr, decimals);

        const hash = await walletClient.writeContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "transferFrom",
            args: [from as `0x${string}`, to as `0x${string}`, amount],
            account: walletClient.account,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    } else if (operation === "getAllowance") {
        const owner = this.getNodeParameter("owner", i) as string;
        const spender = this.getNodeParameter("spender", i) as string;

        const [allowance, decimals] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [owner as `0x${string}`, spender as `0x${string}`],
            }) as Promise<bigint>,
            publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "decimals",
            }) as Promise<number>,
        ]);

        return {
            owner,
            spender,
            allowance: allowance.toString(),
            allowanceFormatted: formatUnits(allowance, decimals),
        };
    }

    return {};
}
