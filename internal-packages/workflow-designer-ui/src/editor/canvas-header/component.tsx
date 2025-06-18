"use client";

import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { ChevronDownIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { GiselleLogo } from "../../icons";
import { useEditorTab } from "../context/editor-tab-context";
import { EditableText } from "../properties-panel/ui";
import { RunButton } from "../run-button";

export function CanvasHeader({ teamName }: { teamName?: string }) {
	const { data, updateName } = useWorkflowDesigner();
	const { setTab } = useEditorTab();

	const handleUpdateName = (value?: string) => {
		if (!value) return;
		updateName(value);
	};

	return (
		<div
			className={clsx(
				"relative h-[54px] flex items-center justify-between",
				"pl-[16px] pr-[16px] gap-[12px]",
				"bg-[rgba(0,0,0,0.75)] backdrop-blur-[6px] border-b border-black-600",
				"shrink-0",
			)}
		>
			{/* Left section: Logo */}
			<div className="flex items-center gap-[8px] min-w-0">
				<GiselleLogo className="fill-white-900 w-[60px] h-auto" />
			</div>

			{/* Center section: Team / App names */}
			<div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[4px] min-w-0 max-w-full">
				{teamName && (
					<span className="text-white-700 text-[14px] truncate max-w-[160px]">
						{teamName}
					</span>
				)}
				{teamName && (
					<span className="text-white-600 text-[20px] font-[250] leading-none">
						/
					</span>
				)}
				{/* app name editable */}
				<span className="truncate max-w-[160px]">
					<EditableText
						fallbackValue="Untitled"
						onChange={handleUpdateName}
						value={data.name}
					/>
				</span>
				{/* dropdown */}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button
							type="button"
							className="ml-[4px] text-white-900 hover:text-white-950 outline-none"
						>
							<ChevronDownIcon className="size-[16px]" />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content
							className={clsx(
								"relative rounded-[8px] px-[8px] py-[8px] min-w-[160px]",
								"bg-[rgba(0,0,0,_0.85)] text-white-900 backdrop-blur-[4px]",
							)}
							sideOffset={5}
							align="start"
						>
							<DropdownMenu.Item
								className="text-[13px] px-[8px] py-[6px] rounded-[4px] cursor-pointer hover:bg-black-400/30"
								onSelect={() => setTab("run-history")}
							>
								Run History
							</DropdownMenu.Item>
							<DropdownMenu.Item
								className="text-[13px] px-[8px] py-[6px] rounded-[4px] cursor-pointer hover:bg-black-400/30"
								onSelect={() => setTab("secret")}
							>
								Secrets
							</DropdownMenu.Item>
							<DropdownMenu.Item
								className="text-[13px] px-[8px] py-[6px] rounded-[4px] cursor-pointer hover:bg-black-400/30"
								onSelect={() => setTab("datasource")}
							>
								Data Source
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>

			{/* Right section: Run button */}
			<RunButton />
		</div>
	);
}
