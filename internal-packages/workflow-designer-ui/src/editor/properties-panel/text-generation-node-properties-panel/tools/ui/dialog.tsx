import clsx from "clsx/lite";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { PropsWithChildren, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogOverlay = DialogPrimitive.Overlay;

export function DialogContent({ children }: PropsWithChildren) {
	return (
		<DialogPortal>
			<DialogPrimitive.Overlay className="fixed inset-0 bg-black/60 z-50" />
			<div className="fixed inset-0 flex items-center justify-center z-60 p-4">
				<DialogPrimitive.Content
					className={clsx(
						"w-[90vw] max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[12px] p-6 relative",
						"shadow-xl focus:outline-none",
					)}
				>
					{/* Glass effect layers */}
					<div
						className="absolute inset-0 rounded-[12px] backdrop-blur-md"
						style={{
							background:
								"linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)",
						}}
					/>
					<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
					<div className="absolute inset-0 rounded-[12px] border border-white/10" />

					<div className="relative z-10 text-text px-[12px]">{children}</div>
				</DialogPrimitive.Content>
			</div>
		</DialogPortal>
	);
}

export function DialogTitle({ children }: PropsWithChildren) {
	return (
		<DialogPrimitive.Title className="text-[14px]">
			{children}
		</DialogPrimitive.Title>
	);
}
export function DialogDescription({ children }: PropsWithChildren) {
	return (
		<DialogPrimitive.Description className="text-[13px] text-text-muted">
			{children}
		</DialogPrimitive.Description>
	);
}

export function DialogFooter({ children }: PropsWithChildren) {
	return (
		<div
			className={clsx(
				"border-t border-border px-[6px] py-[8px] flex justify-end mx-[-12px] mt-[12px]",
			)}
		>
			{children}
		</div>
	);
}
