---
sidebar_position: 9
---

# ENS

ENS (Ethereum Name Service) resource provides operations for resolving domain names and addresses.

## Overview

ENS allows users to register human-readable names (like "alice.eth") instead of using hexadecimal addresses.

## Operations

### Get ENS Address

Resolve an ENS name to an Ethereum address.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ENS Name** (required): The ENS name to resolve (e.g., "vitalik.eth")

**Example**:
```json
{
  "ensName": "vitalik.eth"
}
```

**Output**:
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### Get ENS Name

Reverse resolve an address to an ENS name.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **Address** (required): The Ethereum address to resolve

**Example Output**:
```json
{
  "ensName": "vitalik.eth"
}
```

### Get ENS Avatar

Retrieve the avatar URI for an ENS name.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ENS Name** (required): The ENS name to query

**Example Output**:
```json
{
  "avatar": "https://..."
}
```

### Get ENS Text

Get text records associated with an ENS name.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ENS Name** (required): The ENS name to query
- **Key** (required): Text record key (e.g., "email", "url", "twitter", "github")

**Common Text Record Keys**:
- `email`: Email address
- `url`: Website URL
- `avatar`: Avatar image URL
- `description`: Profile description
- `notice`: Notice message
- `keywords`: Keywords
- `com.twitter`: Twitter handle
- `com.github`: GitHub username
- `com.discord`: Discord username

**Example**:
```json
{
  "ensName": "vitalik.eth",
  "key": "com.twitter"
}
```

**Output**:
```json
{
  "text": "VitalikButerin"
}
```

### Get ENS Resolver

Get the resolver contract address for an ENS name.

**Required Credentials**: Ethereum RPC

**Parameters**:
- **ENS Name** (required): The ENS name to query

**Example Output**:
```json
{
  "resolver": "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
}
```

## Common Use Cases

### Resolve Name for Payment

```
[Trigger] → [Get ENS Address] → [Send Transaction] → [Confirmation]
```

### Display User Profile

```
[Trigger] → [Get ENS Name] → [Get ENS Avatar] → [Get ENS Text: twitter] → [Display]
```

### Validate ENS Domain

```
[Trigger] → [Get ENS Address] → [Check if Exists] → [Action]
```

## Tips

- **Mainnet Only**: ENS primarily operates on Ethereum mainnet
- **Case Insensitive**: ENS names are case-insensitive
- **Subdomains**: ENS supports subdomains (e.g., "pay.alice.eth")
- **Reverse Resolution**: Not all addresses have reverse records
- **Text Records**: Custom text records can be set for any ENS name
- **IPFS**: Avatar and content records often use IPFS URLs
