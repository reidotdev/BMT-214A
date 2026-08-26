"use client";

import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  composeRenderProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground data-[hovered]:bg-primary/90 data-[pressed]:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80 data-[pressed]:bg-secondary/70",
  outline:
    "border border-input bg-transparent data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
  ghost:
    "bg-transparent data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90 data-[pressed]:bg-destructive/80",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  icon: "size-10",
};

export interface ButtonProps extends AriaButtonProps {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={composeRenderProps(className, (cls) =>
        cn(
          "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-colors",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          focusRing,
          variants[variant],
          sizes[size],
          cls,
        ),
      )}
    />
  );
}
