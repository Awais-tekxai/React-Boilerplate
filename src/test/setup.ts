import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { resetMockUsersDb } from "../__mocks__/handlers";
import { server } from "../__mocks__/server";

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
	server.resetHandlers();
	resetMockUsersDb();
});
