import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { chainOptions } from '../utils/chainConfig';

export class EthereumRpc implements ICredentialType {
	name = 'ethereumRpc';
	displayName = 'Ethereum RPC';
	documentationUrl = 'https://ethereum.org/en/developers/docs/apis/json-rpc/';
	icon = 'file:ethereum.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Chain',
			name: 'chain',
			type: 'options',
			options: chainOptions,
			default: 'ethereum-mainnet',
			description: 'The blockchain network to connect to',
		},
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
			description: 'The RPC endpoint URL. Supports HTTP(S) and WebSocket (ws://, wss://) protocols.',
			required: true,
		},
		{
			displayName: 'Custom Headers',
			name: 'customHeaders',
			type: 'json',
			default: '{}',
			placeholder: '{"Authorization": "Bearer token", "X-API-Key": "key"}',
			description: 'Custom HTTP headers to include in requests (JSON format). Useful for API key authentication.',
		},
	];
}
