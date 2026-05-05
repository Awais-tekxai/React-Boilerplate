import { createRootRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<React.Fragment>
			<Outlet />
			{/* Devtools can be added here */}
			{/* <TanStackRouterDevtools /> */}
		</React.Fragment>
	);
}
