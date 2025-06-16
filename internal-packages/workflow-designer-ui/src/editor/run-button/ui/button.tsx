import clsx from "clsx/lite";
import { LoaderIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
	leftIcon: LeftIcon,
	rightIcon: RightIcon,
	loading = false,
	disabled = false,
	children,
	className,
	...props
}: {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">) {
	const isDisabled = loading || disabled;

	return (
		<button
			type="button"
			className={clsx(
				"group relative overflow-hidden rounded-lg px-[16px] py-[6px] font-accent inline-flex items-center gap-[6px] outline-none transition-all duration-300",
				"hover:scale-[1.01] active:scale-95",
				"data-[loading=true]:cursor-not-allowed data-[loading=true]:opacity-60",
				"data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60",
				"text-white-900",
				className,
			)}
			style={{
				boxShadow:
					"0 8px 20px rgba(107, 143, 240, 0.2), 0 3px 10px rgba(107, 143, 240, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08)",
			}}
			data-loading={loading}
			data-disabled={isDisabled}
			disabled={isDisabled}
			{...props}
		>
			{/* Outer glow */}
			<div
				className="absolute inset-0 rounded-lg blur-[2px] -z-10"
				style={{ backgroundColor: "#6B8FF0", opacity: 0.08 }}
			/>
			{/* Glass background */}
			<div
				className="absolute inset-0 rounded-lg backdrop-blur-md -z-10"
				style={{
					background:
						"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(107,143,240,0.1) 50%, rgba(107,143,240,0.2) 100%)",
				}}
			/>
			{/* Top reflection */}
			<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent -z-10" />
			{/* Border */}
			<div className="absolute inset-0 rounded-lg border border-white/20 -z-10" />
			{/* Hover overlay */}
			<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10" />

			<span className="relative z-10 flex items-center gap-[6px]">
				{loading ? (
					<LoaderIcon className="size-[14px] animate-spin" />
				) : (
					LeftIcon
				)}
				<span className="text-[14px] font-medium leading-[20px]">
					{children}
				</span>
				{!loading && RightIcon}
			</span>
		</button>
	);
}
