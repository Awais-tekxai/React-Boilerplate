import * as Sentry from "@sentry/react";
import { env } from "@/config/env";

let isSentryInitialized = false;

export function initSentry() {
	if (isSentryInitialized || !env.VITE_SENTRY_DSN) return;

	Sentry.init({
		dsn: env.VITE_SENTRY_DSN,
		environment: import.meta.env.MODE,
		release: import.meta.env.VITE_APP_VERSION,
		tracesSampleRate: 0.1,
	});

	isSentryInitialized = true;
}
