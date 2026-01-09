import {
	BaseError,
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	TransactionExecutionError,
	EstimateGasExecutionError,
	RpcError,
} from 'viem';

/**
 * Extract RPC error details from error chain
 */
function extractRpcErrorDetails(error: any): { message: string; details?: any } | null {
	// Check for RPC error in the error chain
	let currentError = error;
	while (currentError) {
		// Check if this is an RPC error
		if (currentError.name === 'RpcError' || currentError instanceof RpcError) {
			return {
				message: currentError.message || 'RPC Error',
				details: currentError.details || currentError.data,
			};
		}

		// Check for HTTP request error (common with RPC calls)
		if (currentError.name === 'HttpRequestError') {
			return {
				message: currentError.message || 'HTTP Request Error',
				details: currentError.details || currentError.data,
			};
		}

		// Check for error.cause chain
		currentError = currentError.cause;
	}

	return null;
}

/**
 * Format RPC error with request context
 */
function formatRpcError(rpcError: { message: string; details?: any }, context?: any): string {
	let errorMsg = `RPC Error: ${rpcError.message}`;

	// Add RPC error details if available
	if (rpcError.details) {
		errorMsg += `\n\nRPC Response: ${typeof rpcError.details === 'string' ? rpcError.details : JSON.stringify(rpcError.details, null, 2)}`;
	}

	// Add request context if available
	if (context) {
		errorMsg += `\n\nRequest Context: ${JSON.stringify(context, null, 2)}`;
	}

	return errorMsg;
}

/**
 * Parse and format viem errors for user-friendly display
 */
export function parseViemError(error: unknown, context?: any): string {
	if (error instanceof BaseError) {
		// First check for RPC errors in the error chain
		const rpcError = extractRpcErrorDetails(error);
		if (rpcError) {
			return formatRpcError(rpcError, context);
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
				return formatRpcError(contractRpcError, context);
			}

			return error.shortMessage || error.message;
		}

		// Handle transaction execution errors
		if (error instanceof TransactionExecutionError) {
			// Check for RPC errors in transaction
			const txRpcError = extractRpcErrorDetails(error.cause);
			if (txRpcError) {
				return formatRpcError(txRpcError, context);
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
				return formatRpcError(gasRpcError, context);
			}

			return error.shortMessage || 'Gas estimation failed';
		}

		// Generic viem error - still check for RPC details
		const genericRpcError = extractRpcErrorDetails(error);
		if (genericRpcError) {
			return formatRpcError(genericRpcError, context);
		}

		return error.shortMessage || error.message;
	}

	// Handle standard errors
	if (error instanceof Error) {
		// Check for RPC errors in standard errors
		const stdRpcError = extractRpcErrorDetails(error);
		if (stdRpcError) {
			return formatRpcError(stdRpcError, context);
		}

		return error.message;
	}

	// Unknown error type - still try to extract RPC details
	const unknownRpcError = extractRpcErrorDetails(error);
	if (unknownRpcError) {
		return formatRpcError(unknownRpcError, context);
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
