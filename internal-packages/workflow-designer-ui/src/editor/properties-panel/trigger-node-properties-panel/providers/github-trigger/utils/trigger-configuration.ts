import type {
  GitHubFlowTriggerEvent,
  Output,
  TriggerNode
} from "@giselle-sdk/data-type";
import { OutputId } from "@giselle-sdk/data-type";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";

/**
 * Creates a GitHubFlowTriggerEvent based on the event ID and optional callsign
 */
export function createTriggerEvent(
  eventId: GitHubTriggerEventId,
  callsign?: string
): GitHubFlowTriggerEvent {
  switch (eventId) {
    case "github.issue.created":
    case "github.issue.closed":
    case "github.pull_request.ready_for_review":
    case "github.pull_request.closed":
    case "github.pull_request.opened":
      return {
        id: eventId,
      };
    case "github.issue_comment.created":
    case "github.pull_request_comment.created":
    case "github.pull_request_review_comment.created":
      if (!callsign || callsign.length === 0) {
        throw new Error("Callsign is required for this trigger type");
      }
      return {
        id: eventId,
        conditions: {
          callsign,
        },
      };
    default: {
      const _exhaustiveCheck: never = eventId;
      throw new Error(`Unhandled eventId: ${_exhaustiveCheck}`);
    }
  }
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

/**
 * Generates the outputs for a given trigger
 */
export function generateTriggerOutputs(eventId: GitHubTriggerEventId): Output[] {
  const trigger = githubTriggers[eventId];
  const outputs: Output[] = [];

  for (const key of trigger.event.payloads.keyof().options) {
    outputs.push({
      id: OutputId.generate(),
      label: key,
      accessor: key,
    });
  }

  return outputs;
}

/**
 * Creates the configuration payload for the trigger
 */
export function createTriggerConfiguration(
  options: {
    nodeId: string;
    workspaceId?: string;
    eventId: GitHubTriggerEventId;
    repositoryNodeId: string;
    installationId: number;
    callsign?: string;
  }
) {
  const { nodeId, workspaceId, eventId, repositoryNodeId, installationId, callsign } = options;
  const event = createTriggerEvent(eventId, callsign);

  return {
    trigger: {
      nodeId,
      workspaceId,
      enable: false,
      configuration: {
        provider: "github" as const,
        repositoryNodeId,
        installationId,
        event,
      },
    },
    outputs: generateTriggerOutputs(eventId),
    name: `On ${githubTriggers[eventId].event.label}`,
  };
}

/**
 * Updates the node data with the configured trigger
 */
export function updateNodeWithTrigger(
  node: TriggerNode,
  triggerId: string,
  outputs: Output[],
  triggerName: string
) {
  return {
    content: {
      ...node.content,
      state: {
        status: "configured" as const,
        flowTriggerId: triggerId,
      },
    },
    outputs: [...node.outputs, ...outputs],
    name: triggerName,
  };
}
