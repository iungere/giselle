import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { githubTriggerIdToLabel } from "@giselle-sdk/flow";
import clsx from "clsx/lite";
import { UserIcon } from "lucide-react";
import ClipboardButton from "../../../../../ui/clipboard-button";
import { useGitHubTrigger } from "../../../../lib/use-github-trigger";
import { GitHubRepositoryBlock } from "../";

export function GitHubTriggerConfiguredView({
  flowTriggerId,
}: {
  flowTriggerId: FlowTriggerId;
}) {
  const { isLoading, data, enableFlowTrigger, disableFlowTrigger } =
    useGitHubTrigger(flowTriggerId);
  if (isLoading) {
    return "Loading...";
  }
  if (data === undefined) {
    return "No Data";
  }

  return (
    <div className="flex flex-col gap-[16px] p-0 overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between">
          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">State</p>

          {/* Divider */}
          <div className="flex-grow mx-[12px] h-[1px] bg-black-200/30" />

          <div className="relative">
            {/* Background container */}
            <div className="w-[150px] h-[28px] bg-[#2A2A36] rounded-full flex items-center overflow-hidden">
              {/* Sliding highlight */}
              <div
                className={clsx(
                  "absolute w-[75px] h-[28px] rounded-full transition-transform duration-300 ease-in-out",
                  data.trigger.enable
                    ? "translate-x-[75px] bg-primary-900"
                    : "translate-x-0 bg-[#3F3F4A]",
                )}
              />

              {/* Button labels - always visible, change opacity based on state */}
              <div className="absolute inset-0 flex">
                <button
                  type="button"
                  onClick={disableFlowTrigger}
                  className="flex-1 flex items-center justify-center px-0.5"
                >
                  <span
                    className={clsx(
                      "text-[12px] font-medium transition-colors duration-200",
                      !data.trigger.enable ? "text-white" : "text-white/40",
                    )}
                  >
                    Disabled
                  </span>
                </button>
                <button
                  type="button"
                  onClick={enableFlowTrigger}
                  className="flex-1 flex items-center justify-center px-0.5"
                >
                  <span
                    className={clsx(
                      "text-[12px] font-medium transition-colors duration-200",
                      data.trigger.enable
                        ? "text-white font-semibold"
                        : "text-white/40",
                    )}
                  >
                    Enable
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-[4px] mt-4">
        <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
        <div className="px-[16px] py-[9px] w-full bg-transparent text-[14px] flex items-center">
          <div className="pr-0 p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
            {data.trigger.configuration.event.id === "github.issue.created" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24.79 22.6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g>
                  <path
                    d="M.78,6.93h2.02l2.52,5.39,.14,.3h.06v-5.69h1.48v8.74h-1.88l-2.61-5.44-.19-.42h-.07v5.86H.78V6.93Z"
                    fill="white"
                    stroke="white"
                    strokeMiterlimit="10"
                    strokeWidth=".5"
                  />
                  <path
                    d="M8.1,6.93h5.48v1.71h-3.94v1.8h3.41v1.58h-3.41v1.93h3.92v1.71h-5.46V6.93Z"
                    fill="white"
                    stroke="white"
                    strokeMiterlimit="10"
                    strokeWidth=".5"
                  />
                  <path
                    d="M14.66,6.93h1.57l.8,5.65.22,1.19h.07l1.09-6.84h1.91l1.08,6.84h.07l.19-1.12,.8-5.72h1.56l-1.42,8.74h-2.22l-.87-5.41-.11-.66h-.07l-.09,.66-.89,5.41h-2.23l-1.46-8.74Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                    strokeWidth=".5"
                  />
                </g>
                <rect width="24.79" height="2.24" fill="currentColor" />
                <rect
                  y="20.36"
                  width="24.79"
                  height="2.24"
                  fill="currentColor"
                />
              </svg>
            )}
            {data.trigger.configuration.event.id === "github.issue.closed" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M7 12.5L10.5 16L17 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {data.trigger.configuration.event.id ===
              "github.issue_comment.created" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 31.24 28.32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M15.62,0C7.01,0,0,5.5,0,12.26c0,4.53,3.2,8.68,8.23,10.8-.06,1.71-.39,2.21-.47,2.3-.91,1.09-.46,2.06-.06,2.46.33.33.73.5,1.25.5.72,0,1.66-.32,2.96-.97.88-.44,2.56-1.37,4.38-2.85,8.29-.28,14.94-5.68,14.94-12.24S24.23,0,15.62,0ZM15.73,21.51h-.54s-.42.36-.42.36c-1.29,1.09-2.58,1.92-3.63,2.5.09-.69.12-1.48.09-2.38l-.02-1.04-.98-.34c-4.39-1.54-7.23-4.82-7.23-8.35C3,7.15,8.66,3,15.62,3s12.62,4.15,12.62,9.26-5.61,9.21-12.51,9.25Z"
                  fill="currentColor"
                />
                <path
                  d="M21.64,8.72h-12.05c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h12.05c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {data.trigger.configuration.event.id ===
              "github.pull_request.opened" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 28.81 28.68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M0 28.68H28.81V0H0V28.68Z" fill="currentColor" />
              </svg>
            )}
            {data.trigger.configuration.event.id ===
              "github.pull_request.closed" && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M7 12.5L10.5 16L17 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {![
              "github.issue.created",
              "github.issue.closed",
              "github.issue_comment.created",
              "github.pull_request.opened",
              "github.pull_request.closed",
            ].includes(data.trigger.configuration.event.id) && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M0 24H24V0H0V24Z" fill="currentColor" />
              </svg>
            )}
          </div>
          <span className="pl-2">
            {githubTriggerIdToLabel(data.trigger.configuration.event.id)}
          </span>
        </div>
      </div>

      <div className="space-y-[4px]">
        <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Repository</p>
        <div className="px-[12px] pt-[6px]">
          <GitHubRepositoryBlock
            owner={data.githubRepositoryFullname.owner}
            repo={data.githubRepositoryFullname.repo}
            isPrivate={data.githubRepositoryFullname.isPrivate ?? true}
          />
        </div>
      </div>
      {(data.trigger.configuration.event.id ===
        "github.issue_comment.created" ||
        data.trigger.configuration.event.id ===
          "github.pull_request_comment.created" ||
        data.trigger.configuration.event.id ===
          "github.pull_request_review_comment.created") && (
        <div>
          <div className="space-y-[4px]">
            <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Call sign</p>
            <div className="px-[16px] py-[9px] w-full bg-transparent text-[14px] flex items-center gap-[8px]">
              <span>
                /{data.trigger.configuration.event.conditions.callsign}
              </span>
              <ClipboardButton
                text={`/${data.trigger.configuration.event.conditions.callsign}`}
                className="text-black-400 hover:text-black-300"
                sizeClassName="h-[16px] w-[16px]"
              />
            </div>
          </div>
          <div className="border border-black-800 rounded-[4px] overflow-hidden ml-[16px] pointer-events-none">
            <div className="bg-black-850 p-[8px] border-b border-black-800">
              <h3 className="text-[14px] text-black-300">
                GitHub Usage Example
              </h3>
            </div>
            <div className="p-4 bg-[#0d1117] flex gap-[8px]">
              <div>
                <div className="rounded-full bg-black-800 p-[6px]">
                  <UserIcon className="size-[18px]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h2 className="text-[16px]">Add a comment</h2>
                </div>
                <div className="border border-[#30363d] rounded-md overflow-hidden">
                  {/* Tab Navigation */}
                  <div className="border-b border-[#30363d] bg-[#161b22] flex">
                    <div className="border-b-2 border-[#f78166] px-4 py-2 text-sm">
                      Write
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-400">
                      Preview
                    </div>
                  </div>

                  <div className="min-h-[150px] p-4 bg-[#0d1117] text-gray-400 border-b border-[#30363d]">
                    /{data.trigger.configuration.event.conditions.callsign}{" "}
                    [enter your request...]
                  </div>

                  <div className="flex items-center justify-end p-[6px] bg-[#161b22]">
                    <div className="px-3 py-1.5 bg-[#238636] text-white text-sm rounded-md">
                      Comment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
