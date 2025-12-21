import type { PublicClient, Address, Hash, BlockTag as ViemBlockTag } from 'viem';
import type { BlockTag } from './types';

/**
 * Helper to resolve block tag parameter
 */
export function resolveBlockTag(blockTag?: BlockTag): ViemBlockTag | bigint | undefined {
	if (!blockTag) return 'latest';

	if (blockTag.blockNumber !== undefined) {
		return blockTag.blockNumber;
	}

	if (blockTag.blockTag) {
		return blockTag.blockTag;
	}

	return 'latest';
}

/**
 * Helper to parse address or array of addresses
 */
export function parseAddress(address: string | string[]): Address | Address[] {
	if (Array.isArray(address)) {
		return address.map(addr => addr as Address);
	}
	return address as Address;
}

/**
 * Helper to parse hash
 */
export function parseHash(hash: string): Hash {
	return hash as Hash;
}

/**
 * Format wei to human readable
 */
export function formatWei(wei: bigint, decimals: number = 18): string {
	const divisor = 10n ** BigInt(decimals);
	const wholePart = wei / divisor;
	const fractionalPart = wei % divisor;

	if (fractionalPart === 0n) {
		return wholePart.toString();
	}

	const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
	const trimmed = fractionalStr.replace(/0+$/, '');

	return `${wholePart}.${trimmed}`;
}

/**
 * Parse human readable to wei
 */
export function parseToWei(value: string, decimals: number = 18): bigint {
	const [wholePart, fractionalPart = ''] = value.split('.');
	const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
	const combined = wholePart + paddedFractional;
	return BigInt(combined);
}
