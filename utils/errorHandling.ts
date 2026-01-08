import {
	BaseError,
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	TransactionExecutionError,
	EstimateGasExecutionError,
	RpcError,
} from 'viem';

/**
 * Extract and format RPC error details
 */
function extractRpcErrorDetails(error: any): string | null {
	// Check for RPC error in the error chain
	let currentError = error;
	while (currentError) {
		// Check if this is an RPC error
		if (currentError.name === 'RpcError' || currentError instanceof RpcError) {
			const details = currentError.details || currentError.message;
			if (details) return details;
		}

		// Check for HTTP request error (common with RPC calls)
		if (currentError.name === 'HttpRequestError') {
			const details = currentError.details || currentError.message;
			if (details) return details;
		}

		// Check for error.cause chain
		currentError = currentError.cause;
	}

	// Check error message for common RPC error patterns
	const errorMessage = error?.message || String(error);

	// Pattern: "query returned more than X results"
	const logLimitMatch = errorMessage.match(/query returned more than (\d+) results/i);
	if (logLimitMatch) {
		return `RPC provider limit exceeded: Query returned more than ${logLimitMatch[1]} results. Please reduce your block range or add more specific filters.`;
	}

	// Pattern: "block range too large"
	if (errorMessage.match(/block range (is )?too large/i)) {
		return 'RPC provider error: Block range is too large. Please reduce the number of blocks in your query.';
	}

	// Pattern: "exceed maximum block range"
	const maxRangeMatch = errorMessage.match(/exceed(?:s|ed)? maximum block range[:\s]+(\d+)/i);
	if (maxRangeMatch) {
		return `RPC provider limit: Maximum block range is ${maxRangeMatch[1]} blocks. Please reduce your query range.`;
	}

	// Pattern: rate limit
	if (errorMessage.match(/rate limit|too many requests/i)) {
		return 'RPC provider rate limit exceeded. Please wait a moment and try again, or consider using a different RPC endpoint.';
	}

	// Pattern: timeout
	if (errorMessage.match(/timeout|timed out/i)) {
		return 'RPC request timed out. The query may be too complex or the RPC endpoint may be slow. Try reducing the block range or using a faster RPC endpoint.';
	}

	return null;
}

/**
 * Parse and format viem errors for user-friendly display
 */
export function parseViemError(error: unknown): string {
	if (error instanceof BaseError) {
		// First check for RPC errors in the error chain
		const rpcError = extractRpcErrorDetails(error);
		if (rpcError) {
			return rpcError;
		}

		// Handle contract function execution errors
		if (error instanceof ContractFunctionExecutionError) {
			const cause = error.cause;

			if (cause instanceof ContractFunctionRevertedError) {
				const revertError = cause as ContractFunctionRevertedError;
				if (revertError.data?.errorName) {
					return `Contract reverted: ${revertError.data.errorName}`;
				}
				if (revertError.reason) {
					return `Contract reverted: ${revertError.reason}`;
				}
				return 'Contract execution reverted';
			}

			// Check for RPC errors in contract execution
			const contractRpcError = extractRpcErrorDetails(cause);
			if (contractRpcError) {
				return contractRpcError;
			}

			return error.shortMessage || error.message;
		}

		// Handle transaction execution errors
		if (error instanceof TransactionExecutionError) {
			// Check for RPC errors in transaction
			const txRpcError = extractRpcErrorDetails(error.cause);
			if (txRpcError) {
				return txRpcError;
			}

			return error.shortMessage || error.message;
		}

		// Handle gas estimation errors
		if (error instanceof EstimateGasExecutionError) {
			const cause = error.cause;
			if (cause instanceof ContractFunctionRevertedError) {
				if (cause.reason) {
					return `Gas estimation failed: ${cause.reason}`;
				}
			}

			// Check for RPC errors in gas estimation
			const gasRpcError = extractRpcErrorDetails(cause);
			if (gasRpcError) {
				return `Gas estimation failed: ${gasRpcError}`;
			}

			return error.shortMessage || 'Gas estimation failed';
		}

		// Generic viem error - still check for RPC details
		return error.shortMessage || error.message;
	}

	// Handle standard errors
	if (error instanceof Error) {
		// Check for RPC errors in standard errors
		const stdRpcError = extractRpcErrorDetails(error);
		if (stdRpcError) {
			return stdRpcError;
		}

		return error.message;
	}

	// Unknown error type - still try to extract RPC details
	const unknownRpcError = extractRpcErrorDetails(error);
	if (unknownRpcError) {
		return unknownRpcError;
	}

	return String(error);
}

/**
 * Extract revert reason from error
 */
export function extractRevertReason(error: unknown): string | undefined {
	if (error instanceof ContractFunctionExecutionError) {
		const cause = error.cause;
		if (cause instanceof ContractFunctionRevertedError) {
			return cause.reason || cause.data?.errorName;
		}
	}
	return undefined;
}

/**
 * Check if error is a user rejection
 */
export function isUserRejection(error: unknown): boolean {
	if (error instanceof BaseError) {
		return error.message.includes('User rejected') || error.message.includes('user rejected');
	}
	return false;
}

/**
 * Check if error is insufficient funds
 */
export function isInsufficientFunds(error: unknown): boolean {
	if (error instanceof BaseError) {
		return (
			error.message.includes('insufficient funds') ||
			error.message.includes('insufficient balance')
		);
	}
	return false;
}

/**
 * Check if error is nonce related
 */
export function isNonceError(error: unknown): boolean {
	if (error instanceof BaseError) {
		return (
			error.message.includes('nonce') ||
			error.message.includes('transaction count')
		);
	}
	return false;
}

/**
 * Format error for n8n output
 */
export function formatErrorOutput(error: unknown): {
	error: string;
	errorType: string;
	revertReason?: string;
	details?: string;
} {
	const errorMessage = parseViemError(error);
	const revertReason = extractRevertReason(error);

	let errorType = 'UnknownError';
	if (error instanceof ContractFunctionExecutionError) {
		errorType = 'ContractExecutionError';
	} else if (error instanceof TransactionExecutionError) {
		errorType = 'TransactionError';
	} else if (error instanceof EstimateGasExecutionError) {
		errorType = 'GasEstimationError';
	} else if (isUserRejection(error)) {
		errorType = 'UserRejection';
	} else if (isInsufficientFunds(error)) {
		errorType = 'InsufficientFunds';
	} else if (isNonceError(error)) {
		errorType = 'NonceError';
	}

	return {
		error: errorMessage,
		errorType,
		revertReason,
		details: error instanceof Error ? error.stack : undefined,
	};
}
