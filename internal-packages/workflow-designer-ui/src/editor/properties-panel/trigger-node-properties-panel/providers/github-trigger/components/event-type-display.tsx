import React from "react";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import { getTriggerIcon } from "./icons";

export interface EventTypeDisplayProps {
  /**
   * The event ID to display
   */
  eventId: GitHubTriggerEventId;

  /**
   * Optional description to show under the event title
   */
  description?: string;

  /**
   * Whether to show the description
   * @default true
   */
  showDescription?: boolean;

  /**
   * Optional class name to apply to the container
   */
  className?: string;
}

/**
 * A consistent component to display GitHub trigger event types
 * Used across different steps of the setup wizard to maintain visual consistency
 */
export function EventTypeDisplay({
  eventId,
  description,
  showDescription = true,
  className = "",
}: EventTypeDisplayProps) {
  const triggerInfo = githubTriggers[eventId];
  const defaultDescription = `Trigger when ${triggerInfo.event.label.toLowerCase()} in your repository`;

  return (
    <div className={className}>
      <p className="text-[14px] text-[#F7F9FD]">Event Type</p>
      <div className="px-[4px] py-[8px] w-full bg-transparent text-[14px] flex items-center">
        <div className="p-2 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
          {getTriggerIcon(eventId)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white-800 font-medium text-[14px] truncate">
            {triggerInfo.event.label}
          </span>
          {showDescription && (description || defaultDescription) && (
            <span className="text-white-400 text-[12px] truncate">
              {description || defaultDescription}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
