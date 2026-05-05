// Example Query Key Factory Pattern
// https://tkdodo.eu/blog/effective-react-query-keys

export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		user: () => [...queryKeys.auth.all, "user"] as const,
	},
	users: {
		all: ["users"] as const,
		lists: () => [...queryKeys.users.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.users.lists(), { filters }] as const,
		details: () => [...queryKeys.users.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.users.details(), id] as const,
	},
};
