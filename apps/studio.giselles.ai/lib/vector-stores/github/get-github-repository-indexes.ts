import { and, eq } from "drizzle-orm";
import {
	db,
	githubRepositoryContentStatus,
	githubRepositoryIndex,
} from "@/drizzle";

type GitHubRepositoryIndex = {
	id: string;
	name: string;
	owner: string;
	repo: string;
	availableContentTypes: ("blob" | "pull_request")[];
};

export async function getGitHubRepositoryIndexes(
	teamDbId: number,
): Promise<GitHubRepositoryIndex[]> {
	// Provide mock data for local development
	if (
		process.env.NODE_ENV === "development" &&
		process.env.USE_MOCK_GITHUB_DATA === "true"
	) {
		return [
			{
				id: "mock-repo-1",
				name: "giselles-ai/giselle",
				owner: "giselles-ai",
				repo: "giselle",
				availableContentTypes: ["blob", "pull_request"],
			},
			{
				id: "mock-repo-2",
				name: "vercel/next.js",
				owner: "vercel",
				repo: "next.js",
				availableContentTypes: ["blob"],
			},
			{
				id: "mock-repo-3",
				name: "facebook/react",
				owner: "facebook",
				repo: "react",
				availableContentTypes: ["pull_request"],
			},
		];
	}

	const repositories = await db
		.select({
			id: githubRepositoryIndex.id,
			owner: githubRepositoryIndex.owner,
			repo: githubRepositoryIndex.repo,
			contentType: githubRepositoryContentStatus.contentType,
		})
		.from(githubRepositoryIndex)
		.innerJoin(
			githubRepositoryContentStatus,
			eq(
				githubRepositoryContentStatus.repositoryIndexDbId,
				githubRepositoryIndex.dbId,
			),
		)
		.where(
			and(
				eq(githubRepositoryIndex.teamDbId, teamDbId),
				eq(githubRepositoryContentStatus.status, "completed"),
				eq(githubRepositoryContentStatus.enabled, true),
			),
		);

	// Group by repository and collect available content types
	const repoMap = new Map<string, GitHubRepositoryIndex>();

	for (const repo of repositories) {
		const key = `${repo.owner}/${repo.repo}`;
		const existing = repoMap.get(key);

		if (existing) {
			if (!existing.availableContentTypes.includes(repo.contentType)) {
				existing.availableContentTypes.push(repo.contentType);
			}
		} else {
			repoMap.set(key, {
				id: repo.id,
				name: key,
				owner: repo.owner,
				repo: repo.repo,
				availableContentTypes: [repo.contentType],
			});
		}
	}

	return Array.from(repoMap.values());
}
