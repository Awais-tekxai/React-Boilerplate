import * as React from "react";

/**
 * Render Props Pattern - Flexible component that passes state to children function
 * Allows parent component to control rendering while children manage state
 *
 * @example
 * <ToggleRenderProps>
 *   {({ isOpen, toggle }) => (
 *     <>
 *       <button onClick={toggle}>Toggle</button>
 *       {isOpen && <div>Content</div>}
 *     </>
 *   )}
 * </ToggleRenderProps>
 */

interface ToggleRenderPropsProps {
	initialState?: boolean;
	children: (state: {
		isOpen: boolean;
		toggle: () => void;
		open: () => void;
		close: () => void;
	}) => React.ReactNode;
}

/**
 * ToggleRenderProps - Component using render props pattern for toggle state
 */
export function ToggleRenderProps({
	initialState = false,
	children,
}: ToggleRenderPropsProps) {
	const [isOpen, setIsOpen] = React.useState(initialState);

	const toggle = () => setIsOpen(!isOpen);
	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);

	return <>{children({ isOpen, toggle, open, close })}</>;
}

/**
 * AsyncRenderProps - Component using render props for async operations
 * Demonstrates advanced pattern for handling loading/error/success states
 *
 * @example
 * <AsyncRenderProps asyncFunction={fetchUsers}>
 *   {({ data, loading, error, refetch }) => (
 *     <>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       {data && <ul>{data.map(user => <li>{user.name}</li>)}</ul>}
 *       <button onClick={refetch}>Retry</button>
 *     </>
 *   )}
 * </AsyncRenderProps>
 */

interface AsyncRenderPropsProps<T> {
	asyncFunction: () => Promise<T>;
	children: (state: {
		data: T | null;
		loading: boolean;
		error: Error | null;
		refetch: () => Promise<void>;
	}) => React.ReactNode;
}

export function AsyncRenderProps<T>({
	asyncFunction,
	children,
}: AsyncRenderPropsProps<T>) {
	const [data, setData] = React.useState<T | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<Error | null>(null);

	const refetch = React.useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await asyncFunction();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setLoading(false);
		}
	}, [asyncFunction]);

	React.useEffect(() => {
		refetch();
	}, [refetch]);

	return <>{children({ data, loading, error, refetch })}</>;
}

/**
 * FormRenderProps - Component using render props for form state management
 * Decouples form logic from rendering
 *
 * @example
 * <FormRenderProps initialValues={{ email: '', password: '' }}>
 *   {({ values, errors, setValues, handleSubmit }) => (
 *     <form onSubmit={handleSubmit}>
 *       <input value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
 *       <button type="submit">Submit</button>
 *     </form>
 *   )}
 * </FormRenderProps>
 */

interface FormRenderPropsProps<T> {
	initialValues: T;
	onSubmit?: (values: T) => void | Promise<void>;
	children: (state: {
		values: T;
		setValues: (values: T) => void;
		reset: () => void;
		handleSubmit: (e: React.FormEvent) => Promise<void>;
		isSubmitting: boolean;
	}) => React.ReactNode;
}

export function FormRenderProps<T extends Record<string, unknown>>({
	initialValues,
	onSubmit,
	children,
}: FormRenderPropsProps<T>) {
	const [values, setValues] = React.useState(initialValues);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const reset = () => setValues(initialValues);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onSubmit?.(values);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{children({
				values,
				setValues,
				reset,
				handleSubmit,
				isSubmitting,
			})}
		</>
	);
}
