import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/__mocks__/server";
import { env } from "@/config/env";
import { apiClient } from "./client";

describe("apiClient token refresh flow", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("retries a failed request after successful token refresh", async () => {
		let protectedCalls = 0;

		server.use(
			http.get(`${env.VITE_API_URL}/protected`, ({ request }) => {
				protectedCalls += 1;
				const authHeader = request.headers.get("authorization");

				if (authHeader === "Bearer new-token") {
					return HttpResponse.json({ ok: true });
				}

				return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
			}),
			http.post(`${env.VITE_API_URL}/auth/refresh`, () => {
				return HttpResponse.json({ accessToken: "new-token" });
			}),
		);

		localStorage.setItem("access_token", "expired-token");
		localStorage.setItem("refresh_token", "valid-refresh-token");

		const response = await apiClient.get("/protected");

		expect(response.data).toEqual({ ok: true });
		expect(localStorage.getItem("access_token")).toBe("new-token");
		expect(protectedCalls).toBe(2);
	});

	it("queues concurrent 401 requests and refreshes once", async () => {
		let refreshCalls = 0;

		server.use(
			http.get(`${env.VITE_API_URL}/protected`, ({ request }) => {
				const authHeader = request.headers.get("authorization");
				if (authHeader === "Bearer new-token") {
					return HttpResponse.json({ ok: true });
				}
				return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
			}),
			http.post(`${env.VITE_API_URL}/auth/refresh`, async () => {
				refreshCalls += 1;
				return HttpResponse.json({ accessToken: "new-token" });
			}),
		);

		localStorage.setItem("access_token", "expired-token");
		localStorage.setItem("refresh_token", "valid-refresh-token");

		const [first, second] = await Promise.all([
			apiClient.get("/protected"),
			apiClient.get("/protected"),
		]);

		expect(first.data).toEqual({ ok: true });
		expect(second.data).toEqual({ ok: true });
		expect(refreshCalls).toBe(1);
	});
});
