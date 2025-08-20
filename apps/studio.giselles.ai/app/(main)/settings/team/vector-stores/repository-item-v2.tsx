"use client";

import { StatusBadge } from "@giselle-internal/ui/status-badge";
import { EMBEDDING_PROFILES } from "@giselle-sdk/data-type";
import * as Dialog from "@radix-ui/react-dialog";
import {
	Code,
	GitPullRequest,
	MoreVertical,
	RefreshCw,
	Settings,
	Trash,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
	GitHubRepositoryContentType,
	GitHubRepositoryIndexStatus,
	githubRepositoryContentStatus,
} from "@/drizzle";
import { cn } from "@/lib/utils";
import type { RepositoryWithStatuses } from "@/lib/vector-stores/github";
import { getContentStatusMetadata } from "@/lib/vector-stores/github/types";
import type { GitHubRepositoryIndexId } from "@/packages/types";
import {
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../components/glass-dialog-content";
import { ConfigureSourcesDialog } from "./configure-sources-dialog";
import { DiagnosticModal } from "./diagnostic-modal";
import { getErrorMessage } from "./error-messages";
import type { DocumentLoaderErrorCode } from "./types";

type RepositoryItemProps = {
	repositoryData: RepositoryWithStatuses;
	deleteRepositoryIndexAction: (
		indexId: GitHubRepositoryIndexId,
	) => Promise<void>;
	triggerManualIngestAction: (
		indexId: GitHubRepositoryIndexId,
	) => Promise<{ success: boolean; error?: string }>;
	updateRepositoryIndexAction: (
		repositoryIndexId: GitHubRepositoryIndexId,
		contentTypes: {
			contentType: GitHubRepositoryContentType;
			enabled: boolean;
		}[],
		embeddingProfileIds: number[],
	) => Promise<{ success: boolean; error?: string }>;
	multiEmbedding?: boolean;
};

export function RepositoryItem({
	repositoryData,
	deleteRepositoryIndexAction,
	triggerManualIngestAction,
	updateRepositoryIndexAction,
	multiEmbedding = false,
}: RepositoryItemProps) {
	const { repositoryIndex, contentStatuses } = repositoryData;

	// Derive unique embedding profile IDs from content statuses
	const embeddingProfileIds = [
		...new Set(contentStatuses.map((cs) => cs.embeddingProfileId)),
	].sort((a, b) => a - b);

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showConfigureDialog, setShowConfigureDialog] = useState(false);
	const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [isIngesting, startIngestTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				await deleteRepositoryIndexAction(repositoryIndex.id);
				setShowDeleteDialog(false);
			} catch (error) {
				console.error(error);
			}
		});
	};

	const handleManualIngest = () => {
		startIngestTransition(async () => {
			try {
				const result = await triggerManualIngestAction(repositoryIndex.id);
				if (!result.success) {
					console.error("Failed to trigger manual ingest:", result.error);
				}
			} catch (error) {
				console.error("Error triggering manual ingest:", error);
			}
		});
	};

	// Check if manual ingest is allowed for any enabled content type
	const now = new Date();
	const canManuallyIngest = contentStatuses.some((cs) => {
		if (!cs.enabled) return false;
		return (
			cs.status === "idle" ||
			cs.status === "completed" ||
			(cs.status === "failed" &&
				cs.retryAfter &&
				new Date(cs.retryAfter) <= now)
		);
	});

	// Check if we should show diagnostic modal option
	const hasDiagnosticError = contentStatuses.some(
		(cs) => cs.status === "failed" && cs.errorCode === "DOCUMENT_NOT_FOUND",
	);

	return (
		<div
			className={cn(
				"group relative rounded-[12px] overflow-hidden w-full bg-white/[0.02] backdrop-blur-[8px] border-[0.5px] border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none hover:border-white/12 transition-colors duration-200",
			)}
		>
			<div className="px-[24px] py-[16px]">
				{/* Repository Header */}
				<div className="flex items-center justify-between gap-4 mb-4">
					<a
						href={`https://github.com/${repositoryIndex.owner}/${repositoryIndex.repo}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#1663F3] font-medium text-[16px] leading-[22.4px] font-geist hover:text-[#0f4cd1] transition-colors duration-200"
					>
						{repositoryIndex.owner}/{repositoryIndex.repo}
					</a>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="transition-opacity duration-200 p-2 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
									disabled={isPending || isIngesting}
								>
									<MoreVertical className="h-4 w-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-[180px] bg-black-850 border-[0.5px] border-black-400 rounded-[8px]"
							>
								<DropdownMenuItem
									onClick={handleManualIngest}
									disabled={!canManuallyIngest || isIngesting}
									className="flex items-center px-3 py-2 text-[14px] leading-[16px] text-white-400 hover:bg-white/5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Ingest Now
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setShowConfigureDialog(true)}
									className="flex items-center px-3 py-2 text-[14px] leading-[16px] text-white-400 hover:bg-white/5 rounded-md"
								>
									<Settings className="h-4 w-4 mr-2" />
									Configure Sources
								</DropdownMenuItem>
								<DropdownMenuSeparator className="my-1 h-px bg-white/10" />
								<Dialog.Root
									open={showDeleteDialog}
									onOpenChange={setShowDeleteDialog}
								>
									<Dialog.Trigger asChild>
										<DropdownMenuItem
											onClick={() => setShowDeleteDialog(true)}
											className="flex items-center px-3 py-2 text-[14px] leading-[16px] text-error-900 hover:bg-error-900/20 rounded-md"
										>
											<Trash className="h-4 w-4 mr-2" />
											Delete
										</DropdownMenuItem>
									</Dialog.Trigger>
								</Dialog.Root>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Divider below repository name */}
				<div className="border-t border-white/10 my-3"></div>

				{/* Matrix Table */}
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-white/10">
								<th className="text-left text-[12px] text-white-400/60 font-normal pb-2 pr-4 min-w-[140px]">
									Source
								</th>
								{embeddingProfileIds.map((profileId) => {
									const profile =
										EMBEDDING_PROFILES[
											profileId as keyof typeof EMBEDDING_PROFILES
										];
									return (
										<th
											key={profileId}
											className="text-left text-[12px] text-white-400/60 font-normal pb-2 px-2 min-w-[180px]"
										>
											{profile?.name || `Profile ${profileId}`}
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{/* Code Row */}
							<ContentTypeRow
								contentType="blob"
								contentStatuses={contentStatuses}
								embeddingProfileIds={embeddingProfileIds}
								isIngesting={isIngesting}
								onVerify={
									hasDiagnosticError
										? () => setShowDiagnosticModal(true)
										: undefined
								}
							/>
							{/* Pull Requests Row */}
							<ContentTypeRow
								contentType="pull_request"
								contentStatuses={contentStatuses}
								embeddingProfileIds={embeddingProfileIds}
								isIngesting={isIngesting}
							/>
						</tbody>
					</table>
				</div>
			</div>

			{/* Dialogs */}
			<Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<GlassDialogContent variant="destructive">
					<GlassDialogHeader
						title="Delete Repository"
						description={`This action cannot be undone. This will permanently delete the repository "${repositoryIndex.owner}/${repositoryIndex.repo}" from your Vector Stores.`}
						onClose={() => setShowDeleteDialog(false)}
						variant="destructive"
					/>
					<GlassDialogFooter
						onCancel={() => setShowDeleteDialog(false)}
						onConfirm={handleDelete}
						confirmLabel="Delete"
						isPending={isPending}
						variant="destructive"
					/>
				</GlassDialogContent>
			</Dialog.Root>

			<ConfigureSourcesDialog
				open={showConfigureDialog}
				setOpen={setShowConfigureDialog}
				repositoryData={repositoryData}
				updateRepositoryIndexAction={updateRepositoryIndexAction}
				enabledProfiles={embeddingProfileIds}
				multiEmbedding={multiEmbedding}
			/>

			<DiagnosticModal
				repositoryData={repositoryData}
				open={showDiagnosticModal}
				setOpen={setShowDiagnosticModal}
				onComplete={() => {
					// Refresh will happen via revalidatePath in the action
				}}
				onDelete={() => handleDelete()}
			/>
		</div>
	);
}

function getRelativeTimeString(date: Date): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diffInMs / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays > 7) {
		return date.toLocaleDateString("en-US");
	}
	if (diffInDays >= 1) {
		return diffInDays === 1 ? "yesterday" : `${diffInDays} days ago`;
	}
	if (diffInHours >= 1) {
		return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
	}
	if (diffInMinutes >= 1) {
		return diffInMinutes === 1
			? "1 minute ago"
			: `${diffInMinutes} minutes ago`;
	}
	return "just now";
}

function formatRetryTime(retryAfter: Date): string {
	const now = new Date();
	const diffMs = retryAfter.getTime() - now.getTime();

	if (diffMs <= 0) {
		return "now";
	}

	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);

	if (diffHours > 0) {
		return `${diffHours}h`;
	}
	if (diffMinutes > 0) {
		return `${diffMinutes}m`;
	}
	return `${diffSeconds}s`;
}

// Content Type Row Component for matrix view
type ContentTypeRowProps = {
	contentType: GitHubRepositoryContentType;
	contentStatuses: (typeof githubRepositoryContentStatus.$inferSelect)[];
	embeddingProfileIds: number[];
	isIngesting: boolean;
	onVerify?: () => void;
};

function ContentTypeRow({
	contentType,
	contentStatuses,
	embeddingProfileIds,
	isIngesting,
	onVerify,
}: ContentTypeRowProps) {
	const contentConfig = {
		blob: { icon: Code, label: "Code" },
		pull_request: { icon: GitPullRequest, label: "Pull Requests" },
	};
	const config = contentConfig[contentType];
	const Icon = config.icon;

	// Filter statuses for this content type
	const typeStatuses = contentStatuses.filter(
		(cs) => cs.contentType === contentType,
	);

	// Check if any status is enabled for this content type
	const isEnabled = typeStatuses.some((s) => s.enabled);

	return (
		<tr className="border-b border-white/5">
			{/* Source Column */}
			<td className="py-3 pr-4">
				<div className="flex items-center gap-2">
					<Icon size={14} className="text-white-400/60" />
					<span className="text-[13px] text-white-400 font-medium">
						{config.label}
					</span>
					{!isEnabled && (
						<StatusBadge status="ignored" className="ml-2 scale-90">
							Disabled
						</StatusBadge>
					)}
				</div>
			</td>

			{/* Status Columns for each embedding profile */}
			{embeddingProfileIds.map((profileId) => {
				const status = typeStatuses.find(
					(s) => s.embeddingProfileId === profileId,
				);

				return (
					<td key={profileId} className="py-3 px-2">
						<StatusCell
							status={status}
							contentType={contentType}
							isIngesting={isIngesting}
							onVerify={onVerify}
						/>
					</td>
				);
			})}
		</tr>
	);
}

// Individual Status Cell Component
type StatusCellProps = {
	status?: typeof githubRepositoryContentStatus.$inferSelect;
	contentType: GitHubRepositoryContentType;
	isIngesting: boolean;
	onVerify?: () => void;
};

function StatusCell({
	status,
	contentType,
	isIngesting,
	onVerify,
}: StatusCellProps) {
	if (!status || !status.enabled) {
		return (
			<div className="text-[11px] text-white-400/30">
				{status ? "Disabled" : "Not configured"}
			</div>
		);
	}

	const displayStatus = isIngesting ? "running" : status.status;
	const metadata = getContentStatusMetadata(status.metadata, contentType);

	// Format metadata info
	let metadataInfo = "";
	if (metadata) {
		if (contentType === "blob" && "lastIngestedCommitSha" in metadata) {
			metadataInfo = metadata.lastIngestedCommitSha
				? `${metadata.lastIngestedCommitSha.substring(0, 7)}`
				: "";
		} else if (
			contentType === "pull_request" &&
			"lastIngestedPrNumber" in metadata
		) {
			metadataInfo = metadata.lastIngestedPrNumber
				? `#${metadata.lastIngestedPrNumber}`
				: "";
		}
	}

	return (
		<div className="space-y-1">
			{/* Status Badge */}
			<div className="flex items-center gap-2">
				<SyncStatusBadge
					status={displayStatus}
					onVerify={
						status.status === "failed" &&
						status.errorCode === "DOCUMENT_NOT_FOUND" &&
						onVerify
							? onVerify
							: undefined
					}
				/>
				{metadataInfo && (
					<span className="text-[10px] text-white-400/40">{metadataInfo}</span>
				)}
			</div>

			{/* Sync time */}
			{status.lastSyncedAt && (
				<div className="text-[10px] text-white-400/40">
					{getRelativeTimeString(new Date(status.lastSyncedAt))}
				</div>
			)}

			{/* Error message */}
			{status.status === "failed" && status.errorCode && (
				<div className="text-[10px] text-red-400">
					{getErrorMessage(status.errorCode as DocumentLoaderErrorCode)}
					{status.retryAfter &&
						` • ${formatRetryTime(new Date(status.retryAfter))}`}
				</div>
			)}

			{/* Running progress */}
			{displayStatus === "running" && (
				<div className="text-[10px] text-blue-400 animate-pulse">
					Syncing...
				</div>
			)}
		</div>
	);
}

const STATUS_CONFIG = {
	idle: { dotColor: "bg-[#B8E8F4]", label: "Idle" },
	running: { dotColor: "bg-[#39FF7F] animate-custom-pulse", label: "Running" },
	completed: { dotColor: "bg-[#39FF7F]", label: "Ready" },
	failed: { dotColor: "bg-[#FF3D71]", label: "Error" },
} as const;

function SyncStatusBadge({
	status,
	onVerify,
}: {
	status: GitHubRepositoryIndexStatus;
	onVerify?: () => void;
}) {
	const config = STATUS_CONFIG[status] ?? {
		dotColor: "bg-gray-500",
		label: "unknown",
	};

	const badgeContent = (
		<>
			<div className={`w-2 h-2 rounded-full ${config.dotColor} shrink-0`} />
			<span className="text-black-400 text-[11px] leading-[14px] font-medium font-geist flex-1 text-center ml-1">
				{config.label}
			</span>
			{status === "failed" && onVerify && (
				<span className="text-[#1663F3] text-[10px] ml-0.5">↗</span>
			)}
		</>
	);

	if (onVerify) {
		return (
			<button
				type="button"
				onClick={onVerify}
				className="flex items-center px-1.5 py-0.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors duration-200"
			>
				{badgeContent}
			</button>
		);
	}

	return (
		<div className="flex items-center px-1.5 py-0.5 rounded-full border border-white/20 w-fit">
			{badgeContent}
		</div>
	);
}
