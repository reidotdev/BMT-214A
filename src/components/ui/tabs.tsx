"use client";

import {
  Tabs as AriaTabs,
  type TabsProps,
  TabList as AriaTabList,
  type TabListProps,
  Tab as AriaTab,
  type TabProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <AriaTabs
      {...props}
      className={cn(
        "flex flex-col gap-4 data-[orientation=vertical]:flex-row",
        className,
      )}
    />
  );
}

export function TabList<T extends object>({
  className,
  ...props
}: TabListProps<T>) {
  return (
    <AriaTabList
      {...props}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1 data-[orientation=vertical]:flex-col",
        className,
      )}
    />
  );
}

export function Tab({ className, ...props }: TabProps) {
  return (
    <AriaTab
      {...props}
      className={cn(
        "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
        "data-[hovered]:text-foreground",
        "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        focusRing,
        className,
      )}
    />
  );
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel {...props} className={cn("text-sm", focusRing, className)} />
  );
}
