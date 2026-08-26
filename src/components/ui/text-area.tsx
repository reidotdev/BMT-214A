"use client";

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  TextArea as AriaTextArea,
  type ValidationResult,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";
import { Description, FieldError, Label } from "./field";

export interface TextAreaProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextArea({
  label,
  description,
  placeholder,
  rows = 4,
  errorMessage,
  className,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {label && <Label>{label}</Label>}
      <AriaTextArea
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm",
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
