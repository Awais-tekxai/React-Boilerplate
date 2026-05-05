import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks";
import { useDeleteUser, useUsers } from "../queries";
import type { User } from "../types";

/**
 * RoleCell component - Render user role with styling
 * Extracted to prevent unnecessary re-renders
 */
const RoleCell = ({ role }: { role: string }) => (
	<span
		className={`px-2 py-1 rounded-full text-xs font-medium ${
			role === "admin"
				? "bg-primary/20 text-primary"
				: "bg-secondary text-secondary-foreground"
		}`}
	>
		{role}
	</span>
);

/**
 * UserList component - Display paginated users table with optimizations
 *
 * Performance optimizations:
 * - useMemo for columns to prevent recreation on each render
 * - Skeleton loading state
 * - Proper error handling with retry option
 * - Responsive layout
 *
 * @returns {JSX.Element} User list table component
 */
export function UserList() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const deleteUserMutation = useDeleteUser();
	const { data, isLoading, isFetching, error, refetch } = useUsers({
		search: debouncedSearch,
	});

	/**
	 * Memoize columns to prevent DataTable re-renders
	 * Only recreates when dependencies change
	 */
	const userColumns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				size: 200,
			},
			{
				accessorKey: "email",
				header: "Email",
				size: 250,
			},
			{
				accessorKey: "role",
				header: "Role",
				size: 120,
				cell: ({ row }) => {
					const role = row.getValue("role") as string;
					return <RoleCell role={role} />;
				},
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					const user = row.original;
					return (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => {
								deleteUserMutation.mutate(user.id, {
									onSuccess: () => {
										toast.success("User deleted successfully");
									},
									onError: () => {
										toast.error("Failed to delete user");
									},
								});
							}}
							disabled={deleteUserMutation.isPending}
							className="gap-2 text-destructive hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					);
				},
			},
		],
		[deleteUserMutation],
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-9 w-full max-w-sm" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	// Error state with retry button
	if (error) {
		return (
			<div className="space-y-4">
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search users by name or email..."
					aria-label="Search users"
					className="max-w-sm"
				/>
				<div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<p className="text-sm font-medium text-destructive">
							Failed to load users
						</p>
					</div>
					<p className="text-xs text-muted-foreground">
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="w-fit gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Retry
					</Button>
				</div>
			</div>
		);
	}

	// Success state
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search users by name or email..."
					aria-label="Search users"
					className="max-w-sm"
				/>
				{isFetching ? (
					<span className="text-xs text-muted-foreground">
						Updating results...
					</span>
				) : null}
			</div>
			<DataTable columns={userColumns} data={data || []} />
		</div>
	);
}
