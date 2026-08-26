"use client";

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";
import { Description, FieldError, Label } from "./field";

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextField({
  label,
  description,
  placeholder,
  errorMessage,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {label && <Label>{label}</Label>}
      <Input
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
          "placeholder:text-muted-foreground",
          "data-[hovered]:border-ring/60",
          "data-[invalid]:border-destructive",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          focusRing,
        )}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
