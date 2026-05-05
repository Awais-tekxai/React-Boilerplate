import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initSentry } from "@/lib/sentry";
import { AppProvider } from "@/providers/app";
import "./index.css";

const rootElement = document.getElementById("root");
initSentry();

if (rootElement && !rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<AppProvider />
		</StrictMode>,
	);
}
