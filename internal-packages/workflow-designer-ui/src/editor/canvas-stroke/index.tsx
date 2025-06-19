"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

export function CanvasStroke() {
	const { getViewport } = useReactFlow();
	const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
	const strokeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// ReactFlowのpane要素を取得
		const paneElement = document.querySelector('.react-flow__pane') as HTMLElement;
		if (!paneElement) return;

		const updateRect = () => {
			const rect = paneElement.getBoundingClientRect();
			setCanvasRect(rect);
		};

		// 初期位置を設定
		updateRect();

		// リサイズやスクロールに対応
		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(paneElement);

		window.addEventListener('resize', updateRect);
		window.addEventListener('scroll', updateRect);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateRect);
			window.removeEventListener('scroll', updateRect);
		};
	}, []);

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
				borderRadius: '16px',
				padding: '1px',
				background: `linear-gradient(
					135deg,
					rgba(50, 50, 50, 0.7) 0%,
					rgba(50, 50, 50, 0.7) 15%,
					rgba(0, 0, 0, 0.5) 85%,
					rgba(0, 0, 0, 0.5) 100%
				)`,
				mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
				maskComposite: 'exclude',
				WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
				WebkitMaskComposite: 'xor',
				filter: 'blur(2px)',
			}}
		/>
	);
} 