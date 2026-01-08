import type { Abi } from 'viem';

/**
 * Safely parse JSON with better error messages
 */
export function safeJsonParse<T = any>(
	jsonString: string,
	fieldName: string,
	expectedType?: 'array' | 'object'
): T {
	// Trim whitespace
	const trimmed = jsonString.trim();

	// Check if empty
	if (!trimmed) {
		throw new Error(
			`${fieldName} cannot be empty. Please provide a valid JSON ${expectedType || 'value'}.`
		);
	}

	// Try to parse
	let parsed: any;
	try {
		parsed = JSON.parse(trimmed);
	} catch (error: any) {
		// Provide more helpful error messages based on common mistakes
		const errorMsg = error.message || String(error);

		// Common JSON errors
		if (errorMsg.includes('Unexpected token')) {
			throw new Error(
				`${fieldName} contains invalid JSON syntax. ` +
				`Please check for:\n` +
				`- Missing or extra commas\n` +
				`- Unquoted property names (use "key": value)\n` +
				`- Single quotes instead of double quotes\n` +
				`- Trailing commas at the end of objects or arrays\n\n` +
				`Original error: ${errorMsg}`
			);
		}

		if (errorMsg.includes('Unexpected end of JSON input')) {
			throw new Error(
				`${fieldName} is incomplete. ` +
				`Please check for missing closing brackets ] or braces }.\n\n` +
				`Original error: ${errorMsg}`
			);
		}

		if (errorMsg.includes('Unexpected non-whitespace character after JSON')) {
			throw new Error(
				`${fieldName} contains extra characters after the JSON value. ` +
				`Please ensure there's only one valid JSON value and no trailing text.\n\n` +
				`Original error: ${errorMsg}`
			);
		}

		// Generic JSON error
		throw new Error(
			`${fieldName} is not valid JSON. ` +
			`Please ensure it follows proper JSON syntax.\n\n` +
			`Original error: ${errorMsg}`
		);
	}

	// Validate expected type
	if (expectedType === 'array' && !Array.isArray(parsed)) {
		throw new Error(
			`${fieldName} must be a JSON array (starts with [ and ends with ]). ` +
			`Received: ${typeof parsed}`
		);
	}

	if (expectedType === 'object' && (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null)) {
		throw new Error(
			`${fieldName} must be a JSON object (starts with { and ends with }). ` +
			`Received: ${Array.isArray(parsed) ? 'array' : typeof parsed}`
		);
	}

	return parsed as T;
}

/**
 * Validate Ethereum address format
 */
export function validateAddress(address: string, fieldName: string = 'Address'): void {
	if (!address || typeof address !== 'string') {
		throw new Error(`${fieldName} is required.`);
	}

	const trimmed = address.trim();

	if (!trimmed.startsWith('0x')) {
		throw new Error(
			`${fieldName} must start with '0x'. ` +
			`Received: ${trimmed.substring(0, 10)}...`
		);
	}

	if (trimmed.length !== 42) {
		throw new Error(
			`${fieldName} must be 42 characters long (0x + 40 hex characters). ` +
			`Received length: ${trimmed.length}`
		);
	}

	if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
		throw new Error(
			`${fieldName} contains invalid characters. ` +
			`Must only contain hexadecimal characters (0-9, a-f, A-F).`
		);
	}
}

/**
 * Validate ABI structure
 */
export function validateAbi(abi: any, fieldName: string = 'ABI'): void {
	if (!Array.isArray(abi)) {
		throw new Error(
			`${fieldName} must be an array. ` +
			`Please ensure your ABI is formatted as a JSON array: [{...}, {...}]`
		);
	}

	if (abi.length === 0) {
		throw new Error(
			`${fieldName} cannot be empty. ` +
			`Please provide at least one function or event definition.`
		);
	}

	// Validate each item has required properties
	for (let i = 0; i < abi.length; i++) {
		const item = abi[i];

		if (!item || typeof item !== 'object') {
			throw new Error(
				`${fieldName}[${i}] is not a valid object. ` +
				`Each ABI item must be an object with 'type' and 'name' properties.`
			);
		}

		if (!item.type) {
			throw new Error(
				`${fieldName}[${i}] is missing 'type' property. ` +
				`Valid types are: function, event, constructor, fallback, receive.`
			);
		}

		const validTypes = ['function', 'event', 'constructor', 'fallback', 'receive', 'error'];
		if (!validTypes.includes(item.type)) {
			throw new Error(
				`${fieldName}[${i}] has invalid type '${item.type}'. ` +
				`Valid types are: ${validTypes.join(', ')}`
			);
		}

		// Functions and events must have names
		if ((item.type === 'function' || item.type === 'event' || item.type === 'error') && !item.name) {
			throw new Error(
				`${fieldName}[${i}] of type '${item.type}' is missing 'name' property.`
			);
		}
	}
}

/**
 * Validate and parse ABI from string
 */
export function parseAndValidateAbi(abiString: string, fieldName: string = 'ABI'): Abi {
	// Parse JSON
	const abi = safeJsonParse<Abi>(abiString, fieldName, 'array');

	// Validate structure
	validateAbi(abi, fieldName);

	return abi;
}

/**
 * Validate block range
 */
export function validateBlockRange(
	fromBlock: bigint | string,
	toBlock: bigint | string,
	maxRange: bigint = 10000n
): void {
	// Convert to bigint if needed
	const from = typeof fromBlock === 'string' &&
		!['latest', 'earliest', 'pending'].includes(fromBlock)
		? BigInt(fromBlock)
		: fromBlock;

	const to = typeof toBlock === 'string' &&
		!['latest', 'earliest', 'pending'].includes(toBlock)
		? BigInt(toBlock)
		: toBlock;

	// Only validate if both are numbers
	if (typeof from === 'bigint' && typeof to === 'bigint') {
		if (from > to) {
			throw new Error(
				`Invalid block range: fromBlock (${from.toString()}) cannot be greater than toBlock (${to.toString()}). ` +
				`Please ensure fromBlock <= toBlock.`
			);
		}

		const range = to - from + 1n;
		if (range > maxRange) {
			throw new Error(
				`Block range too large: ${range.toString()} blocks (from ${from.toString()} to ${to.toString()}). ` +
				`Maximum allowed range is ${maxRange.toString()} blocks. ` +
				`\n\nSuggestion: Try breaking your query into smaller ranges, such as:\n` +
				`- Range 1: ${from.toString()} to ${(from + maxRange - 1n).toString()}\n` +
				`- Range 2: ${(from + maxRange).toString()} to ${to.toString()}`
			);
		}
	}
}

/**
 * Validate function/event name exists in ABI
 */
export function validateNameInAbi(
	abi: Abi,
	name: string,
	type: 'function' | 'event',
	fieldName: string = 'Name'
): void {
	const items = abi.filter((item: any) => item.type === type);

	if (items.length === 0) {
		throw new Error(
			`No ${type}s found in ABI. ` +
			`Please ensure your ABI contains at least one ${type} definition.`
		);
	}

	const found = items.find((item: any) => item.name === name);

	if (!found) {
		const availableNames = items
			.map((item: any) => item.name)
			.filter(Boolean)
			.join(', ');

		throw new Error(
			`${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' not found in ABI. ` +
			`\n\nAvailable ${type}s: ${availableNames || 'none'}`
		);
	}
}
