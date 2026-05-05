import { HttpResponse, http } from "msw";
import { env } from "@/config/env";
import type { CreateUserDTO, User } from "@/features/users/types";

const initialUsers: User[] = [
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

let usersDb: User[] = [...initialUsers];

export function resetMockUsersDb() {
	usersDb = [...initialUsers];
}

export const handlers = [
	http.get(`${env.VITE_API_URL}/users`, ({ request }) => {
		const search = new URL(request.url).searchParams
			.get("search")
			?.toLowerCase()
			.trim();
		if (!search) return HttpResponse.json(usersDb);

		return HttpResponse.json(
			usersDb.filter(
				(user) =>
					user.name.toLowerCase().includes(search) ||
					user.email.toLowerCase().includes(search),
			),
		);
	}),

	http.post(`${env.VITE_API_URL}/users`, async ({ request }) => {
		const data = (await request.json()) as CreateUserDTO;
		const createdUser: User = {
			id: Math.random().toString(36).substr(2, 9),
			...data,
			createdAt: new Date().toISOString(),
		};
		usersDb.push(createdUser);
		return HttpResponse.json(createdUser);
	}),

	http.patch(`${env.VITE_API_URL}/users/:id`, async ({ params, request }) => {
		const payload = (await request.json()) as Partial<CreateUserDTO>;
		const id = params.id as string;

		usersDb = usersDb.map((user) =>
			user.id === id
				? {
						...user,
						...payload,
					}
				: user,
		);

		const updatedUser = usersDb.find((user) => user.id === id);
		if (!updatedUser) {
			return HttpResponse.json({ message: "User not found" }, { status: 404 });
		}

		return HttpResponse.json(updatedUser);
	}),

	http.delete(`${env.VITE_API_URL}/users/:id`, ({ params }) => {
		const id = params.id as string;
		usersDb = usersDb.filter((user) => user.id !== id);
		return new HttpResponse(null, { status: 204 });
	}),
];
