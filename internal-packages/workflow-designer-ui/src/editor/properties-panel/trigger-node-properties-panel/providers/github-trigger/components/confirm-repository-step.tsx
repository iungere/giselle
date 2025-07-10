import type { GitHubTriggerEventId } from "@giselle-sdk/flow";
import { githubTriggers } from "@giselle-sdk/flow";
import { EventTypeDisplay } from "./event-type-display";
import { RepositoryDisplay } from "./repository-display";

interface ConfirmRepositoryStepProps {
  eventId: GitHubTriggerEventId;
  installationId: number;
  owner: string;
  repo: string;
  repoNodeId: string;
  onBack: () => void;
  onSetup: (params: {
    eventId: GitHubTriggerEventId;
    installationId: number;
    owner: string;
    repo: string;
    repoNodeId: string;
    requiresCallsign: boolean;
  }) => void;
  /** This is a flag to indicate if the component is being used for testing */
  isForTest?: boolean;
}

/**
 * Determines if a trigger type requires a callsign
 */
function isTriggerRequiringCallsign(eventId: GitHubTriggerEventId): boolean {
  return [
    "github.issue_comment.created",
    "github.pull_request_comment.created",
    "github.pull_request_review_comment.created",
  ].includes(eventId);
}

export function ConfirmRepositoryStep({
  eventId,
  installationId,
  owner,
  repo,
  repoNodeId,
  onBack,
  onSetup,
  isForTest = false,
}: ConfirmRepositoryStepProps) {
  const requiresCallsign = isTriggerRequiringCallsign(eventId);

  return (
    <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar h-full relative">
      <div className="flex flex-col gap-[16px]">
        <EventTypeDisplay eventId={eventId} />
        <RepositoryDisplay owner={owner} repo={repo} />

        <div className="flex gap-[8px] mt-[16px] px-[4px]">
          <button
            type="button"
            className="flex-1 bg-black-700 hover:bg-black-600 text-white font-medium px-4 py-2 rounded-md text-[14px] transition-colors disabled:opacity-50"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="flex-1 bg-primary-900 hover:bg-primary-800 text-white font-medium px-4 py-2 rounded-md text-[14px] transition-colors disabled:opacity-50"
            onClick={() => {
              onSetup({
                eventId,
                installationId,
                owner,
                repo,
                repoNodeId,
                requiresCallsign,
              });
            }}
            disabled={false}
          >
            {/* Show "Continue" when callsign is required, otherwise "Set Up" */}
            {requiresCallsign ? "Continue" : "Set Up"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
