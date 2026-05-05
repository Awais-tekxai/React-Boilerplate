import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserList } from "./UserList";

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

describe("UserList Component", () => {
	it("renders loading skeletons initially", () => {
		const queryClient = createTestQueryClient();
		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<UserList />
			</QueryClientProvider>,
		);

		// Skeleton elements are present
		expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
			0,
		);
	});

	it("renders users from MSW mock", async () => {
		const queryClient = createTestQueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<UserList />
			</QueryClientProvider>,
		);

		// Wait for the mock data to be loaded and rendered
		await waitFor(() => {
			expect(screen.getByText("Admin")).toBeInTheDocument();
			expect(screen.getByText("admin@example.com")).toBeInTheDocument();
			expect(screen.getByText("Test User")).toBeInTheDocument();
		});
	});

	it("filters users with debounced search", async () => {
		const queryClient = createTestQueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<UserList />
			</QueryClientProvider>,
		);

		const searchInput = await screen.findByPlaceholderText(
			"Search users by name or email...",
		);
		fireEvent.change(searchInput, { target: { value: "admin" } });

		await waitFor(() => {
			expect(screen.getByText("Admin")).toBeInTheDocument();
			expect(screen.queryByText("Test User")).not.toBeInTheDocument();
		});
	});
});
