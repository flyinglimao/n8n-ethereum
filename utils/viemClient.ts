import { createPublicClient, createWalletClient, http, webSocket, type PublicClient, type WalletClient, type Transport, type Chain, type Account } from 'viem';
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts';
import { getChain, supportedChains } from './chainConfig';
import type { RpcNodeCredentials, WalletCredentials } from './types';

export interface ClientOptions {
	credentials: RpcNodeCredentials;
	chainKey?: string;
}

export function createViemPublicClient(options: ClientOptions): PublicClient {
	const { credentials, chainKey } = options;

	// Parse custom headers if provided
	let headers: Record<string, string> = {};
	if (credentials.customHeaders) {
		try {
			headers = JSON.parse(credentials.customHeaders);
		} catch (error) {
			throw new Error(`Invalid custom headers JSON: ${error}`);
		}
	}

	// Get chain configuration
	let chain: Chain | undefined;
	if (chainKey && chainKey !== 'custom') {
		chain = getChain(chainKey);
	} else if (credentials.chainId) {
		chain = Object.values(supportedChains).find(c => c.id === credentials.chainId);
	}

	// Determine transport type (HTTP or WebSocket)
	const isWebSocket = credentials.rpcUrl.startsWith('ws://') || credentials.rpcUrl.startsWith('wss://');

	const transport: Transport = isWebSocket
		? webSocket(credentials.rpcUrl, {
				key: 'custom',
		  })
		: http(credentials.rpcUrl, {
				key: 'custom',
				fetchOptions: {
					headers,
				},
		  });

	return createPublicClient({
		chain,
		transport,
	});
}

export function createViemWalletClient(
	publicClient: PublicClient,
	walletCredentials: WalletCredentials,
): WalletClient {
	let account: Account;

	if (walletCredentials.privateKey) {
		// Use private key
		const privateKey = walletCredentials.privateKey.startsWith('0x')
			? (walletCredentials.privateKey as `0x${string}`)
			: (`0x${walletCredentials.privateKey}` as `0x${string}`);
		account = privateKeyToAccount(privateKey);
	} else if (walletCredentials.mnemonic) {
		// Use mnemonic
		account = mnemonicToAccount(walletCredentials.mnemonic);
	} else {
		throw new Error('Either privateKey or mnemonic must be provided');
	}

	return createWalletClient({
		account,
		chain: publicClient.chain,
		transport: publicClient.transport,
	});
}
