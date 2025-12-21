import { mainnet, sepolia, goerli, polygon, polygonMumbai, bsc, bscTestnet, arbitrum, arbitrumGoerli, optimism, optimismGoerli, avalanche, avalancheFuji, fantom, fantomTestnet, base, baseGoerli } from 'viem/chains';
import type { Chain } from 'viem';

export const supportedChains: { [key: string]: Chain } = {
	// Ethereum
	'ethereum-mainnet': mainnet,
	'ethereum-sepolia': sepolia,
	'ethereum-goerli': goerli,

	// Polygon
	'polygon-mainnet': polygon,
	'polygon-mumbai': polygonMumbai,

	// BSC
	'bsc-mainnet': bsc,
	'bsc-testnet': bscTestnet,

	// Arbitrum
	'arbitrum-mainnet': arbitrum,
	'arbitrum-goerli': arbitrumGoerli,

	// Optimism
	'optimism-mainnet': optimism,
	'optimism-goerli': optimismGoerli,

	// Avalanche
	'avalanche-mainnet': avalanche,
	'avalanche-fuji': avalancheFuji,

	// Fantom
	'fantom-mainnet': fantom,
	'fantom-testnet': fantomTestnet,

	// Base
	'base-mainnet': base,
	'base-goerli': baseGoerli,
};

export const chainOptions = [
	{ name: 'Ethereum Mainnet', value: 'ethereum-mainnet' },
	{ name: 'Ethereum Sepolia (Testnet)', value: 'ethereum-sepolia' },
	{ name: 'Ethereum Goerli (Testnet)', value: 'ethereum-goerli' },
	{ name: 'Polygon Mainnet', value: 'polygon-mainnet' },
	{ name: 'Polygon Mumbai (Testnet)', value: 'polygon-mumbai' },
	{ name: 'BSC Mainnet', value: 'bsc-mainnet' },
	{ name: 'BSC Testnet', value: 'bsc-testnet' },
	{ name: 'Arbitrum One', value: 'arbitrum-mainnet' },
	{ name: 'Arbitrum Goerli (Testnet)', value: 'arbitrum-goerli' },
	{ name: 'Optimism Mainnet', value: 'optimism-mainnet' },
	{ name: 'Optimism Goerli (Testnet)', value: 'optimism-goerli' },
	{ name: 'Avalanche C-Chain', value: 'avalanche-mainnet' },
	{ name: 'Avalanche Fuji (Testnet)', value: 'avalanche-fuji' },
	{ name: 'Fantom Opera', value: 'fantom-mainnet' },
	{ name: 'Fantom Testnet', value: 'fantom-testnet' },
	{ name: 'Base Mainnet', value: 'base-mainnet' },
	{ name: 'Base Goerli (Testnet)', value: 'base-goerli' },
	{ name: 'Custom RPC', value: 'custom' },
];

export function getChain(chainKey: string): Chain | undefined {
	return supportedChains[chainKey];
}

export function getChainById(chainId: number): Chain | undefined {
	return Object.values(supportedChains).find(chain => chain.id === chainId);
}
