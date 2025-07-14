import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import {
	type ConnectionId,
	type GitHubActionCommandConfiguredState,
	type Input,
	isTextGenerationNode,
	isTextNode,
	type Node,
	type NodeId,
	type OutputId,
} from "@giselle-sdk/data-type";
import { githubActionIdToLabel } from "@giselle-sdk/flow";
import {
	defaultName,
	useFeatureFlag,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import clsx from "clsx/lite";
import { TrashIcon, TriangleAlert } from "lucide-react";
import {
	DropdownMenu as RadixDropdownMenu,
	Switch as RadixSwitch,
} from "radix-ui";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { NodeIcon } from "../../../../icons/node";
import { GitHubRepositoryBlock } from "../../trigger-node-properties-panel/ui";
import { type InputWithConnectedOutput, useConnectedInputs } from "../lib";

export function GitHubActionConfiguredView({
	nodeId,
	inputs,
	state,
}: {
	nodeId: NodeId;
	inputs: Input[];
	state: GitHubActionCommandConfiguredState;
}) {
	const client = useGiselleEngine();
	const {
		deleteConnection,
		updateNodeData,
		data: { ui, nodes },
	} = useWorkflowDesigner();
	const { isLoading, data } = useSWR(
		{
			installationId: state.installationId,
			repositoryNodeId: state.repositoryNodeId,
		},
		({ installationId, repositoryNodeId }) =>
			client.getGitHubRepositoryFullname({
				installationId,
				repositoryNodeId,
			}),
	);

	const { connectedInputs } = useConnectedInputs(nodeId, inputs);

	const handleClickRemoveButton = useCallback(
		(connectionId: ConnectionId) => () => {
			deleteConnection(connectionId);
		},
		[deleteConnection],
	);

	const handleToggleRequired = useCallback(
		(inputId: string, checked: boolean) => {
			const currentNode = nodes.find((n) => n.id === nodeId);
			if (!currentNode) return;

			const updatedInputs = inputs.map((input) =>
				input.id === inputId ? { ...input, isRequired: checked } : input,
			);

			updateNodeData(currentNode, {
				inputs: updatedInputs,
			});
		},
		[nodes, nodeId, inputs, updateNodeData],
	);

	return (
		<div className="flex flex-col gap-[16px] p-0 px-1 overflow-y-auto">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Repository</p>
				<div className="px-[4px] pt-[6px]">
					{isLoading || data === undefined ? (
						<p>Loading...</p>
					) : (
						<GitHubRepositoryBlock
							owner={data.fullname.owner}
							repo={data.fullname.repo}
						/>
					)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
				<div className="px-[4px] py-0 w-full bg-transparent text-[14px] flex items-center">
					{githubActionIdToLabel(state.commandId)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">
					Action Parameter
				</p>
				<div className="px-[4px] py-0 w-full bg-transparent text-[14px]">
					<ul className="w-full border-collapse divide-y divide-black-400">
						{connectedInputs.map((input) => (
							<li key={input.id} className="py-[12px]">
								<div className=" flex items-center justify-between">
									<div className="flex items-center gap-[12px]">
										<RadixSwitch.Root
											className={clsx(
												"h-[15px] w-[27px] rounded-full outline-none",
												"border border-white-400 data-[state=checked]:border-primary-900",
												"bg-transparent data-[state=checked]:bg-primary-900",
											)}
											id={`input-${input.id}`}
											checked={input.isRequired}
											onCheckedChange={(checked) => {
												handleToggleRequired(input.id, checked);
											}}
										>
											<RadixSwitch.Thumb
												className={clsx(
													"block size-[11px] translate-x-[2px] rounded-full",
													"bg-white-400 data-[state=checked]:bg-white-900",
													"transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[13px]",
												)}
											/>
										</RadixSwitch.Root>
										<label
											className="text-[14px]"
											htmlFor={`input-${input.id}`}
										>
											{input.label}
										</label>
									</div>
									{input.connectedOutput ? (
										<div className="group flex items-center border border-black-400 px-[12px] py-[8px] rounded-[4px] gap-[6px] justify-between w-[300px]">
											<div className="flex items-center gap-[6px] whitespace-nowrap overflow-x-hidden flex-1 min-w-[0px]">
												<NodeIcon
													node={input.connectedOutput.node}
													className="size-[14px] shrink-0"
												/>
												<p className="truncate">
													{defaultName(input.connectedOutput.node)} /{" "}
													{input.connectedOutput.label}
												</p>
											</div>
											<button
												type="button"
												className="hidden group-hover:block px-[4px] h-[20px] bg-transparent hover:bg-white-900/20 rounded-[4px] transition-colors mr-[2px] flex-shrink-0 cursor-pointer"
												onClick={handleClickRemoveButton(
													input.connectedOutput.connectionId,
												)}
											>
												<TrashIcon className="size-[16px] stroke-current stroke-[1px] " />
											</button>
										</div>
									) : (
										<SelectOutputPopover nodeId={nodeId} input={input} />
									)}
								</div>
								{ui.nodeState[nodeId]?.showError &&
									input.isRequired &&
									input.connectedOutput === undefined && (
										<div className="flex justify-end">
											<div className="text-red-900 flex items-center gap-[4px]">
												<TriangleAlert className="size-[14px]" />
												<span>Please choose a source</span>
											</div>
										</div>
									)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

type OutputWithDetails = {
	id: OutputId;
	label: string;
	node: Node;
};

function SelectOutputPopover({
	nodeId,
	input,
}: {
	nodeId: NodeId;
	input: InputWithConnectedOutput;
}) {
	const { data } = useWorkflowDesigner();

	const node = useMemo(
		() => data.nodes.find((n) => n.id === nodeId),
		[data.nodes, nodeId],
	);

	const groupedOutputs = useMemo(() => {
		const textNodes: OutputWithDetails[] = [];
		const generatedNodes: OutputWithDetails[] = [];

		for (const node of data.nodes) {
			if (node.id === nodeId) {
				continue;
			}
			for (const output of node.outputs) {
				if (isTextGenerationNode(node)) {
					generatedNodes.push({ ...output, node });
				} else if (isTextNode(node)) {
					textNodes.push({ ...output, node });
				}
			}
		}

		return [
			{ label: "Generated Content", nodes: generatedNodes },
			{ label: "Text", nodes: textNodes },
		].filter((group) => group.nodes.length > 0);
	}, [data.nodes, nodeId]);

	const { addConnection } = useWorkflowDesigner();

	const handleSelectOutput = useCallback(
		(outputNode: Node, outputId: OutputId) => {
			if (node === undefined) {
				return;
			}
			addConnection({
				outputNode,
				outputId,
				inputNode: node,
				inputId: input.id,
			});
		},
		[node, addConnection, input],
	);

	const { layoutV2 } = useFeatureFlag();
	if (layoutV2) {
		return (
			<DropdownMenu
				trigger={<Button>Select Source</Button>}
				items={groupedOutputs.map((groupedOutput) => ({
					groupId: groupedOutput.label,
					groupLabel: groupedOutput.label,
					items: groupedOutput.nodes,
				}))}
				renderItem={(item) => (
					<p className="text-[12px] truncate">
						{item.node.name ?? defaultName(item.node)} / {item.label}
					</p>
				)}
				onSelect={(_event, item) => handleSelectOutput(item.node, item.id)}
			/>
		);
	}

	return (
		<RadixDropdownMenu.Root>
			<RadixDropdownMenu.Trigger
				className={clsx(
					"flex items-center cursor-pointer p-[10px] rounded-[8px]",
					"border border-transparent hover:border-white-800",
					"text-[12px] font-[700] text-white-800",
					"transition-colors",
				)}
			>
				Select Source
			</RadixDropdownMenu.Trigger>
			<RadixDropdownMenu.Portal>
				<RadixDropdownMenu.Content
					className={clsx(
						"relative w-[300px] py-[8px]",
						"rounded-[8px] border-[1px] bg-black-900/60 backdrop-blur-[8px]",
						"shadow-[-2px_-1px_0px_0px_rgba(0,0,0,0.1),1px_1px_8px_0px_rgba(0,0,0,0.25)]",
					)}
					align="end"
				>
					<div
						className={clsx(
							"absolute z-0 rounded-[8px] inset-0 border-[1px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
							"from-[hsl(232,_36%,_72%)]/40 to-[hsl(218,_58%,_21%)]/90",
						)}
					/>
					<div className="relative max-h-[300px] flex flex-col">
						<div className="grow flex flex-col pb-[8px] gap-[8px] overflow-y-auto min-h-0">
							{groupedOutputs.map((groupedOutput) =>
								groupedOutput.nodes.length === 0 ? null : (
									<RadixDropdownMenu.Group
										className="flex flex-col px-[8px]"
										key={groupedOutput.label}
									>
										<RadixDropdownMenu.Label className="py-[4px] px-[8px] text-black-400 text-[10px] font-[700]">
											{groupedOutput.label}
										</RadixDropdownMenu.Label>
										{groupedOutput.nodes.map((output) => (
											<RadixDropdownMenu.Item
												key={output.id}
												className={clsx(
													"group flex p-[8px] justify-between rounded-[8px] hover:bg-primary-900/50 transition-colors cursor-pointer",
													"text-white-400",
													"data-[disabled]:text-white-850/30 data-[disabled]:pointer-events-none",
												)}
												textValue={output.id}
												onSelect={() =>
													handleSelectOutput(output.node, output.id)
												}
											>
												<p className="text-[12px] truncate">
													{defaultName(output.node)} / {output.label}
												</p>
											</RadixDropdownMenu.Item>
										))}
									</RadixDropdownMenu.Group>
								),
							)}
						</div>
					</div>
				</RadixDropdownMenu.Content>
			</RadixDropdownMenu.Portal>
		</RadixDropdownMenu.Root>
	);
}
