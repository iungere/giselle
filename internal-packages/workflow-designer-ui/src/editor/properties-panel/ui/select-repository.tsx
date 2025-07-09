import type { GitHubIntegrationInstalledState } from "@giselle-sdk/giselle-engine";
import { useIntegration } from "@giselle-sdk/giselle-engine/react";
import { Check, ChevronDown } from "lucide-react";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

interface SelectRepository {
  installationId: number;
  owner: string;
  repo: string;
  repoNodeId: string;
}
export function SelectRepository({
  installations,
  installationUrl,
  onSelectRepository,
}: Pick<
  GitHubIntegrationInstalledState,
  "installations" | "installationUrl"
> & {
  onSelectRepository: (value: SelectRepository) => void;
}) {
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    number | null
  >(installations.length > 0 ? installations[0].id : null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const { refresh } = useIntegration();
  const [isPending, startTransition] = useTransition();
  const popupRef = useRef<Window | null>(null);

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

  // Handler for installation message from popup window
  const handleInstallationMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === "github-app-installed") {
        startTransition(() => {
          refresh();
        });
      }
    },
    [refresh],
  );

  // Listen for visibility changes to refresh data when user returns to the page
  useEffect(() => {
    // Add event listener for installation message from popup
    window.addEventListener("message", handleInstallationMessage);

    return () => {
      window.removeEventListener("message", handleInstallationMessage);

      // Close popup if component unmounts
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [handleInstallationMessage]);

  const handleClick = useCallback(() => {
    const width = 800;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      installationUrl,
      "Configure GitHub App",
      `width=${width},height=${height},top=${top},left=${left},popup=1`,
    );

    if (!popupRef.current) {
      console.warn("Failed to open popup window");
      return;
    }
  }, [installationUrl]);
  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e?.currentTarget);
      const installationId = formData.get("installationId");
      const owner = formData.get("owner");
      const repo = formData.get("repo");
      const repoNodeId = formData.get("repoNodeId");
      if (
        typeof installationId !== "string" ||
        typeof owner !== "string" ||
        typeof repo !== "string" ||
        typeof repoNodeId !== "string"
      ) {
        throw new Error(
          "Invalid form data: 'installationId', 'owner', 'repo', and 'repoNodeId' must all be strings.",
        );
      }

      onSelectRepository({
        installationId: Number.parseInt(installationId),
        owner,
        repo,
        repoNodeId,
      });
    },
    [onSelectRepository],
  );
  return (
    <div className="w-full flex flex-col gap-[16px]">
      <fieldset className="flex flex-col gap-[8px]">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="w-full px-3 py-2 bg-black-300/20 rounded-[8px] text-white-400 text-[14px] font-geist cursor-pointer text-left flex items-center justify-between"
          >
            <span className={selectedInstallationId ? "" : "text-white/30"}>
              {(() => {
                if (!selectedInstallationId) return "Select an Organization";
                const installation = installations.find(
                  (i) => i.id === selectedInstallationId,
                );
                if (!installation?.account) return "Select an Organization";
                return "login" in installation.account
                  ? installation.account.login
                  : "slug" in installation.account
                    ? installation.account.slug
                    : "Select an Organization";
              })()}
            </span>
            <ChevronDown className="h-4 w-4 text-white/60" />
          </button>
          {isOrgDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-[8px] border-[0.25px] border-white/10 bg-black-850 p-1 shadow-none">
              {installations.map((installation) => (
                <button
                  key={installation.id}
                  type="button"
                  onClick={() => {
                    setSelectedInstallationId(installation.id);
                    setIsOrgDropdownOpen(false);
                  }}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left font-sans text-[14px] leading-[16px] text-white-400 hover:bg-white/5"
                >
                  <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                    {selectedInstallationId === installation.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  {installation.account &&
                    ("login" in installation.account
                      ? installation.account.login
                      : "slug" in installation.account
                        ? installation.account.slug
                        : "")}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-white-500 text-[14px] text-right">
          Missing GitHub account?
          <button
            type="button"
            className="text-white-400 hover:text-white-300 ml-1 underline text-[14px]"
            onClick={handleClick}
          >
            Adjust GitHub App Permissions
          </button>
        </p>
      </fieldset>
      {selectedInstallationId && repositories && (
        <div className="flex flex-col gap-[8px]">
          <ul className="flex flex-col rounded-[8px] divide-y divide-white/10 border-[0.25px] border-white/10 overflow-hidden">
            {isPending ? (
              <li className="flex items-center justify-center h-[64px] bg-black-300/20 text-white-400 text-[14px]">
                Loading...
              </li>
            ) : (
              repositories.map((repo) => (
                <li
                  key={repo.node_id}
                  className="px-4 py-3 flex items-center justify-between bg-black-300/20 hover:bg-white/5 text-white-400 text-[14px]"
                >
                  <span>{repo.name}</span>
                  <button
                    type="button"
                    className="rounded-md px-3 h-8 bg-white-900 text-black-900 text-[14px]"
                    onClick={() => {
                      onSelectRepository({
                        installationId: selectedInstallationId,
                        owner: repo.owner.login,
                        repo: repo.name,
                        repoNodeId: repo.node_id,
                      });
                    }}
                  >
                    Set Up
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="text-white-500 text-[14px] text-right">
            Missing Git repository?
            <button
              type="button"
              className="text-white-400 hover:text-white-300 ml-1 underline text-[14px]"
              onClick={handleClick}
            >
              Adjust GitHub App Permissions
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
