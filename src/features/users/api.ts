import { apiClient } from "@/api/client";
import type { CreateUserDTO, UpdateUserDTO, User } from "./types";

interface GetUsersParams {
	search?: string;
	signal?: AbortSignal;
}

export const getUsers = async (
	params: GetUsersParams = {},
): Promise<User[]> => {
	const { search, signal } = params;
	const normalizedSearch = search?.trim();

	// Request supports AbortSignal to cancel stale in-flight queries.
	const { data } = await apiClient.get("/users", {
		signal,
		params: normalizedSearch ? { search: normalizedSearch } : undefined,
	});
	return data;
};

export const createUser = async (user: CreateUserDTO): Promise<User> => {
	const { data } = await apiClient.post("/users", user);
	return data;
};

export const updateUser = async (user: UpdateUserDTO): Promise<User> => {
	const { id, ...payload } = user;
	const { data } = await apiClient.patch(`/users/${id}`, payload);
	return data;
};

export const deleteUser = async (id: string): Promise<{ id: string }> => {
	await apiClient.delete(`/users/${id}`);
	return { id };
};
