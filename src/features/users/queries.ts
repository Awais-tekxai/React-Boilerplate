import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createUser, deleteUser, getUsers, updateUser } from "./api";
import type { CreateUserDTO, UpdateUserDTO, User } from "./types";

/**
 * Hook to fetch users list
 * Automatically handles caching, background refetch, and error states
 *
 * @returns Query result with users data, loading, and error states
 *
 * @example
 * const { data: users, isLoading, error } = useUsers();
 */
interface UseUsersOptions {
	search?: string;
}

export const useUsers = ({ search = "" }: UseUsersOptions = {}) => {
	const normalizedSearch = search.trim();

	return useQuery({
		queryKey: queryKeys.users.list({ search: normalizedSearch }),
		queryFn: ({ signal }) => getUsers({ search: normalizedSearch, signal }),
	});
};

/**
 * Hook to create a new user with optimistic update
 * Automatically invalidates and refetches users list on success
 *
 * @returns Mutation result with mutate function and status
 *
 * @example
 * const { mutate, isPending } = useCreateUser();
 * mutate({ name: 'John', email: 'john@example.com', role: 'user' });
 */
export const useCreateUser = () => {
	const queryClient = useQueryClient();

	const updateAllUserListCaches = (
		updater: (users: User[]) => User[],
	): Array<[readonly unknown[], User[] | undefined]> => {
		const snapshots = queryClient.getQueriesData<User[]>({
			queryKey: queryKeys.users.lists(),
		});

		queryClient.setQueriesData<User[]>(
			{ queryKey: queryKeys.users.lists() },
			(existing = []) => updater(existing),
		);

		return snapshots;
	};

	return useMutation({
		mutationFn: createUser,
		onMutate: async (newUser: CreateUserDTO) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });

			const optimisticUser: User = {
				id: `optimistic-${Date.now()}`,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				createdAt: new Date().toISOString(),
			};

			const snapshots = updateAllUserListCaches((existingUsers) => [
				...existingUsers,
				optimisticUser,
			]);

			return { snapshots };
		},
		onError: (error: Error, _newUser, context) => {
			// Roll back optimistic update when mutation fails.
			if (context?.snapshots) {
				context.snapshots.forEach(([key, data]) => {
					queryClient.setQueryData(key, data);
				});
			}
			console.error("Failed to create user:", error.message);
		},
		onSuccess: () => {
			// Invalidate and refetch users list
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateUser,
		onMutate: async (updatedUser: UpdateUserDTO) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });
			const snapshots = queryClient.getQueriesData<User[]>({
				queryKey: queryKeys.users.lists(),
			});

			queryClient.setQueriesData<User[]>(
				{ queryKey: queryKeys.users.lists() },
				(existing = []) =>
					existing.map((user) =>
						user.id === updatedUser.id
							? {
									...user,
									name: updatedUser.name,
									email: updatedUser.email,
									role: updatedUser.role,
								}
							: user,
					),
			);

			return { snapshots };
		},
		onError: (_error, _updatedUser, context) => {
			if (context?.snapshots) {
				context.snapshots.forEach(([key, data]) => {
					queryClient.setQueryData(key, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onMutate: async (id: string) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.users.lists() });
			const snapshots = queryClient.getQueriesData<User[]>({
				queryKey: queryKeys.users.lists(),
			});

			queryClient.setQueriesData<User[]>(
				{ queryKey: queryKeys.users.lists() },
				(existing = []) => existing.filter((user) => user.id !== id),
			);

			return { snapshots };
		},
		onError: (_error, _id, context) => {
			if (context?.snapshots) {
				context.snapshots.forEach(([key, data]) => {
					queryClient.setQueryData(key, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
		},
	});
};
