// モデル別の閾値設定
const MODEL_THRESHOLDS = {
	// Gemini 1.5系
	"gemini-1.5-pro-latest": 128_000,
	"gemini-2.5-pro-exp-03-25": 128_000,
	"gemini-2.5-pro-preview-03-25": 128_000,

	// Gemini 2.0系
	"gemini-2.0-flash-001": 200_000,
	"gemini-2.0-flash-lite-preview-02-05": 200_000,
	"gemini-2.0-flash-thinking-exp-01-21": 200_000,
	"gemini-2.0-pro-exp-02-05": 200_000,

	// 従来のGemini Pro
	"gemini-pro": 200_000,
	"gemini-pro-vision": 200_000,
} as const;

// デフォルトの閾値
const DEFAULT_THRESHOLD = 200_000;

function getTokenThreshold(modelId: string): number {
	return (
		MODEL_THRESHOLDS[modelId as keyof typeof MODEL_THRESHOLDS] ??
		DEFAULT_THRESHOLD
	);
}

export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

export interface TransformedUsage {
	unit: "TOKENS";
	totalTokens: number;
	input_short?: number;
	input_long?: number;
	output_short?: number;
	output_long?: number;
}

export function transformModelUsage(
	modelId: string,
	usage: TokenUsage,
): TransformedUsage | TokenUsage {
	// Gemini 2.5系のモデルの場合のみ変換
        console.log("transform----------------")
	if (modelId.startsWith("gemini-2.5")) {
          console.log("gemini-2.5----------------")
		const threshold = getTokenThreshold(modelId);
		const isShortInput = usage.promptTokens <= threshold;

		return {
			unit: "TOKENS",
			totalTokens: usage.totalTokens,
			[isShortInput ? "input_short" : "input_long"]: usage.promptTokens,
			[isShortInput ? "output_short" : "output_long"]: usage.completionTokens,
		};
	}

	// その他のモデルの場合は元のusageをそのまま返す
	return usage;
}
