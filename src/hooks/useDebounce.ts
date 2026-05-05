import * as React from "react";
import { useEffect, useState } from "react";

/**
 * useDebounce hook - Delay value updates to optimize performance
 * Useful for search inputs, window resize handlers, etc.
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * // Use debouncedSearch for API calls
 */
export function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}

/**
 * useThrottle hook - Limit function calls to max once per interval
 *
 * @param value - Value to throttle
 * @param interval - Interval in milliseconds
 *
 * @example
 * const throttledScroll = useThrottle(scrollPosition, 100);
 */
export function useThrottle<T>(value: T, interval: number) {
	const [throttledValue, setThrottledValue] = useState<T>(value);
	const lastUpdated = React.useRef(Date.now());

	useEffect(() => {
		const now = Date.now();
		if (now >= (lastUpdated.current ?? 0) + interval) {
			lastUpdated.current = now;
			setThrottledValue(value);
		} else {
			const handler = setTimeout(() => {
				lastUpdated.current = Date.now();
				setThrottledValue(value);
			}, interval);

			return () => clearTimeout(handler);
		}
	}, [value, interval]);

	return throttledValue;
}

/**
 * usePrevious hook - Access previous value in render
 *
 * @param value - Current value
 *
 * @example
 * const prevValue = usePrevious(value);
 */
export function usePrevious<T>(value: T): T | undefined {
	const ref = React.useRef<T | undefined>(undefined);

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}
