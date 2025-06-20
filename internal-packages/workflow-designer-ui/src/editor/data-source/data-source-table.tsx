import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@giselle-internal/ui/dialog";
import { EmptyState } from "@giselle-internal/ui/empty-state";
import { GlassmorphicButton } from "@giselle-internal/ui/glassmorphic-button";
import { Select } from "@giselle-internal/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { PlusIcon } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { z } from "zod/v4";
import { FormModal } from "../../ui/form-modal";
import { useWorkspaceDataSources } from "../lib/use-workspace-data-sources";
import { GitHubConnectFieldsets } from "./provider/github";

const GitHubDataSourcePayload = z.object({
	provider: z.literal("github"),
	installationId: z.coerce.number(),
	repositoryNodeId: z.string(),
});

export function DataSourceTable() {
	const [presentDialog, setPresentDialog] = useState(false);
	const { data: workspace } = useWorkflowDesigner();
	const { isLoading, data, mutate } = useWorkspaceDataSources();
	const [isPending, startTransition] = useTransition();
	const client = useGiselleEngine();
	const [provider, setProvider] = useState<string | undefined>();

	const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const formDataObject = Object.fromEntries(formData.entries());
			const parse = GitHubDataSourcePayload.safeParse(formDataObject);
			if (!parse.success) {
				/** @todo Implement error handling */
				console.log(parse.error);
				return;
			}
			const payload = parse.data;
			startTransition(async () => {
				switch (payload.provider) {
					case "github": {
						const result = await client.createDataSource({
							workspaceId: workspace.id,
							dataSource: {
								provider: "github",
								providerMetadata: {
									repositoryNodeId: payload.repositoryNodeId,
									installationId: payload.installationId,
								},
							},
						});
						await mutate([...(data ?? []), result.dataSource]);
						break;
					}
					default: {
						const _exhaustiveCheck: never = payload.provider;
						throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
					}
				}
			});
			setPresentDialog(false);
		},
		[client, workspace.id, data, mutate],
	);

	if (isLoading) {
		return null;
	}
	if (data === undefined || data.length < 1) {
		return (
			<div className="h-full p-[16px] flex items-center justify-center">
				<EmptyState
					title="No data source connected."
					description="Add your first one below to start building."
				>
					<FormModal
						open={presentDialog}
						onOpenChange={setPresentDialog}
						title="Add Data Source"
						description="Connect to external data sources to query and use in your workflows."
						onSubmit={handleSubmit}
						submitText="Create"
						isSubmitting={isPending}
						trigger={
							<GlassmorphicButton>
								<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
									<PlusIcon className="size-3 text-black-900" />
								</span>
								<span className="text-[14px] leading-[20px] font-medium">
									Add Data Source
								</span>
							</GlassmorphicButton>
						}
					>
						<div className="flex flex-col gap-[12px]">
							<fieldset className="flex flex-col">
								<label
									htmlFor="provider"
									className="text-text text-[13px] mb-[2px]"
								>
									Provider
								</label>
								<Select
									name="provider"
									options={[{ id: "github", label: "GitHub" }]}
									renderOption={(option) => option.label}
									placeholder="Select provider..."
									value={provider}
									onValueChange={setProvider}
								/>
								<p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
									Currently, only GitHub is supported. More coming soon!
								</p>
							</fieldset>

							{provider === "github" && <GitHubConnectFieldsets />}
						</div>
					</FormModal>
				</EmptyState>
			</div>
		);
	}
	return (
		<div className="p-[16px] h-full">
			<div className="flex justify-between items-center">
				<h1 className="font-accent text-text text-[18px] mb-[8px]">Secrets</h1>
				<Dialog open={presentDialog} onOpenChange={setPresentDialog}>
					<DialogTrigger asChild>
						<button
							type="button"
							className="group relative overflow-hidden rounded-lg px-4 py-2 text-white transition-all duration-300 hover:scale-[1.01] active:scale-95"
							style={{
								boxShadow:
									"0 8px 20px rgba(107, 143, 240, 0.2), 0 3px 10px rgba(107, 143, 240, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08)",
							}}
						>
							{/* Outer glow */}
							<div
								className="absolute inset-0 rounded-lg blur-[2px] -z-10"
								style={{ backgroundColor: "#6B8FF0", opacity: 0.08 }}
							/>

							{/* Main glass background */}
							<div
								className="absolute inset-0 rounded-lg backdrop-blur-md"
								style={{
									background:
										"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(107,143,240,0.1) 50%, rgba(107,143,240,0.2) 100%)",
								}}
							/>

							{/* Top reflection */}
							<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

							{/* Subtle border */}
							<div className="absolute inset-0 rounded-lg border border-white/20" />

							{/* Content */}
							<span className="relative z-10 flex items-center gap-2">
								<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
									<PlusIcon className="size-3 text-black-900" />
								</span>
								<span className="text-[14px] leading-[20px] font-medium">
									Add Data Source
								</span>
							</span>

							{/* Hover overlay */}
							<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</button>
					</DialogTrigger>
					<DialogContent>
						<div className="flex justify-between items-center">
							<DialogTitle>Add Data Source</DialogTitle>
						</div>
						<DialogDescription>
							Connect to external data sources to query and use in your
							workflows.
						</DialogDescription>
						<form onSubmit={handleSubmit} className="space-y-4 mt-4">
							<div className="flex flex-col gap-[12px]">
								<fieldset className="flex flex-col">
									<label
										htmlFor="provider"
										className="text-text text-[13px] mb-[2px]"
									>
										Provider
									</label>
									<Select
										name="provider"
										options={[{ id: "github", label: "GitHub" }]}
										renderOption={(option) => option.label}
										placeholder="Select provider..."
										value={provider}
										onValueChange={setProvider}
									/>
									<p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
										Currently, only GitHub is supported. More coming soon!
									</p>
								</fieldset>

								{provider === "github" && <GitHubConnectFieldsets />}
							</div>
							<DialogFooter>
								<button
									type="button"
									onClick={() => setPresentDialog(false)}
									className="flex-1 inline-flex items-center justify-center rounded-lg border-t border-b border-t-white/20 border-b-black/20 px-6 py-2 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.1)] bg-black/20 border border-white/10 shadow-[inset_0_0_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 items-center justify-center gap-[4px] text-[14px] rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
									style={{
										background:
											"linear-gradient(180deg, #202530 0%, #12151f 100%)",
										border: "1px solid rgba(0,0,0,0.7)",
										boxShadow:
											"inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
									}}
									disabled={isPending}
								>
									{isPending ? "Creating..." : "Create"}
								</button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>id</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((data) => (
						<TableRow key={data.id}>
							<TableCell>{data.id}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
