import React, { useState, useCallback, FormEvent } from "react";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import { ValidationErrorDisplay } from "./error-display";
import { getTriggerIcon } from "./icons";

export interface CallsignInputProps {
  /**
   * The event ID for the trigger that requires a callsign
   */
  eventId: GitHubTriggerEventId;

  /**
   * Optional initial callsign value
   */
  initialCallsign?: string;

  /**
   * Callback for when the form is submitted with a valid callsign
   */
  onSubmit: (callsign: string) => void;

  /**
   * Callback for canceling and going back
   */
  onCancel: () => void;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
}

/**
 * Component for inputting and validating callsigns for GitHub triggers
 */
export function CallsignInput({
  eventId,
  initialCallsign = "",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CallsignInputProps) {
  const [callsign, setCallsign] = useState(initialCallsign);
  const [error, setError] = useState<string | null>(null);

  const validateCallsign = useCallback((value: string): boolean => {
    // Callsign should start with a slash and have at least one character after it
    if (!value) {
      setError("Callsign is required");
      return false;
    }

    if (!value.startsWith("/")) {
      setError("Callsign must start with a slash (/)");
      return false;
    }

    if (value.length < 2) {
      setError("Callsign must have at least one character after the slash");
      return false;
    }

    if (/\s/.test(value)) {
      setError("Callsign cannot contain whitespace");
      return false;
    }

    // Valid callsign
    setError(null);
    return true;
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    if (validateCallsign(callsign) && !isSubmitting) {
      onSubmit(callsign);
    }
  }, [callsign, validateCallsign, onSubmit, isSubmitting]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCallsign(newValue);

    // Clear error when user is typing
    if (error) setError(null);
  }, [error]);

  const trigger = githubTriggers[eventId];

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[12px] overflow-y-auto flex-1 pr-2 custom-scrollbar">
      <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
      <div className="px-[16px] py-[9px] w-full bg-transparent text-[14px] flex items-center">
        <div className="flex-shrink-0 flex items-center justify-center">
          {getTriggerIcon(eventId)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="pl-2 text-white-800 font-medium text-[14px] truncate">
            {trigger.event.label}
          </span>
          <span className="pl-2 text-white-400 text-[12px] truncate">
            {`Trigger when ${trigger.event.label.toLowerCase()} in your repository`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Callsign</p>

        {error && <ValidationErrorDisplay message={error} />}

        <div className="relative">
          <input
            type="text"
            name="callsign"
            id="callsign"
            value={callsign}
            onChange={handleChange}
            className="px-[16px] py-[9px] w-full bg-black-800 border border-white/10 focus:border-primary-500 focus:ring-primary-500 rounded-md text-white-900 placeholder:text-white-400 text-[14px]"
            placeholder="/deploy"
            autoComplete="off"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={!!error}
            aria-describedby={error ? "callsign-error" : undefined}
          />
        </div>

        <div className="mt-[4px] text-white-400 text-[12px]">
          <p>
            Only comments starting with this callsign will trigger the
            workflow, preventing unnecessary executions from unrelated
            comments.
          </p>
          <p className="text-[12px] text-white-400 mt-2">
            Examples: /code-review, /check-policy
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-3 py-2 text-sm text-white-400 hover:text-white-300 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !callsign || !!error}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Setting up..." : "Set up"}
        </button>
      </div>
    </form>
  );
}
