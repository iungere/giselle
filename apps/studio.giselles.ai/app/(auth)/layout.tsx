import { GiselleLogo } from "@/components/giselle-logo";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative" style={{ backgroundColor: "hsl(234, 91%, 5%)" }}>
			<div className="z-10 relative">{children}</div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100"
				className="absolute inset-0 w-full h-full z-0  blur-[100px]"
				style={{ fill: "hsl(218, 58%, 21%)" }}
			>
				<title>ambient light</title>
				<circle cx="50" cy="50" r="50" />
			</svg>
			<div className="z-0 absolute inset-0 flex justify-center overflow-hidden">
				<GiselleLogo
					className="w-[110%] h-[110%] absolute -bottom-[20%] opacity-5"
					style={{ fill: "hsl(207, 19%, 77%)" }}
				/>
			</div>
		</div>
	);
}
