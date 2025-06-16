import {
	type CompletedGeneration,
	type FileData,
	type FileId,
	type Generation,
	GenerationContext,
	type GenerationOutput,
	type Message,
	type NodeId,
	type Output,
	type OutputId,
	type QueuedGeneration,
	type RunningGeneration,
	type WorkspaceId,
	isCompletedGeneration,
} from "@giselle-sdk/data-type";
import type { TelemetrySettings } from "@giselle-sdk/telemetry";
import type { DataContent } from "ai";
import { UsageLimitError } from "../../error";
import { filePath } from "../../files/utils";
import type { GiselleEngineContext } from "../../types";
import {
	checkUsageLimits,
	getGeneration,
	getNodeGenerationIndexes,
	handleAgentTimeConsumption,
	queryResultToText,
} from "../utils";
import { internalSetGeneration } from "./set-generation";

export async function useGenerationExecutor<T>(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
	telemetry?: TelemetrySettings;
	execute: (utils: {
		runningGeneration: RunningGeneration;
		generationContext: GenerationContext;
		setGeneration: (generation: Generation) => Promise<void>;
		fileResolver: (fileId: FileId) => Promise<DataContent>;
		generationContentResolver: (
			nodeId: NodeId,
			outputId: OutputId,
		) => Promise<string | undefined>;
		workspaceId: WorkspaceId;
		telemetry?: TelemetrySettings;
		completeGeneration: (args: {
			outputs: GenerationOutput[];
			usage?: {
				promptTokens: number;
				completionTokens: number;
				totalTokens: number;
			};
			messages?: Message[];
		}) => Promise<CompletedGeneration>;
	}) => Promise<T>;
}): Promise<T> {
	const generationContext = GenerationContext.parse(args.generation.context);
	const runningGeneration: RunningGeneration = {
		...args.generation,
		status: "running",
		messages: [],
		queuedAt: args.generation.queuedAt ?? Date.now(),
		startedAt: Date.now(),
	};
	const setGeneration = async (generation: Generation) => {
		await internalSetGeneration({ storage: args.context.storage, generation });
	};
	await setGeneration(runningGeneration);
	let workspaceId: WorkspaceId;
	switch (args.generation.context.origin.type) {
		case "run":
			workspaceId = args.generation.context.origin.workspaceId;
			break;
		case "workspace":
			workspaceId = args.generation.context.origin.id;
			break;
		default: {
			const _exhaustiveCheck: never = args.generation.context.origin;
			throw new Error(`Unhandled origin type: ${_exhaustiveCheck}`);
		}
	}
	const usageLimitStatus = await checkUsageLimits({
		workspaceId,
		generation: args.generation,
		fetchUsageLimitsFn: args.context.fetchUsageLimitsFn,
	});
	if (usageLimitStatus.type === "error") {
		const failedGeneration: Generation = {
			...runningGeneration,
			status: "failed",
			failedAt: Date.now(),
			error: {
				name: usageLimitStatus.error,
				message: usageLimitStatus.error,
				dump: usageLimitStatus,
			},
		} as const;
		await setGeneration(failedGeneration);
		throw new UsageLimitError(usageLimitStatus.error);
	}
	async function fileResolver(fileId: FileId): Promise<DataContent> {
		const blob = await args.context.storage.getItemRaw(
			filePath({
				...runningGeneration.context.origin,
				fileId,
			}),
		);
		if (blob === undefined) {
			return new Uint8Array() as DataContent;
		}
		return blob as DataContent;
	}
	async function generationContentResolver(nodeId: NodeId, outputId: OutputId) {
		const nodeGenerationIndexes = await getNodeGenerationIndexes({
			storage: args.context.storage,
			nodeId,
		});
		if (
			nodeGenerationIndexes === undefined ||
			nodeGenerationIndexes.length === 0
		) {
			return undefined;
		}
		const generation = await getGeneration({
			storage: args.context.storage,
			generationId: nodeGenerationIndexes[nodeGenerationIndexes.length - 1].id,
		});
		if (generation === undefined || !isCompletedGeneration(generation)) {
			return undefined;
		}
		let output: Output | undefined;
		for (const sourceNode of runningGeneration.context.sourceNodes) {
			for (const sourceOutput of sourceNode.outputs) {
				if (sourceOutput.id === outputId) {
					output = sourceOutput;
					break;
				}
			}
		}
		if (output === undefined) {
			return undefined;
		}
		const generationOutput = generation.outputs.find(
			(o) => o.outputId === outputId,
		);
		if (generationOutput === undefined) {
			return undefined;
		}
		switch (generationOutput.type) {
			case "source":
				return JSON.stringify(generationOutput.sources);
			case "generated-text":
				return generationOutput.content;
			case "query-result":
				return queryResultToText(generationOutput);
			default:
				throw new Error("Generation output type is not supported");
		}
	}

	async function completeGeneration({
		outputs,
		usage,
		messages,
	}: {
		outputs: GenerationOutput[];
		usage?: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
		messages?: Message[];
	}): Promise<CompletedGeneration> {
		const completedGeneration = {
			...runningGeneration,
			status: "completed",
			completedAt: Date.now(),
			outputs: outputs,
			usage: usage,
			messages: messages ?? [],
		} satisfies CompletedGeneration;

		await Promise.all([
			setGeneration(completedGeneration),
			handleAgentTimeConsumption({
				workspaceId,
				generation: completedGeneration,
				onConsumeAgentTime: args.context.onConsumeAgentTime,
			}),
			(async () => {
				const result = await args.context.callbacks?.generationComplete?.(
					completedGeneration,
					{
						telemetry: args.telemetry,
					},
				);
				return result;
			})(),
		]);
		return completedGeneration;
	}

	return args.execute({
		runningGeneration,
		generationContext,
		setGeneration,
		fileResolver,
		generationContentResolver,
		workspaceId,
		telemetry: args.telemetry,
		completeGeneration,
	});
}
