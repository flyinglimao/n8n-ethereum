// Standard ERC1155 ABI
export const erc1155Abi = [
	{
		type: 'function',
		name: 'balanceOf',
		stateMutability: 'view',
		inputs: [
			{ name: 'account', type: 'address' },
			{ name: 'id', type: 'uint256' },
		],
		outputs: [{ name: 'balance', type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'balanceOfBatch',
		stateMutability: 'view',
		inputs: [
			{ name: 'accounts', type: 'address[]' },
			{ name: 'ids', type: 'uint256[]' },
		],
		outputs: [{ name: 'balances', type: 'uint256[]' }],
	},
	{
		type: 'function',
		name: 'safeTransferFrom',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'id', type: 'uint256' },
			{ name: 'amount', type: 'uint256' },
			{ name: 'data', type: 'bytes' },
		],
		outputs: [],
	},
	{
		type: 'function',
		name: 'safeBatchTransferFrom',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'ids', type: 'uint256[]' },
			{ name: 'amounts', type: 'uint256[]' },
			{ name: 'data', type: 'bytes' },
		],
		outputs: [],
	},
	{
		type: 'function',
		name: 'setApprovalForAll',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'operator', type: 'address' },
			{ name: 'approved', type: 'bool' },
		],
		outputs: [],
	},
	{
		type: 'function',
		name: 'isApprovedForAll',
		stateMutability: 'view',
		inputs: [
			{ name: 'account', type: 'address' },
			{ name: 'operator', type: 'address' },
		],
		outputs: [{ name: 'approved', type: 'bool' }],
	},
	{
		type: 'function',
		name: 'uri',
		stateMutability: 'view',
		inputs: [{ name: 'id', type: 'uint256' }],
		outputs: [{ name: 'uri', type: 'string' }],
	},
] as const;
