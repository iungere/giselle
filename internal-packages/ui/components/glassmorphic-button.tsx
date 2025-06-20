"use client";

import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
// CSS classes are now used for better performance

interface GlassmorphicButtonProps {
	children: ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	className?: string;
}

export function GlassmorphicButton({
	children,
	onClick,
	type = "button",
	className = "",
}: GlassmorphicButtonProps) {
	return (
		<button
			type={type}
			onClick={onClick}
			className={`glassmorphic-button group relative overflow-hidden rounded-lg px-4 py-2 text-white transition-all duration-300 hover:scale-[1.01] active:scale-95 ${className}`}
		>
			{/* Outer glow */}
			<div className="glassmorphic-button-outer-glow absolute inset-0 rounded-lg blur-[2px] -z-10" />

			{/* Main glass background */}
			<div className="glassmorphic-button-background absolute inset-0 rounded-lg backdrop-blur-md" />

			{/* Top reflection */}
			<div className="glassmorphic-button-top-reflection absolute top-0 left-4 right-4 h-px" />

			{/* Subtle border */}
			<div className="glassmorphic-button-border absolute inset-0 rounded-lg" />

			{/* Content */}
			<span className="relative z-10 flex items-center gap-2">{children}</span>

			{/* Hover overlay */}
			<div className="glassmorphic-button-hover-overlay absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
		</button>
	);
}

export function AddDataSourceButton({ onClick }: { onClick?: () => void }) {
	return (
		<GlassmorphicButton onClick={onClick}>
			<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
				<PlusIcon className="size-3 text-black-900" />
			</span>
			<span className="text-[14px] leading-[20px] font-medium">
				Add Data Source
			</span>
		</GlassmorphicButton>
	);
}
