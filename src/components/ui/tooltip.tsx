"use client";

import {
  TooltipTrigger,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  OverlayArrow,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export { TooltipTrigger };

export interface TooltipProps extends Omit<AriaTooltipProps, "children"> {
  children: React.ReactNode;
  showArrow?: boolean;
}

export function Tooltip({
  children,
  showArrow = true,
  className,
  offset = 8,
  ...props
}: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      className={cn(
        "group rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md",
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
        className,
      )}
    >
      {showArrow && (
        <OverlayArrow>
          <svg
            width={8}
            height={8}
            viewBox="0 0 8 8"
            className="fill-foreground group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90"
            aria-hidden
          >
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </AriaTooltip>
  );
}
