# Task 6: Utils + Integration + Documentation

## 目標

1. 重構 `utils` resource
2. 建立 `resources/index.ts` 整合所有模組
3. 更新 `Ethereum.node.ts` 使用模組化結構
4. 更新 `README.md` 文件

## Git Worktree 設置

```bash
cd /Users/flyinglimao/Code/n8n-ethereum
git worktree add ../n8n-ethereum-task6 HEAD -b task/refactor-utils-integration
cd ../n8n-ethereum-task6
```

## 工作範圍

### 1. 建立 `nodes/Ethereum/resources/utils.ts`

Operations:
- `formatUnits` - 格式化 wei 為可讀格式
- `parseUnits` - 解析可讀格式為 wei
- `validateAddress` - 驗證地址格式
- `getChainId` - 取得 chain ID
- `keccak256` - 計算 keccak256 hash
- `encodeFunctionData` - 編碼函數呼叫
- `decodeFunctionData` - 解碼函數呼叫

**重要：輸出格式需與測試匹配**
```typescript
// formatUnits
{ formatted: string }

// parseUnits
{ parsed: string }

// validateAddress - 注意測試期望是 isValid
{ isValid: boolean, checksumAddress?: string }

// getChainId
{ chainId: string }

// keccak256
{ hash: string }
```

### 2. 建立 `nodes/Ethereum/resources/index.ts`

整合所有 resource 模組：
```typescript
export * from './account';
export * from './block';
export * from './transaction';
export * from './contract';
export * from './erc20';
export * from './erc721';
export * from './erc1155';
export * from './gas';
export * from './signature';
export * from './utils';
export * from './customRpc';
```

### 3. 更新 `Ethereum.node.ts`

重構主檔案使用模組：
```typescript
import {
  accountOperations, accountProperties, executeAccount,
  blockOperations, blockProperties, executeBlock,
  // ... 其他 resources
} from './resources';

export class Ethereum implements INodeType {
  description: INodeTypeDescription = {
    // ...
    properties: [
      resourceProperty,
      accountOperations, ...accountProperties,
      blockOperations, ...blockProperties,
      // ...
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // 使用各資源的 execute 函數
  }
}
```

### 4. 更新 `README.md`

確保文件包含：
- 所有節點的完整說明
- 每個 resource 的用途
- 每個 operation 的輸入/輸出
- 與測試一致的欄位說明

## 完成後

```bash
git add -A
git commit -m "refactor(nodes): create utils module and integrate all resources"
```

---

## 重要：此任務需要等待其他任務完成

此任務建立整合層，需要在其他任務完成後執行，或者：
1. 先建立空的模組結構
2. 讓其他任務填充內容
3. 最後進行整合
