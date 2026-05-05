import { z } from "zod";

const envSchema = z.object({
	VITE_API_URL: z.string().url().default("http://localhost:3000/api"),
	VITE_APP_NAME: z.string().default("React Enterprise Boilerplate"),
	VITE_ENABLE_MOCK_API: z
		.string()
		.transform((val) => val === "true")
		.default("false"),
	VITE_SENTRY_DSN: z.string().url().optional(),
	VITE_APP_VERSION: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
