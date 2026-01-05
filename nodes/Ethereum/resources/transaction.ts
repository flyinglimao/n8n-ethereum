/**
 * Transaction Resource Module
 *
 * Operations:
 * - sendTransaction: Send ETH with optional data
 * - getTransaction: Get transaction by hash
 * - getTransactionReceipt: Get transaction receipt
 * - waitForTransaction: Wait for transaction confirmation
 * - estimateGas: Estimate gas for a transaction
 */

import type { INodeProperties } from "n8n-workflow";
import type { PublicClient, WalletClient } from "viem";
import { parseUnits } from "viem";

/**
 * Transaction resource properties for n8n node description
 */
export const transactionProperties: INodeProperties[] = [
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ["transaction"],
            },
        },
        options: [
            {
                name: "Send Transaction",
                value: "sendTransaction",
                description: "Send ETH with optional data",
                action: "Send a transaction",
            },
            {
                name: "Get Transaction",
                value: "getTransaction",
                description: "Get transaction by hash",
                action: "Get a transaction",
            },
            {
                name: "Get Transaction Receipt",
                value: "getTransactionReceipt",
                description: "Get transaction receipt",
                action: "Get transaction receipt",
            },
            {
                name: "Wait For Transaction",
                value: "waitForTransaction",
                description: "Wait for transaction confirmation",
                action: "Wait for transaction",
            },
            {
                name: "Estimate Gas",
                value: "estimateGas",
                description: "Estimate gas for a transaction",
                action: "Estimate gas",
            },
        ],
        default: "sendTransaction",
    },

    // Transaction: Send Transaction / Estimate Gas
    {
        displayName: "To Address",
        name: "to",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["transaction"],
                operation: ["sendTransaction", "estimateGas"],
            },
        },
        default: "",
        placeholder: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    },
    {
        displayName: "Value (ETH)",
        name: "value",
        type: "string",
        displayOptions: {
            show: {
                resource: ["transaction"],
                operation: ["sendTransaction", "estimateGas"],
            },
        },
        default: "0",
        description: 'Amount of ETH to send (e.g., "0.1" for 0.1 ETH)',
    },
    {
        displayName: "Data",
        name: "data",
        type: "string",
        displayOptions: {
            show: {
                resource: ["transaction"],
                operation: ["sendTransaction", "estimateGas"],
            },
        },
        default: "",
        placeholder: "0x...",
        description: "Transaction data (optional)",
    },

    // Transaction: Get Transaction / Get Receipt / Wait
    {
        displayName: "Transaction Hash",
        name: "transactionHash",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["transaction"],
                operation: [
                    "getTransaction",
                    "getTransactionReceipt",
                    "waitForTransaction",
                ],
            },
        },
        default: "",
        placeholder: "0x...",
    },
    {
        displayName: "Confirmations",
        name: "confirmations",
        type: "number",
        displayOptions: {
            show: {
                resource: ["transaction"],
                operation: ["waitForTransaction"],
            },
        },
        default: 1,
        description: "Number of confirmations to wait for",
    },
];

/**
 * Execute parameters for transaction operations
 */
export interface TransactionExecuteParams {
    operation: string;
    to?: string;
    value?: string;
    data?: string;
    transactionHash?: string;
    confirmations?: number;
}

/**
 * Execute transaction resource operations
 */
export async function executeTransaction(
    publicClient: PublicClient,
    walletClient: WalletClient | null,
    params: TransactionExecuteParams
): Promise<Record<string, unknown>> {
    const { operation } = params;

    if (operation === "sendTransaction") {
        if (!walletClient || !walletClient.account) {
            throw new Error(
                "Ethereum Account credential is required for transaction operations"
            );
        }

        const to = params.to!;
        const valueStr = params.value || "0";
        const data = params.data || "0x";

        const value = parseUnits(valueStr, 18);

        const hash = await walletClient.sendTransaction({
            account: walletClient.account,
            to: to as `0x${string}`,
            value,
            data: data as `0x${string}`,
            chain: undefined,
        });

        return {
            transactionHash: hash,
        };
    }

    if (operation === "getTransaction") {
        const hash = params.transactionHash!;
        const tx = await publicClient.getTransaction({
            hash: hash as `0x${string}`,
        });
        return {
            ...tx,
            value: tx.value.toString(),
            gas: tx.gas.toString(),
            gasPrice: tx.gasPrice?.toString(),
            maxFeePerGas: tx.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
        };
    }

    if (operation === "getTransactionReceipt") {
        const hash = params.transactionHash!;
        const receipt = await publicClient.getTransactionReceipt({
            hash: hash as `0x${string}`,
        });
        return {
            ...receipt,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        };
    }

    if (operation === "waitForTransaction") {
        const hash = params.transactionHash!;
        const confirmations = params.confirmations || 1;
        const receipt = await publicClient.waitForTransactionReceipt({
            hash: hash as `0x${string}`,
            confirmations,
        });
        return {
            ...receipt,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice.toString(),
        };
    }

    if (operation === "estimateGas") {
        const to = params.to!;
        const valueStr = params.value || "0";
        const data = params.data || "0x";

        const value = parseUnits(valueStr, 18);

        const gas = await publicClient.estimateGas({
            to: to as `0x${string}`,
            value,
            data: data as `0x${string}`,
        });

        // Return estimatedGas to match test expectations
        return {
            estimatedGas: gas.toString(),
        };
    }

    throw new Error(`Unknown transaction operation: ${operation}`);
}
