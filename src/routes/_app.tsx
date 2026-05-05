import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/AppLayout";

export const Route = createFileRoute("/_app")({
	beforeLoad: () => {
		// Basic auth guard
		const token = localStorage.getItem("access_token");
		if (!token) {
			throw redirect({
				to: "/login",
			});
		}
	},
	component: AppLayout,
});
