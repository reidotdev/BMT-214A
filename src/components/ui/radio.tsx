"use client";

import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  Radio as AriaRadio,
  type RadioProps as AriaRadioProps,
  type ValidationResult,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { Description, FieldError, Label } from "./field";

export interface RadioGroupProps extends AriaRadioGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode;
}

export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  className,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className={cn("flex flex-col gap-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-col gap-2">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export function Radio({ children, className, ...props }: AriaRadioProps) {
  return (
    <AriaRadio
      {...props}
      className={cn(
        "group flex cursor-pointer items-center gap-2 text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border border-input transition-colors",
          "group-data-[hovered]:border-ring/60",
          "group-data-[selected]:border-primary",
          "group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2 group-data-[focus-visible]:outline-ring",
        )}
      >
        <span className="size-2.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[selected]:opacity-100" />
      </span>
      {children as React.ReactNode}
    </AriaRadio>
  );
}
