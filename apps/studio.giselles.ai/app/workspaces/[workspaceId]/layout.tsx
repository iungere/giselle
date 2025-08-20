import { WorkspaceId } from "@giselle-sdk/data-type";
import { WorkspaceProvider } from "@giselle-sdk/giselle/react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { db, flowTriggers } from "@/drizzle";
import {
	experimental_storageFlag,
	layoutV3Flag,
	multiEmbeddingFlag,
	runV3Flag,
	stageFlag,
	webSearchActionFlag,
} from "@/flags";
import { getGitHubRepositoryIndexes } from "@/lib/vector-stores/github";
import { getGitHubIntegrationState } from "@/packages/lib/github";
import { getUsageLimitsForTeam } from "@/packages/lib/usage-limits";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workspaceId: string }>;
	children: ReactNode;
}) {
	const workspaceId = WorkspaceId.parse((await params).workspaceId);

	const agent = await db.query.agents.findFirst({
		where: (agents, { eq }) => eq(agents.workspaceId, workspaceId),
	});
	if (agent === undefined) {
		return notFound();
	}
	const gitHubIntegrationState = await getGitHubIntegrationState(agent.dbId);

	const currentUser = await fetchCurrentUser();

	const currentTeam = await fetchCurrentTeam();
	if (currentTeam.dbId !== agent.teamDbId) {
		return notFound();
	}
	const usageLimits = await getUsageLimitsForTeam(currentTeam);
	const gitHubRepositoryIndexes = await getGitHubRepositoryIndexes(
		currentTeam.dbId,
	);
	const runV3 = await runV3Flag();
	const webSearchAction = await webSearchActionFlag();
	const layoutV3 = await layoutV3Flag();
	const experimental_storage = await experimental_storageFlag();
	const stage = await stageFlag();
	const multiEmbedding = await multiEmbeddingFlag();
	// return children
	return (
		<WorkspaceProvider
			workspaceId={workspaceId}
			integration={{
				value: {
					github: gitHubIntegrationState,
				},
				refresh: async () => {
					"use server";
					return { github: await getGitHubIntegrationState(agent.dbId) };
				},
			}}
			vectorStore={{
				githubRepositoryIndexes: gitHubRepositoryIndexes,
				settingPath: "/settings/team/vector-stores",
			}}
			usageLimits={usageLimits}
			telemetry={{
				metadata: {
					isProPlan: isProPlan(currentTeam),
					teamType: currentTeam.type,
					userId: currentUser.id,
					subscriptionId: currentTeam.activeSubscriptionId ?? "",
				},
			}}
			featureFlag={{
				runV3,
				webSearchAction,
				layoutV3,
				experimental_storage,
				stage,
				multiEmbedding,
			}}
			flowTrigger={{
				callbacks: {
					flowTriggerUpdate: async (flowTrigger) => {
						"use server";
						await db
							.insert(flowTriggers)
							.values({
								teamDbId: currentTeam.dbId,
								sdkFlowTriggerId: flowTrigger.id,
								sdkWorkspaceId: flowTrigger.workspaceId,
								staged:
									flowTrigger.configuration.provider === "manual" &&
									flowTrigger.configuration.staged,
							})
							.onConflictDoUpdate({
								target: flowTriggers.dbId,
								set: {
									staged:
										flowTrigger.configuration.provider === "manual" &&
										flowTrigger.configuration.staged,
								},
							});
					},
				},
			}}
		>
			{children}
		</WorkspaceProvider>
	);
}
