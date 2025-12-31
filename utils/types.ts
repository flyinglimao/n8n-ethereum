import type { Address, Hash, Hex } from 'viem';

export interface RpcNodeCredentials {
	rpcUrl: string;
	customHeaders?: string;
	chainId?: number;
}

export interface WalletCredentials {
	privateKey?: string;
	mnemonic?: string;
	path?: string;
	passphrase?: string;
}

export interface AbiCredentials {
	contractAddress?: string;
	abi: string;
}

export interface TransactionParams {
	to?: Address;
	from?: Address;
	value?: bigint;
	data?: Hex;
	gas?: bigint;
	gasPrice?: bigint;
	maxFeePerGas?: bigint;
	maxPriorityFeePerGas?: bigint;
	nonce?: number;
}

export interface BlockTag {
	blockNumber?: bigint;
	blockHash?: Hash;
	blockTag?: 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
}

export interface EventFilter {
	address?: Address | Address[];
	topics?: (Hex | Hex[] | null)[];
	fromBlock?: bigint;
	toBlock?: bigint;
}

export interface ParsedAbi {
	abi: any[];
	functions: { [key: string]: any };
	events: { [key: string]: any };
}

export interface ChainConfig {
	id: number;
	name: string;
	network: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: {
		default: {
			http: string[];
			webSocket?: string[];
		};
		public: {
			http: string[];
			webSocket?: string[];
		};
	};
	blockExplorers?: {
		default: {
			name: string;
			url: string;
		};
	};
	testnet: boolean;
}
