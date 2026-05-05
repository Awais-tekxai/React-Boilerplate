import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/__mocks__/server";
import { env } from "@/config/env";
import { queryKeys } from "@/lib/query-keys";
import { useDeleteUser, useUpdateUser } from "./queries";
import type { User } from "./types";

const seedUsers: User[] = [
	{
		id: "1",
		name: "Admin",
		email: "admin@example.com",
		role: "admin",
		createdAt: new Date().toISOString(),
	},
	{
		id: "2",
		name: "Test User",
		email: "user@example.com",
		role: "user",
		createdAt: new Date().toISOString(),
	},
];

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

describe("user optimistic mutation rollbacks", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = createTestQueryClient();
		queryClient.setQueryData(queryKeys.users.list({ search: "" }), seedUsers);
	});

	it("rolls back delete mutation on API failure", async () => {
		server.use(
			http.delete(`${env.VITE_API_URL}/users/:id`, () =>
				HttpResponse.json({ message: "Delete failed" }, { status: 500 }),
			),
		);

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useDeleteUser(), { wrapper });

		await result.current.mutateAsync("1").catch(() => null);

		await waitFor(() => {
			expect(
				queryClient.getQueryData(queryKeys.users.list({ search: "" })),
			).toEqual(seedUsers);
		});
	});

	it("rolls back update mutation on API failure", async () => {
		server.use(
			http.patch(`${env.VITE_API_URL}/users/:id`, () =>
				HttpResponse.json({ message: "Update failed" }, { status: 500 }),
			),
		);

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useUpdateUser(), { wrapper });

		await result.current
			.mutateAsync({
				id: "1",
				name: "Updated Name",
				email: "updated@example.com",
				role: "user",
			})
			.catch(() => null);

		await waitFor(() => {
			expect(
				queryClient.getQueryData(queryKeys.users.list({ search: "" })),
			).toEqual(seedUsers);
		});
	});
});
