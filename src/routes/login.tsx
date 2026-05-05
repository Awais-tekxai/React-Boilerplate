import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		// Mock login
		setAuth(
			{
				id: "1",
				name: "Admin User",
				email: "admin@example.com",
				role: "admin",
			},
			"mock_jwt_token_12345",
		);
		navigate({ to: "/" });
	};

	return (
		<div className="flex h-screen w-full items-center justify-center bg-muted/20">
			<Card className="w-[400px]">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl">Sign in</CardTitle>
					<CardDescription>
						Enter your email and password to access the admin dashboard
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@example.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" required />
						</div>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
