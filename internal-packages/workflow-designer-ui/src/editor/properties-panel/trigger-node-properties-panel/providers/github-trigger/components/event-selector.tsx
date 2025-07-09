import React from "react";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import { getTriggerIcon, ArrowRightIcon } from "./icons";

interface EventSelectorProps {
  onSelectEvent: (eventId: GitHubTriggerEventId) => void;
}

export function EventSelector({ onSelectEvent }: EventSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-[4px] flex-1 overflow-hidden">
      <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
      <div className="flex flex-col gap-[20px] overflow-y-auto pr-2 pt-[12px] custom-scrollbar flex-1">
        {Object.entries(githubTriggers).map(([id, githubTrigger]) => (
          <button
            key={id}
            type="button"
            className="flex items-center py-0 px-0 rounded-lg group w-full h-[36px]"
            onClick={() => {
              onSelectEvent(id as GitHubTriggerEventId);
            }}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="bg-white/10 p-2 rounded-lg mr-3 group-hover:bg-white/20 transition-colors flex-shrink-0 flex items-center justify-center">
                {getTriggerIcon(id as GitHubTriggerEventId)}
              </div>
              <div className="flex flex-col text-left overflow-hidden min-w-0">
                <span className="text-white-800 font-medium text-[14px] truncate">
                  {githubTrigger.event.label}
                </span>
                <span className="text-white-400 text-[12px] truncate group-hover:text-white-300 transition-colors">
                  {`Trigger when ${githubTrigger.event.label.toLowerCase()} in your repository`}
                </span>
              </div>
            </div>
            <ArrowRightIcon />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Determines if a trigger type requires a callsign
 */
export function isTriggerRequiringCallsign(eventId: GitHubTriggerEventId): boolean {
  return [
    "github.issue_comment.created",
    "github.pull_request_comment.created",
    "github.pull_request_review_comment.created",
  ].includes(eventId);
}
