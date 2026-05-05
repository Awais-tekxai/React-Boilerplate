import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Compound Component Pattern - Flexible, composable Card component
 * Each sub-component manages its own rendering while sharing parent context
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>User Profile</CardTitle>
 *     <CardDescription>Manage your account settings</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Your content here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Save</Button>
 *   </CardFooter>
 * </Card>
 */

const cardVariants = cva("rounded-lg border transition-colors", {
	variants: {
		variant: {
			default: "border-border bg-card text-card-foreground shadow-sm",
			elevated:
				"border-border bg-card text-card-foreground shadow-md hover:shadow-lg",
			outline: "border-2 border-border bg-transparent",
			ghost: "border-0 bg-transparent",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {}

/**
 * Card root component - Container for card content
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(cardVariants({ variant }), className)}
			{...props}
		/>
	),
);
Card.displayName = "Card";

/**
 * CardHeader - Top section of card
 */
const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 border-b p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Primary heading in card header
 */
const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn("font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription - Secondary text in card header
 */
const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent - Main content area of card
 */
const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter - Bottom section of card
 */
const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center border-t p-6", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
