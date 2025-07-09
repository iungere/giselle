import {
  type GitHubFlowTriggerEvent,
  type Output,
  OutputId,
  type TriggerNode,
} from "@giselle-sdk/data-type";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import type { GitHubIntegrationInstallation } from "@giselle-sdk/giselle-engine";
import {
  useFeatureFlag,
  useGiselleEngine,
  useIntegration,
  useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import clsx from "clsx/lite";
import { InfoIcon } from "lucide-react";
import {
  type FormEventHandler,
  useCallback,
  useState,
  useTransition,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../ui/select";
import { Tooltip } from "../../../../../ui/tooltip";
import { SelectRepository } from "../../../ui";
import { GitHubRepositoryBlock, GitHubTriggerConfiguredView } from "../../ui";
import { InstallGitHubApplication } from "./components/install-application";
import { Unauthorized } from "./components/unauthorized";

export function GitHubTriggerPropertiesPanel({ node }: { node: TriggerNode }) {
  const { value } = useIntegration();

  if (node.content.state.status === "configured") {
    return (
      <GitHubTriggerConfiguredView
        flowTriggerId={node.content.state.flowTriggerId}
      />
    );
  }

  if (value?.github === undefined) {
    return "unset";
  }
  switch (value.github.status) {
    case "unset":
      return "unset";
    case "unauthorized":
      return <Unauthorized authUrl={value.github.authUrl} />;
    case "not-installed":
      return (
        <InstallGitHubApplication
          installationUrl={value.github.installationUrl}
        />
      );
    case "invalid-credential":
      return "invalid-credential";
    case "installed":
      return (
        <Installed
          installations={value.github.installations}
          node={node}
          installationUrl={value.github.installationUrl}
        />
      );
    case "error":
      return `GitHub integration error: ${value.github.errorMessage}`;
    default: {
      const _exhaustiveCheck: never = value.github;
      throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
    }
  }
}

interface SelectEventStep {
  state: "select-event";
}
interface SelectRepositoryStep {
  state: "select-repository";
  eventId: GitHubTriggerEventId;
}
interface InputCallsignStep {
  state: "input-callsign";
  eventId: GitHubTriggerEventId;
  owner: string;
  repo: string;
  repoNodeId: string;
  installationId: number;
}
export type GitHubTriggerSetupStep =
  | SelectEventStep
  | SelectRepositoryStep
  | InputCallsignStep;

function Installed({
  installations,
  node,
  installationUrl,
}: {
  installations: GitHubIntegrationInstallation[];
  node: TriggerNode;
  installationUrl: string;
}) {
  const { experimental_storage } = useFeatureFlag();
  const [step, setStep] = useState<GitHubTriggerSetupStep>({
    state: "select-event",
  });
  const { data: workspace, updateNodeData } = useWorkflowDesigner();
  const client = useGiselleEngine();
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState<GitHubTriggerEventId>(
    "github.issue.created",
  );
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (step.state !== "input-callsign") {
        throw new Error("Unexpected state");
      }
      let event: GitHubFlowTriggerEvent | undefined;
      const formData = new FormData(e.currentTarget);
      switch (eventId) {
        case "github.issue.created":
        case "github.issue.closed":
        case "github.pull_request.ready_for_review":
        case "github.pull_request.closed":
        case "github.pull_request.opened":
          event = {
            id: eventId,
          };
          break;
        case "github.issue_comment.created": {
          const callsign = formData.get("callsign");
          if (typeof callsign !== "string" || callsign.length === 0) {
            throw new Error("Unexpected request");
          }
          event = {
            id: "github.issue_comment.created",
            conditions: {
              callsign,
            },
          };
          break;
        }
        case "github.pull_request_comment.created": {
          const callsign = formData.get("callsign");
          if (typeof callsign !== "string" || callsign.length === 0) {
            throw new Error("Unexpected request");
          }
          event = {
            id: "github.pull_request_comment.created",
            conditions: {
              callsign,
            },
          };
          break;
        }
        case "github.pull_request_review_comment.created": {
          const callsign = formData.get("callsign");
          if (typeof callsign !== "string" || callsign.length === 0) {
            throw new Error("Unexpected request");
          }
          event = {
            id: "github.pull_request_review_comment.created",
            conditions: {
              callsign,
            },
          };
          break;
        }
        default: {
          const _exhaustiveCheck: never = eventId;
          throw new Error(`Unhandled eventId: ${_exhaustiveCheck}`);
        }
      }
      if (event === undefined) {
        return;
      }
      const trigger = githubTriggers[event.id];
      const outputs: Output[] = [];
      for (const key of trigger.event.payloads.keyof().options) {
        outputs.push({
          id: OutputId.generate(),
          label: key,
          accessor: key,
        });
      }

      startTransition(async () => {
        const { triggerId } = await client.configureTrigger({
          trigger: {
            nodeId: node.id,
            workspaceId: workspace?.id,
            enable: false,
            configuration: {
              provider: "github",
              repositoryNodeId: step.repoNodeId,
              installationId: step.installationId,
              event,
            },
          },
          useExperimentalStorage: experimental_storage,
        });
        updateNodeData(node, {
          content: {
            ...node.content,
            state: {
              status: "configured",
              flowTriggerId: triggerId,
            },
          },
          outputs: [...node.outputs, ...outputs],
          name: `On ${trigger.event.label}`,
        });
      });
    },
    [workspace?.id, client.configureTrigger, node, updateNodeData, step],
  );

  return (
    <div className="flex flex-col gap-[16px] h-full">
      {step.state === "select-event" && (
        <div className="w-full flex flex-col gap-[4px] flex-1 overflow-hidden">
          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
          <div className="flex flex-col gap-[20px] overflow-y-auto pr-2 pt-[12px] custom-scrollbar flex-1">
            {Object.entries(githubTriggers).map(([id, githubTrigger]) => (
              <button
                key={id}
                type="button"
                className="flex items-center py-0 px-0 rounded-lg group w-full h-[36px]"
                onClick={() => {
                  setEventId(id as GitHubTriggerEventId);
                  setStep({
                    state: "select-repository",
                    eventId: id as GitHubTriggerEventId,
                  });
                }}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="bg-white/10 p-2 rounded-lg mr-3 group-hover:bg-white/20 transition-colors flex-shrink-0 flex items-center justify-center">
                    {id === "github.issue.created" && (
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
                    {id === "github.issue.closed" && (
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
                    {id === "github.issue_comment.created" && (
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
                        <path
                          d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {id === "github.pull_request_comment.created" && (
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
                        <path
                          d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {id === "github.pull_request_review_comment.created" && (
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
                          d="M19.4,8.66l-4.8,5.1-2.79-2.79c-.59-.59-1.54-.59-2.12,0-.59.58-.59,1.53,0,2.12l3.88,3.89c.28.28.66.44,1.06.44h.02c.41,0,.79-.18,1.07-.47l5.86-6.23c.57-.6.54-1.55-.06-2.12-.6-.57-1.55-.54-2.12.06Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {id === "github.pull_request.opened" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 28.81 28.68"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                      >
                        <path
                          d="M12.37,18.31c-.59-.59-1.54-.59-2.12,0-.59.59-.59,1.54,0,2.12l1.38,1.38h-5.33v-10.37c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v11.87c0,.83.67,1.5,1.5,1.5h6.31l-1.31,1.31c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l4.13-4.13c.59-.59.59-1.54,0-2.12l-3.68-3.68ZM4.79,5.11c.99,0,1.79.8,1.79,1.79s-.8,1.79-1.79,1.79-1.79-.81-1.79-1.79.81-1.79,1.79-1.79Z"
                          fill="currentColor"
                        />
                        <path
                          d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.8-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {id === "github.pull_request.ready_for_review" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 28.81 26.63"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                      >
                        <path
                          d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6.29,17.29v-5.85c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v5.89c-1.87.65-3.23,2.42-3.23,4.51,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.14-1.42-3.94-3.36-4.55ZM3,6.91c0-.99.8-1.79,1.79-1.79s1.79.8,1.79,1.79-.81,1.79-1.79,1.79-1.79-.81-1.79-1.79ZM4.86,23.63c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.8,1.79,1.79-.8,1.79-1.79,1.79Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {id === "github.pull_request.closed" && (
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
                      "github.pull_request_comment.created",
                      "github.pull_request_review_comment.created",
                      "github.pull_request.opened",
                      "github.pull_request.ready_for_review",
                      "github.pull_request.closed",
                    ].includes(id) && (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.646.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden min-w-0">
                    <span className="text-white-800 font-medium text-[14px] truncate">
                      {githubTrigger.event.label}
                    </span>
                    <span className="text-white-400 text-[12px] truncate group-hover:text-white-300 transition-colors">
                      {githubTrigger.event.description ||
                        `Trigger when ${githubTrigger.event.label.toLowerCase()} in your repository`}
                    </span>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white-600 group-hover:text-white-500 transition-colors flex-shrink-0 absolute right-4"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
      {step.state === "select-repository" && (
        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar h-full relative">
          <p className="text-[14px] py-[1.5px] mb-[8px] text-[#F7F9FD]">
            Event Type
          </p>
          <div className="flex items-center py-0 px-0 rounded-lg w-full h-[36px] mb-4">
            <div className="mr-3 pl-2">
              {step.eventId === "github.issue.created" && (
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
                      d="M14.66,6.93h1.57l.8,5.65,.22,1.19h.07l1.09-6.84h1.91l1.08,6.84h.07l.19-1.12,.8-5.72h1.56l-1.42,8.74h-2.22l-.87-5.41-.11-.66h-.07l-.09,.66-.89,5.41h-2.23l-1.46-8.74Z"
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
              {step.eventId === "github.issue.closed" && (
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
              {step.eventId === "github.issue_comment.created" && (
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
                  <path
                    d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request_comment.created" && (
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
                  <path
                    d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId ===
                "github.pull_request_review_comment.created" && (
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
                    d="M19.4,8.66l-4.8,5.1-2.79-2.79c-.59-.59-1.54-.59-2.12,0-.59.58-.59,1.53,0,2.12l3.88,3.89c.28.28.66.44,1.06.44h.02c.41,0,.79-.18,1.07-.47l5.86-6.23c.57-.6.54-1.55-.06-2.12-.6-.57-1.55-.54-2.12.06Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.opened" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 28.81 28.68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12.37,18.31c-.59-.59-1.54-.59-2.12,0-.59.59-.59,1.54,0,2.12l1.38,1.38h-5.33v-10.37c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v11.87c0,.83.67,1.5,1.5,1.5h6.31l-1.31,1.31c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l4.13-4.13c.59-.59.59-1.54,0-2.12l-3.68-3.68ZM4.79,5.11c.99,0,1.79.8,1.79,1.79s-.8,1.79-1.79,1.79-1.79-.81-1.79-1.79.81-1.79,1.79-1.79Z"
                    fill="currentColor"
                  />
                  <path
                    d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.8-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.ready_for_review" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 28.81 26.63"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6.29,17.29v-5.85c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v5.89c-1.87.65-3.23,2.42-3.23,4.51,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.14-1.42-3.94-3.36-4.55ZM3,6.91c0-.99.8-1.79,1.79-1.79s1.79.8,1.79,1.79-.81,1.79-1.79,1.79-1.79-.81-1.79-1.79ZM4.86,23.63c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.8,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.closed" && (
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
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white-800 font-medium text-[14px] truncate">
                {githubTriggers[step.eventId].event.label}
              </span>
            </div>
          </div>

          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Organization</p>
          <SelectRepository
            installations={installations}
            installationUrl={installationUrl}
            onSelectRepository={(
              value: {
                installationId: number;
                owner: string;
                repo: string;
                repoNodeId: string;
              },
              setLoading: (loading: boolean) => void,
            ) => {
              setLoading(true);
              // If the selected event is a comment type and requires a callsign, proceed to callsign input step
              if (
                step.eventId === "github.issue_comment.created" ||
                step.eventId === "github.pull_request_comment.created" ||
                step.eventId === "github.pull_request_review_comment.created"
              ) {
                setStep({
                  state: "input-callsign",
                  eventId: step.eventId,
                  installationId: value.installationId,
                  owner: value.owner,
                  repo: value.repo,
                  repoNodeId: value.repoNodeId,
                });
              } else {
                // If callsign is not required, directly execute trigger configuration
                startTransition(async () => {
                  try {
                    const event = { id: step.eventId };
                    const trigger = githubTriggers[step.eventId];
                    const outputs: Output[] = [];
                    for (const key of trigger.event.payloads.keyof().options) {
                      outputs.push({
                        id: OutputId.generate(),
                        label: key,
                        accessor: key,
                      });
                    }

                    const { triggerId } = await client.configureTrigger({
                      trigger: {
                        nodeId: node.id,
                        workspaceId: workspace?.id,
                        enable: false,
                        configuration: {
                          provider: "github",
                          repositoryNodeId: value.repoNodeId,
                          installationId: value.installationId,
                          event,
                        },
                      },
                      useExperimentalStorage: experimental_storage,
                    });
                    updateNodeData(node, {
                      content: {
                        ...node.content,
                        state: {
                          status: "configured",
                          flowTriggerId: triggerId,
                        },
                      },
                      outputs: [...node.outputs, ...outputs],
                      name: `On ${trigger.event.label}`,
                    });
                  } finally {
                    setLoading(false);
                  }
                });
              }
            }}
          />
        </div>
      )}
      {step.state === "input-callsign" && (
        <form
          className="w-full flex flex-col gap-[12px] overflow-y-auto flex-1 pr-2 custom-scrollbar"
          onSubmit={handleSubmit}
        >
          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
          <div className="px-[16px] py-[9px] w-full bg-transparent text-[14px] flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center">
              {step.eventId === "github.issue.created" && (
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
                      d="M14.66,6.93h1.57l.8,5.65,.22,1.19h.07l1.09-6.84h1.91l1.08,6.84h.07l.19-1.12,.8-5.72h1.56l-1.42,8.74h-2.22l-.87-5.41-.11-.66h-.07l-.09,.66-.89,5.41h-2.23l-1.46-8.74Z"
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
              {step.eventId === "github.issue.closed" && (
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
              {step.eventId === "github.issue_comment.created" && (
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
                  <path
                    d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request_comment.created" && (
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
                  <path
                    d="M18.5,13.62h-8.91c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h8.91c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId ===
                "github.pull_request_review_comment.created" && (
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
                    d="M19.4,8.66l-4.8,5.1-2.79-2.79c-.59-.59-1.54-.59-2.12,0-.59.58-.59,1.53,0,2.12l3.88,3.89c.28.28.66.44,1.06.44h.02c.41,0,.79-.18,1.07-.47l5.86-6.23c.57-.6.54-1.55-.06-2.12-.6-.57-1.55-.54-2.12.06Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.opened" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 28.81 28.68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M12.37,18.31c-.59-.59-1.54-.59-2.12,0-.59.59-.59,1.54,0,2.12l1.38,1.38h-5.33v-10.37c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v11.87c0,.83.67,1.5,1.5,1.5h6.31l-1.31,1.31c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l4.13-4.13c.59-.59.59-1.54,0-2.12l-3.68-3.68ZM4.79,5.11c.99,0,1.79.8,1.79,1.79s-.8,1.79-1.79,1.79-1.79-.81-1.79-1.79.81-1.79,1.79-1.79Z"
                    fill="currentColor"
                  />
                  <path
                    d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.8-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.ready_for_review" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 28.81 26.63"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M25.51,17.24V5.37c0-.83-.67-1.5-1.5-1.5h-6.31l1.31-1.31c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-4.13,4.13c-.59.59-.59,1.54,0,2.12l3.68,3.68c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-1.38-1.38h5.33v10.37c-1.91.63-3.29,2.41-3.29,4.53,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.12-1.39-3.9-3.29-4.53ZM24.01,23.57c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.81,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6.29,17.29v-5.85c1.91-.63,3.29-2.41,3.29-4.53,0-2.64-2.15-4.79-4.79-4.79S0,4.27,0,6.91c0,2.12,1.39,3.9,3.29,4.53v5.89c-1.87.65-3.23,2.42-3.23,4.51,0,2.64,2.15,4.79,4.79,4.79s4.79-2.15,4.79-4.79c0-2.14-1.42-3.94-3.36-4.55ZM3,6.91c0-.99.8-1.79,1.79-1.79s1.79.8,1.79,1.79-.81,1.79-1.79,1.79-1.79-.81-1.79-1.79ZM4.86,23.63c-.99,0-1.79-.8-1.79-1.79s.81-1.79,1.79-1.79,1.79.8,1.79,1.79-.8,1.79-1.79,1.79Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {step.eventId === "github.pull_request.closed" && (
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
            </div>
            <div className="flex flex-col min-w-0">
              <span className="pl-2 text-white-800 font-medium text-[14px] truncate">
                {githubTriggers[step.eventId].event.label}
              </span>
            </div>
          </div>

          <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Repository</p>
          <GitHubRepositoryBlock owner={step.owner} repo={step.repo} />
          {(eventId === "github.issue_comment.created" ||
            eventId === "github.pull_request_comment.created" ||
            eventId === "github.pull_request_review_comment.created") && (
            <fieldset className="flex flex-col gap-[4px]">
              <div className="flex items-center gap-[4px]">
                <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">
                  Callsign
                </p>
                <Tooltip
                  text={
                    <p className="w-[260px]">
                      Only comments starting with this callsign will trigger the
                      workflow, preventing unnecessary executions from unrelated
                      comments.
                    </p>
                  }
                >
                  <button type="button">
                    <InfoIcon className="size-[16px]" />
                  </button>
                </Tooltip>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-[16px] pointer-events-none">
                  <span className="text-[14px]">/</span>
                </div>
                <input
                  type="text"
                  name="callsign"
                  className={clsx(
                    "group w-full flex justify-between items-center rounded-[8px] py-[8px] pl-[24px] pr-[16px] outline-none focus:outline-none",
                    "border border-white-400 focus:border-white-900",
                    "text-[14px] bg-transparent",
                  )}
                  placeholder="code-review"
                />
              </div>
              <p className="text-[12px] text-white-400 pl-2">
                A callsign is required for issue comment triggers. Examples:
                /code-review, /check-policy
              </p>
            </fieldset>
          )}
          <div className="pt-[8px] flex">
            <button
              type="submit"
              className="w-full bg-primary-900 hover:bg-primary-800 text-white font-medium px-4 py-2 rounded-md text-[14px] transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Setting Up..." : "Set Up"}
            </button>
          </div>
        </form>
      )}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
