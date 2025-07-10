"use client";

import { GitHubTrigger, GitHubTriggerBadge, EventType } from "./github-trigger-badge";

/**
 * Example component demonstrating how to use the GitHub trigger components
 */
export default function GitHubTriggerExample() {
  return (
    <div className="p-6 flex flex-col gap-8 bg-black/80">
      <h1 className="text-xl font-bold text-white">GitHub Trigger Examples</h1>

      {/* Complete GitHub Trigger with Issue Created event */}
      <div className="border border-white/10 rounded-xl p-4 bg-black/40">
        <h2 className="text-lg font-medium text-white mb-4">Complete Trigger Example</h2>
        <GitHubTrigger eventType="Issue Created" isNew={true} />
      </div>

      {/* Individual components examples */}
      <div className="border border-white/10 rounded-xl p-4 bg-black/40">
        <h2 className="text-lg font-medium text-white mb-4">Individual Components</h2>

        <div className="space-y-6">
          {/* Badge only examples */}
          <div className="space-y-2">
            <h3 className="text-md font-medium text-white/80">Trigger Badge Component</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60 w-24">With NEW badge:</span>
                <GitHubTriggerBadge label="Pull Request" isNew={true} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60 w-24">Without badge:</span>
                <GitHubTriggerBadge label="Issue Comment" />
              </div>
            </div>
          </div>

          {/* Event Type examples */}
          <div className="space-y-2">
            <h3 className="text-md font-medium text-white/80">Event Type Component</h3>
            <div className="p-2 border border-white/10 rounded-md">
              <EventType
                icon={
                  <div className="h-8 w-8 rounded-md bg-blue-600/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                }
              >
                <GitHubTriggerBadge label="Repository Created" isNew={true} />
              </EventType>
            </div>
          </div>
        </div>
      </div>

      {/* Styling variations */}
      <div className="border border-white/10 rounded-xl p-4 bg-black/40">
        <h2 className="text-lg font-medium text-white mb-4">Styling Variations</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-900 rounded-md">
            <GitHubTrigger eventType="Issue Closed" />
          </div>

          <div className="p-3 bg-blue-900/30 rounded-md">
            <GitHubTrigger eventType="Branch Created" isNew={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
