import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/features/users/components/UserForm";
import { UserList } from "@/features/users/components/UserList";
import { useCreateUser } from "@/features/users/queries";
import type { CreateUserDTO } from "@/features/users/types";

export const Route = createFileRoute("/_app/users")({
	component: UsersPage,
	pendingComponent: UsersPagePending,
});

function UsersPagePending() {
	return (
		<div className="space-y-6">
			<div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
			<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
			<div className="h-60 w-full animate-pulse rounded-md bg-muted" />
		</div>
	);
}

function UsersPage() {
	const [open, setOpen] = useState(false);
	const createUser = useCreateUser();

	const onSubmit = (data: CreateUserDTO) => {
		createUser.mutate(data, {
			onSuccess: () => {
				setOpen(false);
				toast.success("User created successfully");
			},
			onError: () => {
				toast.error("Failed to create user");
			},
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Users</h1>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" /> Add User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
						</DialogHeader>
						<UserForm onSubmit={onSubmit} isLoading={createUser.isPending} />
					</DialogContent>
				</Dialog>
			</div>
			<UserList />
		</div>
	);
}
