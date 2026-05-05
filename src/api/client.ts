import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { APIError, ErrorSeverity, errorLogger } from "@/lib/errorLogger";

/**
 * API Client instance with automatic token refresh and error handling
 * Configures base URL and default headers for all requests
 */
export const apiClient = axios.create({
	baseURL: env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token refresh queue management
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

/**
 * Process queued requests after token refresh
 * @param error - Error that occurred during refresh
 * @param token - New access token if successful
 */
const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else if (token) {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

/**
 * Refresh access token using refresh token
 * @returns New access token
 */
const refreshAccessToken = async (): Promise<string> => {
	try {
		const refreshToken = localStorage.getItem("refresh_token");
		if (!refreshToken) throw new Error("No refresh token available");

		const response = await axios.post(`${env.VITE_API_URL}/auth/refresh`, {
			token: refreshToken,
		});

		const { accessToken } = response.data;
		localStorage.setItem("access_token", accessToken);

		return accessToken;
	} catch (error) {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		window.location.href = "/login";
		throw error;
	}
};

/**
 * Request interceptor - Attach access token to outgoing requests
 */
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

/**
 * Response interceptor - Handle token refresh and global errors
 * Automatically retries failed requests with new token
 */
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as RetryableRequestConfig | undefined;
		const requestUrl = originalRequest?.url as string | undefined;
		const isRefreshRequest = requestUrl?.includes("/auth/refresh");

		// Handle 401 Unauthorized - attempt token refresh
		if (
			error.response?.status === 401 &&
			!originalRequest?._retry &&
			!isRefreshRequest
		) {
			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers = originalRequest.headers || {};
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return apiClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			if (!originalRequest) {
				return Promise.reject(error);
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const newToken = await refreshAccessToken();
				apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
				processQueue(null, newToken);

				originalRequest.headers = originalRequest.headers || {};
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		const statusCode = error.response?.status ?? 500;
		const apiError = new APIError(
			error.message || "Request failed",
			statusCode,
			APIError.isRetryable(statusCode),
			typeof error.response?.headers?.["retry-after"] === "string"
				? Number(error.response.headers["retry-after"])
				: undefined,
		);

		errorLogger.log(
			`API request failed: ${requestUrl || "unknown url"}`,
			statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
			{
				method: originalRequest?.method,
				statusCode,
				url: requestUrl,
			},
			error instanceof Error ? error : undefined,
		);

		return Promise.reject(apiError);
	},
);
