import type { NextRequest } from "next/server";

export function GET(req: NextRequest) {
	const url = new URL(req.url);
	console.error(`request: ${url.pathname}`);
	return new Response("Hello World");
}
