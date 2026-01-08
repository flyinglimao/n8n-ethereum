import { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { formatUnits, PublicClient } from "viem";

export const gasOperations: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
        show: {
            resource: ["gas"],
        },
    },
    options: [
        {
            name: "Get Gas Price",
            value: "getGasPrice",
            description: "Get current gas price",
            action: "Get gas price",
        },
        {
            name: "Get Fee History",
            value: "getFeeHistory",
            description: "Get historical fee data",
            action: "Get fee history",
        },
        {
            name: "Estimate Max Priority Fee",
            value: "estimateMaxPriorityFee",
            description: "Estimate EIP-1559 priority fee",
            action: "Estimate max priority fee",
        },
    ],
    default: "getGasPrice",
};

export const gasProperties: INodeProperties[] = [
    // Gas: Get Fee History
    {
        displayName: "Block Count",
        name: "blockCount",
        type: "number",
        displayOptions: {
            show: {
                resource: ["gas"],
                operation: ["getFeeHistory"],
            },
        },
        default: 4,
        description: "Number of blocks to include",
    },
    {
        displayName: "Reward Percentiles",
        name: "rewardPercentiles",
        type: "json",
        displayOptions: {
            show: {
                resource: ["gas"],
                operation: ["getFeeHistory"],
            },
        },
        default: "[25, 50, 75]",
        description: "Array of reward percentiles",
    },
];

export async function executeGas(
    context: IExecuteFunctions,
    itemIndex: number,
    publicClient: PublicClient
): Promise<Record<string, unknown>> {
    const operation = context.getNodeParameter("operation", itemIndex) as string;

    if (operation === "getGasPrice") {
        const gasPrice = await publicClient.getGasPrice();
        return {
            gasPrice: gasPrice.toString(),
            gasPriceGwei: formatUnits(gasPrice, 9),
        };
    } else if (operation === "getFeeHistory") {
        const blockCount = context.getNodeParameter(
            "blockCount",
            itemIndex
        ) as number;
        const rewardPercentilesStr = context.getNodeParameter(
            "rewardPercentiles",
            itemIndex
        ) as string;
        const rewardPercentiles = JSON.parse(rewardPercentilesStr);

        const feeHistory = await publicClient.getFeeHistory({
            blockCount,
            rewardPercentiles,
        });

        return {
            ...feeHistory,
            baseFeePerGas: feeHistory.baseFeePerGas.map((fee: any) => fee.toString()),
            gasUsedRatio: feeHistory.gasUsedRatio,
            reward: feeHistory.reward?.map((r: any) =>
                r.map((v: any) => v.toString())
            ),
        };
    } else if (operation === "estimateMaxPriorityFee") {
        const maxPriorityFee = await publicClient.estimateMaxPriorityFeePerGas();
        return {
            maxPriorityFeePerGas: maxPriorityFee.toString(),
            maxPriorityFeePerGasGwei: formatUnits(maxPriorityFee, 9),
        };
    }

    return {};
}
