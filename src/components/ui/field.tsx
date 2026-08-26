"use client";

import {
  Label as AriaLabel,
  type LabelProps,
  Text,
  type TextProps,
  FieldError as AriaFieldError,
  type FieldErrorProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelProps) {
  return (
    <AriaLabel
      {...props}
      className={cn(
        "text-sm font-medium text-foreground data-[disabled]:opacity-50",
        className,
      )}
    />
  );
}

export function Description({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={cn("text-sm text-muted-foreground", className)}
    />
  );
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError
      {...props}
      className={cn("text-sm text-destructive", className)}
    />
  );
}
