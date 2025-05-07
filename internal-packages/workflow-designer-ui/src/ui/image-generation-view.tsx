import {
	type CompletedGeneration,
	type Generation,
	isCompletedGeneration,
	isFailedGeneration,
} from "@giselle-sdk/data-type";
import { useGiselleEngine } from "giselle-sdk/react";
import { Download, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import { WilliIcon } from "../icons";

/**
 * 画像生成中のプレースホルダーを表示するコンポーネント
 */
function ImagePlaceholder() {
	// 模擬的な進捗状態（0-100）
	const [progress, setProgress] = useState(0);
	
	// 時間経過で進捗を更新
	useEffect(() => {
		// 生成開始からの初期進捗（5-15%）
		setProgress(Math.floor(Math.random() * 10) + 5);
		
		// 進捗を徐々に上げていく
		const interval = setInterval(() => {
			setProgress(prev => {
				// 最大95%まで（100%は完了時のみ）
				if (prev >= 95) {
					clearInterval(interval);
					return 95;
				}
				
				// 進捗速度はランダムに変化（リアル感を出すため）
				const increment = Math.random() * 3 + 0.5;
				return Math.min(95, prev + increment);
			});
		}, 800);
		
		return () => clearInterval(interval);
	}, []);
	
	return (
		<div className="w-[240px] h-[240px] bg-[#BBC3D0] rounded-[8px] flex flex-col items-center justify-center">
			<WilliIcon className="w-[24px] h-[24px] text-[#1E67E6] animate-pop-pop-1" />
			<div className="w-[180px] h-[4px] bg-black/40 rounded-full mt-4 overflow-hidden">
				<div 
					className="h-full bg-[#1E67E6] rounded-full transition-all duration-800 ease-in-out"
					style={{ width: `${progress}%` }}
				></div>
			</div>
			<p className="text-[14px] text-[#1E67E6]/80 mt-2">
				{progress < 95 ? `${Math.floor(progress)}%...` : "Almost done..."}
			</p>
		</div>
	);
}

/**
 * 画像ライトボックス（拡大表示）コンポーネント
 */
function ImageLightbox({
	imageUrl,
	onClose,
}: {
	imageUrl: string;
	onClose: () => void;
}) {
	return (
		<div
			className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
			onClick={onClose}
		>
			<div className="relative max-w-[90%] max-h-[90%]">
				<img
					src={imageUrl}
					alt="Enlarged image"
					className="max-w-full max-h-[90vh] object-contain"
				/>
				<button
					onClick={onClose}
					className="absolute top-[-40px] right-0 text-white p-2"
				>
					✕
				</button>
			</div>
		</div>
	);
}

/**
 * 画像生成用の表示コンポーネント
 */
export function ImageGenerationView({
	generation,
}: {
	generation: Generation;
}) {
	const client = useGiselleEngine();
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	// エラー時のメッセージ表示
	if (isFailedGeneration(generation)) {
		return <div className="text-red-500">{generation.error.message}</div>;
	}

	// 画像ダウンロード処理
	const downloadImage = (pathname: string, filename: string) => {
		const a = document.createElement("a");
		a.href = `${client.basePath}/${pathname}`;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	// 生成完了していない場合はプレースホルダーを表示
	if (!isCompletedGeneration(generation)) {
		// 画像生成ノードの設定から予想される生成枚数を取得
		// default: 1枚
		const expectedImageCount = generation.context.operationNode.content.llm?.configurations?.n || 1;
		
		return (
			<div className="flex gap-[12px] overflow-x-auto pb-2">
				{Array.from({ length: expectedImageCount }).map((_, index) => (
					<ImagePlaceholder key={index} />
				))}
			</div>
		);
	}

	// 完了した生成結果の表示
	return (
		<>
			<div className="flex gap-[12px] overflow-x-auto pb-2">
				{generation.outputs.map((output) => {
					if (output.type !== "generated-image") {
						return null;
					}
					
					return (
						<div key={output.outputId} className="flex gap-[12px]">
							{output.contents.map((content) => {
								const imageUrl = `${client.basePath}/${content.pathname}`;
								
								return (
									<div 
										key={content.filename}
										className="relative w-[240px] flex-shrink-0 group"
									>
										<img
											src={imageUrl}
											alt="generated image"
											className="w-full h-auto rounded-[8px] cursor-pointer"
											onClick={() => setLightboxImage(imageUrl)}
										/>
										{/* 黒色オーバーレイ - ホバー時に表示 */}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-[8px]" />
										<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5 z-10">
											<button
												onClick={(e) => {
													e.stopPropagation();
													downloadImage(content.pathname, content.filename);
												}}
												className="p-2 text-white hover:text-white/80 transition-all hover:-translate-y-0.5 duration-200"
												title="Download image"
											>
												<Download className="w-4 h-4" />
											</button>
											<button
												onClick={() => setLightboxImage(imageUrl)}
												className="p-2 text-white hover:text-white/80 transition-all hover:-translate-y-0.5 duration-200"
												title="Enlarge image"
											>
												<ZoomIn className="w-4 h-4" />
											</button>
										</div>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>

			{/* ライトボックス表示 */}
			{lightboxImage && (
				<ImageLightbox
					imageUrl={lightboxImage}
					onClose={() => setLightboxImage(null)}
				/>
			)}
		</>
	);
} 