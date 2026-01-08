import {
    IExecuteFunctions,
    INodeProperties,
    NodeOperationError,
} from "n8n-workflow";
import {
    PublicClient,
    WalletClient,
    recoverMessageAddress,
    verifyMessage,
} from "viem";

export const signatureProperties: INodeProperties[] = [
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ["signature"],
            },
        },
        options: [
            {
                name: "Sign Message",
                value: "signMessage",
                description: "Sign a raw message",
                action: "Sign a message",
            },
            {
                name: "Sign Typed Data",
                value: "signTypedData",
                description: "Sign EIP-712 typed data",
                action: "Sign typed data",
            },
            {
                name: "Sign SIWE Message",
                value: "signSiwe",
                description: "Sign-In with Ethereum (EIP-4361)",
                action: "Sign SIWE message",
            },
            {
                name: "Recover Address",
                value: "recoverAddress",
                description: "Recover address from signature",
                action: "Recover address from signature",
            },
            {
                name: "Verify Message",
                value: "verifyMessage",
                description: "Verify a message signature",
                action: "Verify message signature",
            },
        ],
        default: "signMessage",
    },

    // Signature: Sign Message
    {
        displayName: "Message",
        name: "message",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signMessage", "verifyMessage", "recoverAddress"],
            },
        },
        default: "",
        placeholder: "Hello, Ethereum!",
        description: "The message to sign or verify",
    },

    // Signature: Sign Typed Data
    {
        displayName: "Typed Data",
        name: "typedData",
        type: "json",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signTypedData"],
            },
        },
        default: "{}",
        description: "EIP-712 typed data object",
        placeholder: '{"domain": {...}, "types": {...}, "message": {...}}',
    },

    // Signature: Sign SIWE
    {
        displayName: "Domain",
        name: "siweDomain",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signSiwe"],
            },
        },
        default: "",
        placeholder: "example.com",
        description: "The domain requesting the signature",
    },
    {
        displayName: "Statement",
        name: "siweStatement",
        type: "string",
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signSiwe"],
            },
        },
        default: "",
        placeholder: "Sign in to Example",
        description: "Human-readable statement",
    },
    {
        displayName: "URI",
        name: "siweUri",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signSiwe"],
            },
        },
        default: "",
        placeholder: "https://example.com",
        description: "URI of the requesting application",
    },
    {
        displayName: "Nonce",
        name: "siweNonce",
        type: "string",
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["signSiwe"],
            },
        },
        default: "",
        placeholder: "random-nonce",
        description: "Random nonce for replay protection",
    },

    // Signature: Verify Message / Recover Address
    {
        displayName: "Signature",
        name: "signature",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["verifyMessage", "recoverAddress"],
            },
        },
        default: "",
        placeholder: "0x...",
        description: "The signature to verify",
    },
    {
        displayName: "Address",
        name: "address",
        type: "string",
        required: true,
        displayOptions: {
            show: {
                resource: ["signature"],
                operation: ["verifyMessage"],
            },
        },
        default: "",
        placeholder: "0x...",
        description: "The address that supposedly signed the message",
    },
];

export async function executeSignature(
    context: IExecuteFunctions,
    publicClient: PublicClient,
    walletClient: WalletClient | null,
    operation: string,
    i: number
): Promise<any> {
    if (operation === "signMessage") {
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required for signing"
            );
        }

        const message = context.getNodeParameter("message", i) as string;
        const signature = await walletClient.signMessage({
            account: walletClient.account!,
            message,
        });

        return {
            message,
            signature,
            address: walletClient.account!.address,
        };
    } else if (operation === "signTypedData") {
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required for signing"
            );
        }

        const typedDataStr = context.getNodeParameter("typedData", i) as string;
        const typedData = JSON.parse(typedDataStr);

        const signature = await walletClient.signTypedData({
            account: walletClient.account!,
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
        });

        return {
            typedData,
            signature,
            address: walletClient.account!.address,
        };
    } else if (operation === "signSiwe") {
        if (!walletClient) {
            throw new NodeOperationError(
                context.getNode(),
                "Ethereum Account credential is required for signing"
            );
        }

        const domain = context.getNodeParameter("siweDomain", i) as string;
        const statement = context.getNodeParameter(
            "siweStatement",
            i,
            ""
        ) as string;
        const uri = context.getNodeParameter("siweUri", i) as string;
        const nonce = context.getNodeParameter(
            "siweNonce",
            i,
            Math.random().toString(36).substring(7)
        ) as string;

        // Build SIWE message
        const address = walletClient.account!.address;
        const chainId = await publicClient.getChainId();
        const issuedAt = new Date().toISOString();

        const siweMessage = [
            `${domain} wants you to sign in with your Ethereum account:`,
            address,
            "",
            statement || "Sign in with Ethereum",
            "",
            `URI: ${uri}`,
            `Version: 1`,
            `Chain ID: ${chainId}`,
            `Nonce: ${nonce}`,
            `Issued At: ${issuedAt}`,
        ].join("\n");

        const signature = await walletClient.signMessage({
            account: walletClient.account!,
            message: siweMessage,
        });

        return {
            message: siweMessage,
            signature,
            address,
            domain,
            uri,
            nonce,
            chainId,
            issuedAt,
        };
    } else if (operation === "recoverAddress") {
        const message = context.getNodeParameter("message", i) as string;
        const signature = context.getNodeParameter("signature", i) as string;

        const recoveredAddress = await recoverMessageAddress({
            message,
            signature: signature as `0x${string}`,
        });

        return {
            message,
            signature,
            recoveredAddress,
        };
    } else if (operation === "verifyMessage") {
        const message = context.getNodeParameter("message", i) as string;
        const signature = context.getNodeParameter("signature", i) as string;
        const address = context.getNodeParameter("address", i) as string;

        const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
        });

        return {
            message,
            signature,
            address,
            isValid,
        };
    }

    return {};
}
