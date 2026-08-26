"use client";

import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ValidationResult,
} from "react-aria-components";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";
import { Description, FieldError, Label } from "./field";

export interface SelectProps<T extends object> extends Omit<
  AriaSelectProps<T>,
  "children"
> {
  label?: string;
  description?: string;
  placeholder?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  label,
  description,
  placeholder = "Select an option",
  errorMessage,
  children,
  items,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect {...props} className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label>{label}</Label>}
      <Button
        className={cn(
          "flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm",
          "data-[hovered]:border-ring/60",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          focusRing,
        )}
      >
        <SelectValue className="data-[placeholder]:text-muted-foreground">
          {({ isPlaceholder, selectedText }) =>
            isPlaceholder ? placeholder : selectedText
          }
        </SelectValue>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-(--trigger-width) origin-top rounded-lg border border-border bg-card p-1 shadow-lg data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0">
        <ListBox items={items} className="outline-hidden">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem({ children, ...props }: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden",
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      )}
    >
      <span className="truncate">{children as React.ReactNode}</span>
      <Check
        className="size-4 opacity-0 group-data-[selected]:opacity-100"
        aria-hidden
      />
    </ListBoxItem>
  );
}
