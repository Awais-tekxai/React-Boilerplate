import { useCallback, useEffect, useState } from "react";

/**
 * useAsync hook - Manage async operations with loading, error, and data states
 *
 * @param asyncFunction - Async function to execute
 * @param immediate - Whether to run immediately on mount (default: true)
 *
 * @example
 * const { data, loading, error } = useAsync(fetchUser, true);
 */
export function useAsync<T, E = string>(
	asyncFunction: () => Promise<T>,
	immediate = true,
) {
	const [status, setStatus] = useState<
		"idle" | "pending" | "success" | "error"
	>("idle");
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<E | null>(null);

	const execute = useCallback(async () => {
		setStatus("pending");
		setData(null);
		setError(null);

		try {
			const response = await asyncFunction();
			setData(response);
			setStatus("success");
			return response;
		} catch (err) {
			setError(err as E);
			setStatus("error");
		}
	}, [asyncFunction]);

	useEffect(() => {
		if (immediate) {
			execute();
		}
	}, [execute, immediate]);

	return { execute, status, data, error };
}
