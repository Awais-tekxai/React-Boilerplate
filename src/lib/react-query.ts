import { type DefaultOptions, QueryClient } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
	queries: {
		refetchOnWindowFocus: false,
		retry: 1, // Will retry once on failure
		staleTime: 1000 * 60 * 5, // 5 minutes
	},
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
