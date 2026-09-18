"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { cn } from "@/helpers/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
};

export function Modal({ open, onClose, title, children, footer, size = "md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-full rounded-2xl border border-line-strong bg-surface p-0 text-zinc-100 shadow-2xl shadow-black/60 backdrop:bg-black/65 backdrop:backdrop-blur-sm open:animate-pop-in max-sm:h-full max-sm:max-h-full max-sm:max-w-none max-sm:rounded-none",
        size === "md" ? "max-w-lg" : "max-w-3xl",
      )}
    >
      <div className="flex max-h-[85vh] flex-col max-sm:h-full max-sm:max-h-full">
        <header className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
