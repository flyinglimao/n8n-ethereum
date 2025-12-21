import {
	BaseError,
	ContractFunctionExecutionError,
	ContractFunctionRevertedError,
	TransactionExecutionError,
	EstimateGasExecutionError,
} from 'viem';

/**
 * Parse and format viem errors for user-friendly display
 */
export function parseViemError(error: unknown): string {
	if (error instanceof BaseError) {
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

			return error.shortMessage || error.message;
		}

		// Handle transaction execution errors
		if (error instanceof TransactionExecutionError) {
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
			return error.shortMessage || 'Gas estimation failed';
		}

		// Generic viem error
		return error.shortMessage || error.message;
	}

	// Handle standard errors
	if (error instanceof Error) {
		return error.message;
	}

	// Unknown error type
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
