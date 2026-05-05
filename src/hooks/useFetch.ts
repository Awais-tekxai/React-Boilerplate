import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/api/client";

interface UseFetchOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: Record<string, string>;
	body?: unknown;
	immediate?: boolean;
}

/**
 * useFetch hook - Simplified data fetching with apiClient
 * Automatically handles loading, error, and data states
 *
 * @param url - Endpoint URL
 * @param options - Fetch configuration
 *
 * @example
 * const { data, loading, error, refetch } = useFetch('/api/users');
 */
export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
	const { method = "GET", headers, body, immediate = true } = options;

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(immediate);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await apiClient({
				url,
				method,
				headers,
				data: body,
			});
			setData(response.data);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [url, method, headers, body]);

	useEffect(() => {
		if (immediate) {
			refetch();
		}
	}, [immediate, refetch]);

	return { data, loading, error, refetch };
}
