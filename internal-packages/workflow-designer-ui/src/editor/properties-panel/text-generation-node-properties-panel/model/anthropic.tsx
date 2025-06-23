import { AnthropicLanguageModelData } from "@giselle-sdk/data-type";
import {
	Capability,
	anthropicLanguageModels,
	hasCapability,
} from "@giselle-sdk/language-model";
import { useUsageLimits } from "giselle-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";
import { languageModelAvailable } from "./utils";

export function AnthropicModelPanel({
	anthropicLanguageModel,
	onModelChange,
}: {
	anthropicLanguageModel: AnthropicLanguageModelData;
	onModelChange: (changedValue: AnthropicLanguageModelData) => void;
}) {
	const limits = useUsageLimits();

	const hasReasoningCapability = useMemo(() => {
		const languageModel = anthropicLanguageModels.find(
			(lm) => lm.id === anthropicLanguageModel.id,
		);
		return languageModel && hasCapability(languageModel, Capability.Reasoning);
	}, [anthropicLanguageModel.id]);

	const handleModelChange = useCallback(
		(value: string) => {
			const newLanguageModel = anthropicLanguageModels.find(
				(model) => model.id === value,
			);
			if (newLanguageModel === undefined) {
				return;
			}
			onModelChange(
				AnthropicLanguageModelData.parse({
					...anthropicLanguageModel,
					id: value,
					configurations: {
						...anthropicLanguageModel.configurations,
						reasoning:
							anthropicLanguageModel.configurations.reasoning &&
							hasCapability(newLanguageModel, Capability.Reasoning),
					},
				}),
			);
		},
		[anthropicLanguageModel, onModelChange],
	);

	const supportsReasoning =
		languageModel && hasCapability(languageModel, Capability.Reasoning);

	// UIのスイッチ状態を追跡するための内部ステート
	const [reasoningEnabled, setReasoningEnabled] = useState(
		supportsReasoning ? anthropicLanguageModel.configurations.reasoning : false,
	);

	// エラーメッセージ表示用の状態
	const [showError, setShowError] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// モデルまたは設定が変更されたときにUIの状態を更新
	useEffect(() => {
		setReasoningEnabled(
			supportsReasoning
				? anthropicLanguageModel.configurations.reasoning
				: false,
		);

		// モデルが変わったらエラー表示をリセット
		setShowError(false);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	}, [anthropicLanguageModel.configurations.reasoning, supportsReasoning]);

	return (
		<div className="flex flex-col gap-[34px]">
<<<<<<< HEAD
			<div className="grid grid-cols-2 gap-[24px]">
				<div className="flex flex-col col-span-2">
					<div className="text-[14px] py-[1.5px]">Model</div>
					<Select
						value={anthropicLanguageModel.id}
						onValueChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									id: value,
								}),
							);
						}}
					>
						<SelectTrigger className="border-[2px]">
							<SelectValue placeholder="Select a LLM" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{anthropicLanguageModels.map((anthropicLanguageModel) => (
									<SelectItem
										key={anthropicLanguageModel.id}
										value={anthropicLanguageModel.id}
										disabled={
											!languageModelAvailable(anthropicLanguageModel, limits)
										}
									>
										{anthropicLanguageModel.id}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>
=======
			<Select
				value={anthropicLanguageModel.id}
				onValueChange={handleModelChange}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a LLM" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{anthropicLanguageModels.map((anthropicLanguageModel) => (
							<SelectItem
								key={anthropicLanguageModel.id}
								value={anthropicLanguageModel.id}
								disabled={
									!languageModelAvailable(anthropicLanguageModel, limits)
								}
							>
								{anthropicLanguageModel.id}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
>>>>>>> feature/playground-base-design
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={anthropicLanguageModel.configurations.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										temperature: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={anthropicLanguageModel.configurations.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										topP: value,
									},
								}),
							);
						}}
					/>

<<<<<<< HEAD
					<Switch
						label="Reasoning"
						name="reasoning"
						checked={reasoningEnabled}
						onCheckedChange={(checked) => {
							if (!supportsReasoning && checked) {
								// 非対応モデルでONにしようとした場合
								// 一瞬ONにして、すぐにOFFに戻す
								setReasoningEnabled(true);
								setShowError(true);

								// 既存のタイマーがあればクリア
								if (timeoutRef.current) {
									clearTimeout(timeoutRef.current);
								}

								// 少し遅延してOFFに戻す（UXのため）
								timeoutRef.current = setTimeout(() => {
									setReasoningEnabled(false);
									// エラーメッセージは表示したまま
								}, 300);

								return;
							}

							// サポート対応モデルの場合は通常の動作
							setReasoningEnabled(checked);
							setShowError(false);

							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										reasoning: checked && supportsReasoning, // サポートしていない場合は常にfalse
									},
								}),
							);
						}}
						note={
							!supportsReasoning &&
							showError &&
							"Current model does not support reasoning features."
						}
					/>
=======
					{hasReasoningCapability ? (
						<Switch
							label="Reasoning"
							name="reasoning"
							checked={anthropicLanguageModel.configurations.reasoning}
							onCheckedChange={(checked) => {
								onModelChange(
									AnthropicLanguageModelData.parse({
										...anthropicLanguageModel,
										configurations: {
											...anthropicLanguageModel.configurations,
											reasoning: checked,
										},
									}),
								);
							}}
						/>
					) : (
						<>
							{/* Refactor this because it duplicates the Switch component */}
							<div className="flex flex-col">
								<div className="flex flex-row items-center justify-between">
									<p className="text-[14px]">Reasoning</p>
									<div className="flex-grow mx-[12px] h-[1px] bg-black-200/30" />
									<p className="text-[12px]">Unsuported</p>
								</div>
							</div>
						</>
					)}
>>>>>>> feature/playground-base-design
				</div>
			</div>
		</div>
	);
}
