"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";

type ModalProps = {
  title: string;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  footer?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const MODAL_WIDTH: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "w-[min(92vw,420px)]",
  md: "w-[min(95vw,560px)]",
  lg: "w-[min(96vw,720px)]",
};

export function Modal({ title, open, onOpenChangeAction, footer, children, size = "md" }: ModalProps) {
  const widthClass = MODAL_WIDTH[size];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChangeAction}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={clsx(
            "fixed inset-0 z-[600] m-auto rounded-2xl border border-[rgb(var(--ao-border))] bg-[rgb(var(--ao-card))] p-4 shadow-ao-lg focus:outline-none",
            widthClass,
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-[rgb(var(--ao-fg))]">
            {title}
          </Dialog.Title>
          <div className="mt-2 text-sm text-[rgb(var(--ao-fg))]">{children}</div>
          {footer ? <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div> : null}
          <Dialog.Close className="sr-only">إغلاق</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
