import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — clsx for conditional logic, tailwind-merge to
 * dedupe conflicting utilities. Use this everywhere instead of raw template
 * strings so per-project overrides can always win.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
