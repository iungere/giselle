import {
	type ActionNode,
	type Input,
	InputId,
	OutputId,
} from "@giselle-sdk/data-type";
import { type GitHubActionCommandId, githubActions } from "@giselle-sdk/flow";
import type { GitHubIntegrationInstallation } from "@giselle-sdk/integration";
import { useIntegration } from "@giselle-sdk/integration/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import {
	type FormEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GitHubIcon, SpinnerIcon } from "../../../icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { GitHubRepositoryBlock } from "../trigger-node-properties-panel/ui";
import { SelectRepository } from "../ui";
import { GenerationPanel } from "./generation-panel";
import { GitHubActionConfiguredView } from "./ui/github-action-configured-view";

export function GitHubActionPropertiesPanel({
	node,
	onRun,
}: {
	node: ActionNode;
	onRun?: () => void;
}) {
	const { value } = useIntegration();

	// Only handle GitHub actions
	if (node.content.command.provider !== "github") {
		return null;
	}

	if (node.content.command.state.status === "configured") {
		return (
			<PanelGroup direction="vertical" className="flex-1 flex flex-col">
				<Panel defaultSize={50} minSize={20}>
					<GitHubActionConfiguredView
						state={node.content.command.state}
						nodeId={node.id}
						inputs={node.inputs}
					/>
				</Panel>
				<PanelResizeHandle className="h-[1px] bg-black-700/50 data-[resize-handle-state=drag]:bg-black-600 transition-colors duration-100 ease-in-out" />
				<Panel>
					<GenerationPanel node={node} />
				</Panel>
			</PanelGroup>
		);
	}

	if (value?.github === undefined) {
		return "unset";
	}
	switch (value.github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return <Unauthorized authUrl={value.github.authUrl} />;
		case "not-installed":
			return (
				<InstallGitHubApplication
					installationUrl={value.github.installationUrl}
				/>
			);
		case "invalid-credential":
			return "invalid-credential";
		case "installed":
			return (
				<Installed
					installations={value.github.installations}
					node={node}
					installationUrl={value.github.installationUrl}
				/>
			);
		case "error":
			return `GitHub integration error: ${value.github.errorMessage}`;
		default: {
			const _exhaustiveCheck: never = value.github;
			throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
		}
	}
}

function Unauthorized({
	authUrl,
}: {
	authUrl: string;
}) {
	const { refresh } = useIntegration();
	const [isPending, startTransition] = useTransition();
	const popupRef = useRef<Window | null>(null);

	// Handler for installation message from popup window
	const handleInstallationMessage = useCallback(
		(event: MessageEvent) => {
			if (event.data?.type === "github-app-installed") {
				startTransition(() => {
					refresh();
				});
			}
		},
		[refresh],
	);

	// Listen for visibility changes to refresh data when user returns to the page
	useEffect(() => {
		// Add event listener for installation message from popup
		window.addEventListener("message", handleInstallationMessage);

		return () => {
			window.removeEventListener("message", handleInstallationMessage);

			// Close popup if component unmounts
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [handleInstallationMessage]);

	const handleClick = useCallback(() => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		popupRef.current = window.open(
			authUrl,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}
	}, [authUrl]);

	return (
		<div className="bg-white-900/10 h-[300px] rounded-[8px] flex items-center justify-center">
			<div className="flex flex-col gap-[8px]">
				<p>To get started you have to sign into your GitHub account</p>
				<button
					type="button"
					className="group cursor-pointer bg-black-900 rounded-[4px] py-[4px] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-wait"
					onClick={handleClick}
					disabled={isPending}
				>
					<GitHubIcon className="size-[18px]" />
					Continue with GitHub
					<SpinnerIcon className="hidden group-disabled:block animate-follow-through-overlap-spin" />
				</button>
			</div>
		</div>
	);
}

function InstallGitHubApplication({
	installationUrl,
}: {
	installationUrl: string;
}) {
	const [isPending, startTransition] = useTransition();
	const { refresh } = useIntegration();
	const popupRef = useRef<Window | null>(null);
	const handleClick = useCallback(() => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		popupRef.current = window.open(
			installationUrl,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}
	}, [installationUrl]);

	// Handler for installation message from popup window
	const handleInstallationMessage = useCallback(
		(event: MessageEvent) => {
			if (event.data?.type === "github-app-installed") {
				startTransition(() => {
					refresh();
				});
			}
		},
		[refresh],
	);

	// Listen for visibility changes to refresh data when user returns to the page
	useEffect(() => {
		// Add event listener for installation message from popup
		window.addEventListener("message", handleInstallationMessage);

		return () => {
			window.removeEventListener("message", handleInstallationMessage);

			// Close popup if component unmounts
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [handleInstallationMessage]);
	return (
		<div className="bg-white-900/10 h-[300px] rounded-[8px] flex items-center justify-center">
			<div className="flex flex-col gap-[8px]">
				<p>
					Install the GitHub application for the accounts you wish to perform
					actions with
				</p>
				<button
					type="button"
					className="group cursor-pointer bg-black-900 rounded-[4px] py-[4px] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-wait"
					onClick={handleClick}
					disabled={isPending}
				>
					<GitHubIcon className="size-[18px]" />
					Install
					<SpinnerIcon className="hidden group-disabled:block animate-follow-through-overlap-spin" />
				</button>
			</div>
		</div>
	);
}

interface SelectRepositoryStep {
	state: "select-repository";
}
interface SelectActionStep {
	state: "select-action";
	owner: string;
	repo: string;
	repoNodeId: string;
	installationId: number;
}
interface ConfigureActionStep {
	state: "configure-action";
	owner: string;
	repo: string;
	repoNodeId: string;
	installationId: number;
	actionId: string;
}
export type GitHubActionSetupStep =
	| SelectRepositoryStep
	| SelectActionStep
	| ConfigureActionStep;

function Installed({
	installations,
	node,
	installationUrl,
}: {
	installations: GitHubIntegrationInstallation[];
	node: ActionNode;
	installationUrl: string;
}) {
	const [step, setStep] = useState<GitHubActionSetupStep>({
		state: "select-repository",
	});
	const { updateNodeData } = useWorkflowDesigner();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			if (step.state !== "select-action") {
				throw new Error("Unexpected state");
			}
			const formData = new FormData(e.currentTarget);

			const commandId = formData.get("commandId");
			if (typeof commandId !== "string" || commandId.length === 0) {
				throw new Error("unexpected request");
			}

			/** @todo remove type assertion */
			const action = githubActions[commandId as GitHubActionCommandId];

			// Setup inputs and outputs for the action
			const inputs: Input[] = [];

			// Add inputs based on the action type
			for (const key of action.command.parameters.keyof().options) {
				// @ts-expect-error shape[parameter] is unreasonable but intentional
				const schema = action.command.parameters.shape[key] as AnyZodObject;
				inputs.push({
					id: InputId.generate(),
					accessor: key,
					label: key,
					isRequired: !schema.isOptional(),
				});
			}

			updateNodeData(node, {
				content: {
					...node.content,
					command: {
						...node.content.command,
						provider: "github",
						state: {
							status: "configured",
							commandId: action.command.id,
							repositoryNodeId: step.repoNodeId,
							installationId: step.installationId,
						},
					},
				},
				name: action.command.label,
				inputs,
				outputs: [
					{
						id: OutputId.generate(),
						label: "output",
						accessor: "action-result",
					},
				],
			});
		},
		[node, updateNodeData, step],
	);

	return (
		<div className="flex flex-col gap-[16px] px-[16px]">
			<p className="text-[18px]">Setup GitHub Action</p>
			{step.state === "select-repository" && (
				<SelectRepository
					installations={installations}
					installationUrl={installationUrl}
					onSelectRepository={(value) => {
						setStep({
							state: "select-action",
							installationId: value.installationId,
							owner: value.owner,
							repo: value.repo,
							repoNodeId: value.repoNodeId,
						});
					}}
				/>
			)}
			{step.state === "select-action" && (
				<form
					className="w-full flex flex-col gap-[16px]"
					onSubmit={handleSubmit}
				>
					<GitHubRepositoryBlock owner={step.owner} repo={step.repo} />
					<p className="text-[14px]">Choose what action you want to perform.</p>
					<fieldset className="flex flex-col gap-[4px]">
						<Select
							name="commandId"
							defaultValue={githubActions["github.create.issue"].command.id}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select an command" />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(githubActions).map(([id, githubAction]) => (
									<SelectItem key={id} value={id}>
										{githubAction.command.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</fieldset>

					<button
						type="submit"
						className="h-[28px] rounded-[8px] bg-white-800 text-[14px] cursor-pointer text-black-800 font-[700] px-[16px] font-accent disabled:opacity-50"
					>
						Setup Action
					</button>
				</form>
			)}
		</div>
	);
}
