import { AlertCircle, RotateCcw } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary component - Catches React component errors
 * Displays error UI and provides recovery option
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	/**
	 * Update state to trigger fallback UI
	 */
	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	/**
	 * Log error details for debugging
	 */
	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error);
		console.error("Error info:", errorInfo);
		// Could send to error tracking service here
	}

	/**
	 * Reset error state to recover
	 */
	resetError = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			return this.props.fallback ? (
				this.props.fallback(this.state.error, this.resetError)
			) : (
				<div className="flex flex-col items-center justify-center min-h-screen bg-background">
					<div className="w-full max-w-md space-y-6 rounded-lg border border-destructive/20 bg-destructive/5 p-8">
						<div className="flex items-center gap-3">
							<AlertCircle className="h-6 w-6 text-destructive" />
							<h1 className="text-2xl font-bold">Something went wrong</h1>
						</div>

						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								An unexpected error occurred. Please try again.
							</p>
							<details className="cursor-pointer">
								<summary className="text-xs font-medium text-destructive hover:underline">
									Error details
								</summary>
								<pre className="mt-2 overflow-auto rounded bg-background p-3 text-xs">
									{this.state.error.message}
								</pre>
							</details>
						</div>

						<Button
							onClick={this.resetError}
							className="w-full gap-2"
							size="sm"
						>
							<RotateCcw className="h-4 w-4" />
							Try again
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
