import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EthereumAccount implements ICredentialType {
	name = 'ethereumAccount';
	displayName = 'Ethereum Account';
	documentationUrl = 'https://ethereum.org/en/developers/docs/accounts/';
	icon = 'file:ethereum.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: '0x1234567890abcdef...',
			description: 'The private key of your Ethereum wallet (64 hex characters, with or without 0x prefix). Leave empty if using mnemonic.',
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'word1 word2 word3 ... word12',
			description: 'The 12 or 24 word mnemonic phrase (seed phrase) of your wallet. Leave empty if using private key.',
		},
		{
			displayName: 'Derivation Path',
			name: 'path',
			type: 'string',
			default: "m/44'/60'/0'/0/0",
			placeholder: "m/44'/60'/0'/0/0",
			description: 'The BIP-44 derivation path to use when deriving account from mnemonic. Default is the standard Ethereum path. Only used when mnemonic is provided.',
		},
		{
			displayName: 'Passphrase',
			name: 'passphrase',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Optional passphrase',
			description: 'Optional passphrase for BIP-39 mnemonic. Only used when mnemonic is provided.',
		},
	];
}
