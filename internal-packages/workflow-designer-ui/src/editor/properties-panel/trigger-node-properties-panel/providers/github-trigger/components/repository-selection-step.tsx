import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import type { GitHubIntegrationInstallation } from "@giselle-sdk/giselle-engine";
import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectRepository } from "../../../../ui";
import { GitHubRepositoryBlock } from "../../../ui/common/repository-block";
import { EventTypeDisplay } from "./event-type-display";

interface Repository {
  id: number;
  name: string;
  node_id: string;
  private: boolean;
  owner: {
    login: string;
  };
}

interface RepositorySelectionStepProps {
  installations: GitHubIntegrationInstallation[];
  installationUrl: string;
  eventId: GitHubTriggerEventId;
  onBack: () => void;
  onContinue: (params: {
    eventId: GitHubTriggerEventId;
    installationId: number;
    owner: string;
    repo: string;
    repoNodeId: string;
    requiresCallsign: boolean;
  }) => void;
  /** このコンポーネントが通常のフロー用かテスト用か */
  isForTest?: boolean;
  defaultInstallationId?: number;
  defaultOwner?: string;
  defaultRepo?: string;
  defaultRepoNodeId?: string;
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

export function RepositorySelectionStep({
  installations,
  installationUrl,
  eventId,
  onBack,
  onContinue,
  defaultInstallationId,
  defaultOwner,
  defaultRepo,
  defaultRepoNodeId,
  isForTest = false,
}: RepositorySelectionStepProps) {
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    number | null
  >(defaultInstallationId || null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<{
    owner: string;
    repo: string;
    repoNodeId: string;
  } | null>(
    defaultOwner && defaultRepo && defaultRepoNodeId
      ? {
          owner: defaultOwner,
          repo: defaultRepo,
          repoNodeId: defaultRepoNodeId,
        }
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get repositories for selected installation
  const repositories = useMemo(() => {
    if (selectedInstallationId === null) {
      return undefined;
    }
    const installation = installations.find(
      (installation) => installation.id === selectedInstallationId,
    );
    if (installation === undefined) {
      return undefined;
    }
    return installation.repositories;
  }, [selectedInstallationId, installations]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrgDropdownOpen(false);
      }
    };

    if (isOrgDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOrgDropdownOpen]);

  // Handle repository selection
  const handleSelectRepository = useCallback(
    (value: {
      installationId: number;
      owner: string;
      repo: string;
      repoNodeId: string;
    }) => {
      setSelectedRepository({
        owner: value.owner,
        repo: value.repo,
        repoNodeId: value.repoNodeId,
      });
      setSelectedInstallationId(value.installationId);
    },
    [],
  );

  // Open installation URL in popup
  const openInstallationPopup = useCallback(() => {
    const width = 800;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      installationUrl,
      "Configure GitHub App",
      `width=${width},height=${height},top=${top},left=${left},popup=1`,
    );
  }, [installationUrl]);

  return (
    <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar h-full relative">
      <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
      <div className="flex items-center py-0 px-[4px] rounded-lg w-full h-[36px] mb-4">
        <div className="p-2 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
          {/* Icon for the event type would be rendered here */}
          <span className="text-white-800 font-medium text-[14px]">
            {githubTriggers[eventId].event.label}
          </span>
        </div>
      </div>

      <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Organization</p>
      <div className="px-[4px] py-[8px]">
        <SelectRepository
          installations={installations}
          installationUrl={installationUrl}
          onSelectRepository={(value, setLoading) => {
            setLoading(true);
            handleSelectRepository(value);
            setLoading(false);
          }}
        />
      </div>

      {/* Repository information display if selected */}
      {selectedRepository && (
        <div className="mt-4">
          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Repository</p>
          <div className="px-[4px]">
            <GitHubRepositoryBlock
              owner={selectedRepository.owner}
              repo={selectedRepository.repo}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {selectedRepository && (
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
              if (!selectedInstallationId || !selectedRepository) return;

              const requiresCallsign = isTriggerRequiringCallsign(eventId);

              onContinue({
                eventId,
                installationId: selectedInstallationId,
                owner: selectedRepository.owner,
                repo: selectedRepository.repo,
                repoNodeId: selectedRepository.repoNodeId,
                requiresCallsign,
              });
            }}
          >
            {isTriggerRequiringCallsign(eventId) ? "Continue" : "Set Up"}
          </button>
        </div>
      )}

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
