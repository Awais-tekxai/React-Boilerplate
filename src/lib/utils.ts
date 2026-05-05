import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with support for conditional classes and conflict resolution
 * Combines clsx for conditional classes with tailwind-merge to resolve conflicting utilities
 *
 * @param inputs - Array of class values (strings, objects, arrays, or undefined)
 * @returns Merged className string without conflicting Tailwind utilities
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-blue-500", "px-4") // => "py-1 bg-blue-500 px-4"
 * cn(["text-lg", { "font-bold": isBold }]) // => "text-lg" or "text-lg font-bold"
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
