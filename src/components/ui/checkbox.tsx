"use client";

import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<AriaCheckboxProps, "children"> {
  children?: React.ReactNode;
}

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={cn(
        "group flex cursor-pointer items-center gap-2 text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
    >
      {({ isSelected, isIndeterminate }) => (
        <>
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-md border border-input text-primary-foreground transition-colors",
              "group-data-[hovered]:border-ring/60",
              "group-data-[selected]:border-primary group-data-[selected]:bg-primary",
              "group-data-[indeterminate]:border-primary group-data-[indeterminate]:bg-primary",
              "group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-ring",
            )}
          >
            {isIndeterminate ? (
              <Minus className="size-3.5" aria-hidden />
            ) : isSelected ? (
              <Check className="size-3.5" aria-hidden />
            ) : null}
          </span>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
