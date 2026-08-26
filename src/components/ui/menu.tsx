"use client";

import {
  MenuTrigger,
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
  MenuItem as AriaMenuItem,
  type MenuItemProps,
  Popover,
  type PopoverProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export { MenuTrigger };

export interface MenuProps<T extends object> extends AriaMenuProps<T> {
  popoverProps?: Omit<PopoverProps, "children">;
}

export function Menu<T extends object>({
  className,
  popoverProps,
  ...props
}: MenuProps<T>) {
  return (
    <Popover
      {...popoverProps}
      className={cn(
        "min-w-[10rem] origin-top rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg",
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
      )}
    >
      <AriaMenu {...props} className={cn("outline-hidden", className)} />
    </Popover>
  );
}

export function MenuItem({ className, ...props }: MenuItemProps) {
  return (
    <AriaMenuItem
      {...props}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden",
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    />
  );
}
