export interface User {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	createdAt: string;
}

export interface CreateUserDTO {
	name: string;
	email: string;
	role: "admin" | "user";
}

export interface UpdateUserDTO extends CreateUserDTO {
	id: string;
}
