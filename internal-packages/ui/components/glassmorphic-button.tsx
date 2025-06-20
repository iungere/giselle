"use client";

import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";

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
			className={`group relative overflow-hidden rounded-lg px-4 py-2 text-white transition-all duration-300 hover:scale-[1.01] active:scale-95 ${className}`}
			style={{
				boxShadow:
					"0 8px 20px rgba(107, 143, 240, 0.2), 0 3px 10px rgba(107, 143, 240, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08)",
			}}
		>
			{/* Outer glow */}
			<div
				className="absolute inset-0 rounded-lg blur-[2px] -z-10"
				style={{ backgroundColor: "#6B8FF0", opacity: 0.08 }}
			/>

			{/* Main glass background */}
			<div
				className="absolute inset-0 rounded-lg backdrop-blur-md"
				style={{
					background:
						"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(107,143,240,0.1) 50%, rgba(107,143,240,0.2) 100%)",
				}}
			/>

			{/* Top reflection */}
			<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

			{/* Subtle border */}
			<div className="absolute inset-0 rounded-lg border border-white/20" />

			{/* Content */}
			<span className="relative z-10 flex items-center gap-2">{children}</span>

			{/* Hover overlay */}
			<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
