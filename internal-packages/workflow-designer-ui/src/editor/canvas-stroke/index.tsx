"use client";

import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";

export function CanvasStroke() {
	const { getViewport } = useReactFlow();
	const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
	const strokeRef = useRef<HTMLDivElement>(null);

	const updateRect = useCallback((paneElement: HTMLElement) => {
		try {
			if (
				!paneElement ||
				typeof paneElement.getBoundingClientRect !== "function"
			) {
				return;
			}
			const rect = paneElement.getBoundingClientRect();
			setCanvasRect(rect);
		} catch (error) {
			console.warn("Failed to update canvas rect:", error);
		}
	}, []);

	const findPaneElement = useCallback((): HTMLElement | null => {
		try {
			const paneElement = document.querySelector(
				".react-flow__pane",
			) as HTMLElement;
			return paneElement && paneElement.nodeType === Node.ELEMENT_NODE
				? paneElement
				: null;
		} catch (error) {
			console.warn("Failed to find ReactFlow pane element:", error);
			return null;
		}
	}, []);

	useEffect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | null = null;
		let paneElement: HTMLElement | null = null;
		let retryCount = 0;
		const maxRetries = 10;

		const cleanup = () => {
			if (resizeObserver) {
				try {
					resizeObserver.disconnect();
				} catch (error) {
					console.warn("Failed to disconnect ResizeObserver:", error);
				}
			}
		};

		const handleUpdate = () => {
			if (mounted && paneElement) {
				updateRect(paneElement);
			}
		};

		const initializeStroke = () => {
			if (!mounted) return;

			paneElement = findPaneElement();
			if (!paneElement) {
				if (retryCount < maxRetries) {
					retryCount++;
					// Retry after a short delay if element not found
					setTimeout(() => {
						if (mounted) {
							initializeStroke();
						}
					}, 100);
				}
				return;
			}

			// 初期位置を設定
			updateRect(paneElement);

			// リサイズやスクロールに対応
			try {
				resizeObserver = new ResizeObserver(() => {
					if (mounted && paneElement) {
						updateRect(paneElement);
					}
				});
				resizeObserver.observe(paneElement);
			} catch (error) {
				console.warn("Failed to create ResizeObserver:", error);
			}

			window.addEventListener("resize", handleUpdate);
			window.addEventListener("scroll", handleUpdate);
		};

		initializeStroke();

		return () => {
			mounted = false;
			cleanup();
			window.removeEventListener("resize", handleUpdate);
			window.removeEventListener("scroll", handleUpdate);
		};
	}, [findPaneElement, updateRect]);

	if (!canvasRect) return null;

	return (
		<div
			ref={strokeRef}
			className="pointer-events-none fixed z-[70]"
			style={{
				left: canvasRect.left,
				top: canvasRect.top,
				width: canvasRect.width,
				height: canvasRect.height,
				borderRadius: "16px",
				padding: "1px",
				background: `linear-gradient(
					135deg,
					rgba(50, 50, 50, 0.7) 0%,
					rgba(50, 50, 50, 0.7) 15%,
					rgba(0, 0, 0, 0.5) 85%,
					rgba(0, 0, 0, 0.5) 100%
				)`,
				mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
				maskComposite: "exclude",
				WebkitMask:
					"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
				WebkitMaskComposite: "xor",
				filter: "blur(2px)",
			}}
		/>
	);
}
