# Troubleshooting

This guide helps you resolve common errors when using n8n-ethereum.

## Table of Contents

- [JSON Parsing Errors](#json-parsing-errors)
- [ABI Errors](#abi-errors)
- [Contract Address Errors](#contract-address-errors)
- [RPC Errors](#rpc-errors)
- [Function/Event Not Found](#functionevent-not-found)
- [Transaction Errors](#transaction-errors)

---

## JSON Parsing Errors

### Error: "contains invalid JSON syntax"

**Cause:** The JSON you provided has syntax errors.

**Common mistakes:**
- Missing or extra commas
- Unquoted property names (must use `"key": value`)
- Single quotes instead of double quotes
- Trailing commas at the end

**Example of incorrect JSON:**
```json
{
  name: "value",        // ❌ Property name not quoted
  'age': 25,            // ❌ Single quotes
  items: [1, 2, 3,]     // ❌ Trailing comma
}
```

**Correct JSON:**
```json
{
  "name": "value",
  "age": 25,
  "items": [1, 2, 3]
}
```

**Solution:**
1. Use a JSON validator like [jsonlint.com](https://jsonlint.com)
2. Ensure all property names are in double quotes
3. Use double quotes for strings
4. Remove trailing commas

### Error: "is incomplete"

**Cause:** Missing closing brackets `]` or braces `}`.

**Solution:**
Check that every opening bracket/brace has a matching closing one:
- `[` must have `]`
- `{` must have `}`

### Error: "contains extra characters after the JSON value"

**Cause:** Text appears after your JSON that shouldn't be there.

**Example:**
```
[{"type": "function"}] extra text
```

**Solution:**
Remove any text after the closing `]` or `}`.

---

## ABI Errors

### Error: "ABI must be an array"

**Cause:** ABI should be a JSON array, not an object or string.

**Incorrect:**
```json
{
  "type": "function",
  "name": "transfer"
}
```

**Correct:**
```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [...]
  }
]
```

### Error: "ABI cannot be empty"

**Cause:** You provided an empty array `[]`.

**Solution:**
Provide at least one function or event definition in your ABI.

### Error: "ABI[0] has invalid type"

**Cause:** ABI item has an unrecognized `type` field.

**Valid types:**
- `function`
- `event`
- `constructor`
- `fallback`
- `receive`
- `error`

**Example:**
```json
[
  {
    "type": "function",      // ✅ Valid
    "name": "transfer",
    "inputs": []
  },
  {
    "type": "event",         // ✅ Valid
    "name": "Transfer",
    "inputs": []
  }
]
```

### Error: "ABI[0] of type 'function' is missing 'name' property"

**Cause:** Functions and events must have a `name` field.

**Solution:**
Add the `name` property:
```json
{
  "type": "function",
  "name": "transfer",        // ✅ Add this
  "inputs": []
}
```

---

## Contract Address Errors

### Error: "Address must start with '0x'"

**Cause:** Ethereum addresses must begin with `0x`.

**Incorrect:**
```
742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Correct:**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Error: "Address must be 42 characters long"

**Cause:** Ethereum addresses are exactly 42 characters: `0x` + 40 hex characters.

**Solution:**
Check your address:
- Too short: May be missing characters
- Too long: May have extra spaces or characters

### Error: "Address contains invalid characters"

**Cause:** Address contains characters other than 0-9, a-f, A-F.

**Solution:**
Ensure the address only contains hexadecimal characters (0-9, a-f, A-F) after the `0x` prefix.

---

## RPC Errors

### Error: "RPC provider limit exceeded: Query returned more than X results"

**Cause:** Your getLogs query returned too many results. Most RPC providers limit results to 10,000 logs.

**Solution:**
1. **Reduce block range:**
   ```
   Instead of: fromBlock=1000000, toBlock=1100000  (100,000 blocks)
   Try: fromBlock=1000000, toBlock=1010000         (10,000 blocks)
   ```

2. **Add event filters:**
   Use indexed event parameters to filter results:
   ```json
   {
     "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   }
   ```

3. **Split into multiple queries:**
   Break your query into smaller block ranges and combine results.

### Error: "RPC provider error: Block range is too large"

**Cause:** The RPC provider has a maximum block range limit.

**Solution:**
1. Check your RPC provider's documentation for limits
2. Common limits:
   - Infura: 10,000 blocks
   - Alchemy: 2,000 blocks for getLogs
   - Public RPCs: Often 1,000-5,000 blocks

3. Split your query into smaller ranges:
   ```
   Query 1: blocks 1000000-1005000
   Query 2: blocks 1005001-1010000
   Query 3: blocks 1010001-1015000
   ```

### Error: "RPC provider rate limit exceeded"

**Cause:** You've made too many requests in a short time.

**Solution:**
1. Wait a moment before retrying
2. Reduce the frequency of your requests
3. Consider upgrading to a paid RPC plan
4. Use a different RPC endpoint

### Error: "RPC request timed out"

**Cause:** The query took too long to execute.

**Solution:**
1. Reduce the block range
2. Add more specific filters
3. Use a faster RPC endpoint
4. Check if your RPC endpoint is experiencing issues

---

## Function/Event Not Found

### Error: "Function 'transfer' not found in ABI"

**Cause:** The function name doesn't exist in your ABI, or there's a typo.

**Solution:**
1. Check the function name spelling
2. Verify your ABI contains the function:
   ```json
   [
     {
       "type": "function",
       "name": "transfer",    // Must match exactly
       "inputs": [...]
     }
   ]
   ```
3. The error message will show available functions

### Error: "Event 'Transfer' not found in ABI"

**Cause:** The event name doesn't exist in your ABI.

**Solution:**
1. Check the event name spelling (case-sensitive)
2. Verify your ABI contains the event:
   ```json
   [
     {
       "type": "event",
       "name": "Transfer",    // Must match exactly
       "inputs": [...]
     }
   ]
   ```

---

## Transaction Errors

### Error: "Contract reverted: [reason]"

**Cause:** The contract rejected your transaction.

**Solution:**
1. Read the revert reason in the error message
2. Common reasons:
   - Insufficient balance
   - Insufficient allowance (for tokens)
   - Invalid parameters
   - Access control (e.g., "Ownable: caller is not the owner")
3. Check your transaction parameters
4. Verify you have permission to call this function

### Error: "Gas estimation failed"

**Cause:** The transaction would fail, so gas estimation failed.

**Solution:**
1. Check the error message for the revert reason
2. Verify your transaction parameters are correct
3. Ensure you have enough token balance
4. Check if the contract has any restrictions

### Error: "Insufficient funds"

**Cause:** Your account doesn't have enough ETH.

**Solution:**
1. Check your account balance
2. Ensure you have enough ETH for:
   - The transaction value
   - Gas fees
3. Add more ETH to your account

---

## Getting Help

If you're still experiencing issues:

1. **Check the error message carefully** - The improved error messages now provide specific guidance
2. **Visit our GitHub Issues** - [github.com/flyinglimao/n8n-ethereum/issues](https://github.com/flyinglimao/n8n-ethereum/issues)
3. **Check the documentation** - [flyinglimao.github.io/n8n-ethereum](https://flyinglimao.github.io/n8n-ethereum)

When reporting issues, please include:
- The complete error message
- Your node configuration (with sensitive data removed)
- The operation you were trying to perform
