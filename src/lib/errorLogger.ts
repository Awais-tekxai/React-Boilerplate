/**
 * Error Logging and Middleware Utilities
 * Centralized error tracking, logging, and recovery strategies
 */

import * as Sentry from "@sentry/react";

export enum ErrorSeverity {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
}

export interface LoggedError {
	message: string;
	severity: ErrorSeverity;
	timestamp: Date;
	context?: Record<string, unknown>;
	stack?: string;
	userId?: string;
	requestId?: string;
}

/**
 * Error Logger - Centralized error tracking and reporting
 * Can be extended to send errors to external service (e.g., Sentry)
 */
class ErrorLogger {
	private errors: LoggedError[] = [];
	private maxErrors = 100;

	/**
	 * Log an error with severity level and context
	 * @param message - Error message
	 * @param severity - Error severity level
	 * @param context - Additional context data
	 * @param error - Original error object
	 */
	log(
		message: string,
		severity: ErrorSeverity = ErrorSeverity.MEDIUM,
		context?: Record<string, unknown>,
		error?: Error,
	) {
		const loggedError: LoggedError = {
			message,
			severity,
			timestamp: new Date(),
			context,
			stack: error?.stack,
		};

		this.errors.push(loggedError);

		// Keep only recent errors to avoid memory leaks
		if (this.errors.length > this.maxErrors) {
			this.errors = this.errors.slice(-this.maxErrors);
		}

		// Log to console in development
		if (import.meta.env.DEV) {
			console.group(`[${severity.toUpperCase()}] ${message}`);
			if (context) console.table(context);
			if (error) console.error(error);
			console.groupEnd();
		}

		// Could send to external service here
		this.sendToService(loggedError);
	}

	/**
	 * Send error to external service (e.g., Sentry, LogRocket)
	 * @param error - Logged error object
	 */
	private sendToService(error: LoggedError) {
		Sentry.withScope((scope) => {
			scope.setLevel(
				error.severity === ErrorSeverity.CRITICAL
					? "fatal"
					: error.severity === ErrorSeverity.HIGH
						? "error"
						: error.severity === ErrorSeverity.MEDIUM
							? "warning"
							: "info",
			);
			if (error.context) {
				scope.setContext("error-context", error.context);
			}
			Sentry.captureException(new Error(error.message));
		});
	}

	/**
	 * Get all logged errors
	 */
	getErrors(): LoggedError[] {
		return this.errors;
	}

	/**
	 * Clear error history
	 */
	clear() {
		this.errors = [];
	}
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

/**
 * API Error Handler - Standardized API error handling
 * Categorizes errors and suggests appropriate recovery strategies
 */
export class APIError extends Error {
	public statusCode: number;
	public isRetryable: boolean;
	public retryAfter?: number;

	constructor(
		message: string,
		statusCode: number = 500,
		isRetryable: boolean = false,
		retryAfter?: number,
	) {
		super(message);
		this.name = "APIError";
		this.statusCode = statusCode;
		this.isRetryable = isRetryable;
		this.retryAfter = retryAfter;
	}

	/**
	 * Determine if error is retryable based on status code
	 */
	static isRetryable(statusCode: number): boolean {
		// Retry on 5xx errors and specific 4xx errors
		return (
			statusCode >= 500 ||
			statusCode === 408 || // Request Timeout
			statusCode === 429 // Too Many Requests
		);
	}

	/**
	 * Get human-readable error message
	 */
	getReadableMessage(): string {
		const messages: Record<number, string> = {
			400: "Invalid request. Please check your input.",
			401: "Unauthorized. Please log in again.",
			403: "You don't have permission to perform this action.",
			404: "Resource not found.",
			408: "Request timed out. Please try again.",
			429: "Too many requests. Please wait a moment.",
			500: "Server error. Please try again later.",
			503: "Service unavailable. Please try again later.",
		};

		return messages[this.statusCode] || this.message;
	}
}

/**
 * Retry Strategy - Implement exponential backoff with jitter
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Function that executes with retry logic
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000,
): Promise<T> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Check if error is retryable
			if (error instanceof APIError && !error.isRetryable) {
				throw error;
			}

			// Don't retry on last attempt
			if (attempt === maxRetries) {
				break;
			}

			// Exponential backoff with jitter
			const delay = baseDelay * 2 ** attempt + Math.random() * 1000;
			await new Promise((resolve) => setTimeout(resolve, delay));

			errorLogger.log(
				`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
				ErrorSeverity.LOW,
			);
		}
	}

	throw lastError || new Error("Operation failed after retries");
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandlers() {
	// Handle uncaught promise rejections
	window.addEventListener("unhandledrejection", (event) => {
		errorLogger.log(
			"Unhandled Promise Rejection",
			ErrorSeverity.HIGH,
			{ reason: event.reason },
			event.reason instanceof Error ? event.reason : undefined,
		);
	});

	// Handle global errors
	window.addEventListener("error", (event) => {
		errorLogger.log(
			event.message,
			ErrorSeverity.HIGH,
			{ filename: event.filename, lineno: event.lineno },
			event.error,
		);
	});
}
