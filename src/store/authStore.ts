import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
	id: string;
	email: string;
	name: string;
	role: "admin" | "user";
};

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	accessToken: string | null;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			accessToken: null,
			setAuth: (user, token) => {
				localStorage.setItem("access_token", token);
				set({ user, accessToken: token, isAuthenticated: true });
			},
			logout: () => {
				// Clear local storage token
				localStorage.removeItem("access_token");
				set({ user: null, accessToken: null, isAuthenticated: false });
			},
		}),
		{
			name: "auth-storage", // unique name
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
