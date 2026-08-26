"use client";

import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
  composeRenderProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

type Variant = "default" | "muted" | "button";

const variants: Record<Variant, string> = {
  default:
    "text-primary underline-offset-4 data-[hovered]:underline rounded-xs",
  muted:
    "text-muted-foreground underline-offset-4 data-[hovered]:text-foreground data-[hovered]:underline rounded-xs",
  button:
    "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground data-[hovered]:bg-primary/90",
};

export interface LinkProps extends AriaLinkProps {
  variant?: Variant;
}

export function Link({ variant = "default", className, ...props }: LinkProps) {
  return (
    <AriaLink
      {...props}
      className={composeRenderProps(className, (cls) =>
        cn(
          "cursor-pointer transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          focusRing,
          variants[variant],
          cls,
        ),
      )}
    />
  );
}
