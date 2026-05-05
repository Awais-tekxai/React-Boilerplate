import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, Settings, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function AppLayout() {
	const { logout, user } = useAuthStore();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	return (
		<div className="flex h-screen bg-background">
			<aside className="w-64 border-r bg-card flex flex-col">
				<div className="p-4 border-b">
					<h2 className="text-xl font-bold text-primary">SaaS Admin</h2>
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<Link
						to="/"
						className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent"
					>
						<Home className="h-4 w-4" />
						<span>Dashboard</span>
					</Link>
					<Link
						to="/users"
						className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent"
					>
						<Users className="h-4 w-4" />
						<span>Users</span>
					</Link>
				</nav>
				<div className="p-4 border-t">
					<div className="flex items-center justify-between mb-4">
						<span className="text-sm font-medium">
							{user?.name || "Admin User"}
						</span>
						<button type="button" className="p-2 hover:bg-accent rounded-full">
							<Settings className="h-4 w-4" />
						</button>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10"
					>
						<LogOut className="h-4 w-4" />
						<span>Logout</span>
					</button>
				</div>
			</aside>
			<main className="flex-1 overflow-auto bg-muted/20">
				<div className="p-8 max-w-7xl mx-auto">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
