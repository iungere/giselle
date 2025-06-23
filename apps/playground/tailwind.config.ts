import type { Config } from "tailwindcss";

const config = {
	content: [
		"./app/**/*.{ts,tsx}",
		"../../internal-packages/workflow-designer-ui/**/*.{ts,tsx,css}",
		"../../internal-packages/ui/**/*.{ts,tsx,css}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
} satisfies Config;

export default config;
