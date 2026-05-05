import * as React from "react";
import { createPortal } from "react-dom";

interface PortalProps {
	children: React.ReactNode;
	containerId?: string;
}

/**
 * Portal utility component for rendering outside normal DOM hierarchy.
 * Useful for overlays, toasts, and global modals.
 */
export function Portal({ children, containerId = "portal-root" }: PortalProps) {
	const [container, setContainer] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		let element = document.getElementById(containerId);
		let isOwnedByPortal = false;

		if (!element) {
			element = document.createElement("div");
			element.id = containerId;
			document.body.appendChild(element);
			isOwnedByPortal = true;
		}

		setContainer(element);

		return () => {
			if (isOwnedByPortal && element?.parentNode) {
				element.parentNode.removeChild(element);
			}
		};
	}, [containerId]);

	if (!container) return null;
	return createPortal(children, container);
}
