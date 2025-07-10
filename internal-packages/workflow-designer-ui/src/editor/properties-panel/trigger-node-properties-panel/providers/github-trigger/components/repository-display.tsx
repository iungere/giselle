import React from "react";
import { GitHubRepositoryBlock } from "../../../ui/common/repository-block";

export interface RepositoryDisplayProps {
  /**
   * The owner (user or organization) of the repository
   */
  owner: string;

  /**
   * The repository name
   */
  repo: string;

  /**
   * Whether the repository is private
   */
  isPrivate?: boolean;

  /**
   * Optional class name to apply to the container
   */
  className?: string;
}

/**
 * A consistent component to display GitHub repository information
 * Used across different steps of the setup wizard to maintain visual consistency
 */
export function RepositoryDisplay({
  owner,
  repo,
  isPrivate = false,
  className = "",
}: RepositoryDisplayProps) {
  return (
    <div className={className}>
      <p className="text-[14px] text-[#F7F9FD]">Repository</p>
      <div className="flex items-center px-[4px]">
        <GitHubRepositoryBlock owner={owner} repo={repo} />
        {isPrivate && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white-400">
            Private
          </span>
        )}
      </div>
    </div>
  );
}
