"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@giselle-internal/ui/dialog";
import type { ReactNode } from "react";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitText?: string;
  isSubmitting?: boolean;
  trigger?: ReactNode;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitText = "Submit",
  isSubmitting = false,
  trigger,
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <div className="flex justify-between items-center">
          <DialogTitle>{title}</DialogTitle>
        </div>
        <DialogDescription>{description}</DialogDescription>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          {children}
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 inline-flex items-center justify-center rounded-lg border-t border-b border-t-white/20 border-b-black/20 px-6 py-2 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.1)] bg-black/20 border border-white/10 shadow-[inset_0_0_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 items-center justify-center gap-[4px] text-[14px] rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
              style={{
                background: "linear-gradient(180deg, #202530 0%, #12151f 100%)",
                border: "1px solid rgba(0,0,0,0.7)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : submitText}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
