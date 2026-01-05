/**
 * Custom RPC Resource Module
 *
 * Operations:
 * - request: Send a custom RPC request
 */

import type { INodeProperties } from "n8n-workflow";
import type { PublicClient } from "viem";

/**
 * Custom RPC resource properties for n8n node description
 */
export const customRpcProperties: INodeProperties[] = [
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ["customRpc"],
            },
        },
        options: [
            {
                name: "Request",
                value: "request",
                description: "Send a custom RPC request",
                action: "Send custom RPC request",
            },
        ],
        default: "request",
    },

    // Custom RPC: Request
    {
        displayName: "RPC Method",
        name: "rpcMethod",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["customRpc"],
                operation: ["request"],
            },
        },
        default: "",
        placeholder: "eth_getBalance",
        description:
            "The RPC method to call (e.g., eth_getBalance, eth_call, debug_traceTransaction)",
    },
    {
        displayName: "RPC Parameters",
        name: "rpcParams",
        type: "json",
        displayOptions: {
            show: {
                resource: ["customRpc"],
                operation: ["request"],
            },
        },
        default: "[]",
        placeholder: '["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "latest"]',
        description: "The parameters for the RPC method as a JSON array",
    },
];

/**
 * Execute parameters for custom RPC operations
 */
export interface CustomRpcExecuteParams {
    operation: string;
    rpcMethod?: string;
    rpcParams?: string;
}

/**
 * Execute custom RPC resource operations
 */
export async function executeCustomRpc(
    publicClient: PublicClient,
    params: CustomRpcExecuteParams
): Promise<Record<string, unknown>> {
    const { operation } = params;

    if (operation === "request") {
        const rpcMethod = params.rpcMethod!;
        const rpcParamsStr = params.rpcParams || "[]";
        const rpcParams = JSON.parse(rpcParamsStr);

        // Make the raw RPC request using the public client's transport
        const result = await publicClient.request({
            method: rpcMethod as any,
            params: rpcParams,
        });

        // Return only result to match test expectations
        return {
            result,
        };
    }

    throw new Error(`Unknown customRpc operation: ${operation}`);
}
