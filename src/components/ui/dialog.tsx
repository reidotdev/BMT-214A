"use client";

import {
  DialogTrigger,
  Modal as AriaModal,
  ModalOverlay,
  Dialog as AriaDialog,
  type DialogProps,
  Heading,
  type HeadingProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export { DialogTrigger };

export interface ModalProps extends DialogProps {
  isDismissable?: boolean;
}

export function Modal({
  isDismissable = true,
  className,
  children,
  ...props
}: ModalProps) {
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      className={cn(
        "fixed inset-0 z-50 flex min-h-full items-center justify-center bg-black/50 p-4",
        "data-[entering]:animate-in data-[entering]:fade-in-0",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0",
      )}
    >
      <AriaModal
        className={cn(
          "w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl",
          "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
        )}
      >
        <AriaDialog
          {...props}
          className={cn("flex flex-col gap-4 outline-hidden", className)}
        >
          {children}
        </AriaDialog>
      </AriaModal>
    </ModalOverlay>
  );
}

export function DialogTitle({ className, ...props }: HeadingProps) {
  return (
    <Heading
      {...props}
      slot="title"
      className={cn("text-lg font-semibold text-foreground", className)}
    />
  );
}
