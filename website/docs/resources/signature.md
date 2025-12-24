---
sidebar_position: 10
---

# Signature

Signature resource provides operations for signing and verifying messages and typed data.

## Overview

Digital signatures are used to prove ownership of an address and authenticate messages without revealing the private key.

## Operations

### Sign Message

Sign a personal message with your wallet.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Message** (required): The message to sign

**Use Cases**:
- Authenticate users
- Prove ownership of address
- Sign off-chain messages

**Example**:
```json
{
  "message": "I agree to the terms and conditions"
}
```

**Output**:
```json
{
  "signature": "0x1234567890abcdef..."
}
```

### Sign Typed Data

Sign structured data according to EIP-712.

**Required Credentials**: Ethereum RPC, Ethereum Account

**Parameters**:
- **Domain** (required): EIP-712 domain separator
- **Types** (required): Type definitions
- **Value** (required): The data to sign

**Use Cases**:
- Sign permit transactions (gasless approvals)
- Sign structured messages for dApps
- Create verifiable signatures for complex data

### Verify Message

Verify a personal message signature.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Message** (required): The original message
- **Signature** (required): The signature to verify
- **Address** (required): Expected signer address

**Example Output**:
```json
{
  "valid": true,
  "recoveredAddress": "0x..."
}
```

### Verify Typed Data

Verify an EIP-712 signature.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Domain** (required): EIP-712 domain separator
- **Types** (required): Type definitions
- **Value** (required): The original data
- **Signature** (required): The signature to verify
- **Address** (required): Expected signer address

### Recover Address

Recover the signer address from a signature.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Message** (required): The original message
- **Signature** (required): The signature

**Example Output**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Hash Message

Calculate the keccak256 hash of a message.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Message** (required): The message to hash

**Example Output**:
```json
{
  "hash": "0x1234567890abcdef..."
}
```

### Hash Typed Data

Hash typed data for signing (EIP-712).

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Domain** (required): EIP-712 domain separator
- **Types** (required): Type definitions
- **Value** (required): The data to hash

## Common Use Cases

### User Authentication

```
[Trigger] → [Sign Message] → [Verify Message] → [Authenticate User]
```

### Gasless Approvals (EIP-2612)

```
[Trigger] → [Sign Typed Data: Permit] → [Submit to Contract] → [Token Approved]
```

### Verify Ownership

```
[User Input] → [Recover Address] → [Check Ownership] → [Grant Access]
```

## EIP-712 Domain Example

```json
{
  "name": "MyDApp",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0x..."
}
```

## Tips

- **Personal Sign**: Use Sign Message for simple text authentication
- **EIP-712**: Use for structured data that needs to be human-readable
- **Security**: Never sign messages you don't understand
- **Verification**: Always verify signatures before trusting them
- **Recovery**: Recover Address can identify who signed a message
- **Chain ID**: Include chain ID in EIP-712 to prevent replay attacks
