import type { Abi, AbiFunction, AbiEvent } from 'viem';
import type { ParsedAbi, AbiCredentials } from './types';

/**
 * Parse and validate ABI
 */
export function parseAbi(abiCredentials: AbiCredentials): ParsedAbi {
	let abi: Abi;

	try {
		abi = typeof abiCredentials.abi === 'string'
			? JSON.parse(abiCredentials.abi)
			: abiCredentials.abi;
	} catch (error) {
		throw new Error(`Invalid ABI JSON: ${error}`);
	}

	if (!Array.isArray(abi)) {
		throw new Error('ABI must be an array');
	}

	// Extract functions and events
	const functions: { [key: string]: AbiFunction } = {};
	const events: { [key: string]: AbiEvent } = {};

	for (const item of abi) {
		if (item.type === 'function') {
			const func = item as AbiFunction;
			const signature = buildFunctionSignature(func);
			functions[signature] = func;
		} else if (item.type === 'event') {
			const event = item as AbiEvent;
			const signature = buildEventSignature(event);
			events[signature] = event;
		}
	}

	return {
		abi,
		functions,
		events,
	};
}

/**
 * Build function signature for display
 */
export function buildFunctionSignature(func: AbiFunction): string {
	const inputs = func.inputs?.map(input => {
		const name = input.name || '';
		return name ? `${input.type} ${name}` : input.type;
	}).join(', ') || '';

	const stateMutability = func.stateMutability ? ` (${func.stateMutability})` : '';
	return `${func.name}(${inputs})${stateMutability}`;
}

/**
 * Build event signature for display
 */
export function buildEventSignature(event: AbiEvent): string {
	const inputs = event.inputs?.map(input => {
		const indexed = input.indexed ? ' indexed' : '';
		const name = input.name || '';
		return name ? `${input.type}${indexed} ${name}` : `${input.type}${indexed}`;
	}).join(', ') || '';

	return `${event.name}(${inputs})`;
}

/**
 * Get function by name from parsed ABI
 */
export function getFunctionByName(parsedAbi: ParsedAbi, functionName: string): AbiFunction | undefined {
	return Object.values(parsedAbi.functions).find(func => func.name === functionName);
}

/**
 * Get event by name from parsed ABI
 */
export function getEventByName(parsedAbi: ParsedAbi, eventName: string): AbiEvent | undefined {
	return Object.values(parsedAbi.events).find(event => event.name === eventName);
}

/**
 * Create options list for function selector
 */
export function createFunctionOptions(parsedAbi: ParsedAbi, filter?: 'read' | 'write'): Array<{ name: string; value: string }> {
	return Object.entries(parsedAbi.functions)
		.filter(([_, func]) => {
			if (!filter) return true;
			if (filter === 'read') {
				return func.stateMutability === 'view' || func.stateMutability === 'pure';
			}
			if (filter === 'write') {
				return func.stateMutability !== 'view' && func.stateMutability !== 'pure';
			}
			return true;
		})
		.map(([signature, func]) => ({
			name: signature,
			value: func.name,
		}));
}

/**
 * Create options list for event selector
 */
export function createEventOptions(parsedAbi: ParsedAbi): Array<{ name: string; value: string }> {
	return Object.entries(parsedAbi.events).map(([signature, event]) => ({
		name: signature,
		value: event.name,
	}));
}

/**
 * Validate contract address format
 */
export function isValidAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Parse function arguments from node parameters
 */
export function parseFunctionArgs(func: AbiFunction, parameters: any): any[] {
	if (!func.inputs || func.inputs.length === 0) {
		return [];
	}

	const args: any[] = [];
	for (let i = 0; i < func.inputs.length; i++) {
		const input = func.inputs[i];
		const paramName = `arg${i}`;
		let value = parameters[paramName];

		// Type conversion
		if (input.type.startsWith('uint') || input.type.startsWith('int')) {
			value = BigInt(value);
		} else if (input.type === 'bool') {
			value = value === 'true' || value === true;
		} else if (input.type.startsWith('bytes')) {
			// Ensure hex prefix
			value = value.startsWith('0x') ? value : `0x${value}`;
		}
		// Arrays handling
		else if (input.type.endsWith('[]')) {
			if (typeof value === 'string') {
				value = JSON.parse(value);
			}
		}

		args.push(value);
	}

	return args;
}
