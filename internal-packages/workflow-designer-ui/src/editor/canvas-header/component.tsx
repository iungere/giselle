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
				"border-b border-black-600",
				"shrink-0",
			)}
		>
			{/* Left section: Logo */}
			<div className="flex items-center gap-[8px] min-w-0">
				<GiselleLogo className="fill-white-900 w-[75px] h-auto" />
				<span className="text-white-900 text-[14px] font-semibold">Studio</span>
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
							className="p-1 border-[0.25px] border-white/10 rounded-[8px] min-w-[165px] bg-black-900 text-white-900 shadow-none"
							sideOffset={12}
							align="start"
						>
							<DropdownMenu.Item
								className="flex items-center w-full px-3 py-2 text-[14px] leading-[16px] text-white-400 hover:bg-white/5 rounded-md cursor-pointer focus:outline-none"
								onSelect={() => {
									const btn = document.querySelector<HTMLButtonElement>(
										'button[data-role="editable-display"]',
									);
									btn?.click();
								}}
							>
								Rename
							</DropdownMenu.Item>
							<DropdownMenu.Item
								className="flex items-center w-full px-3 py-2 text-[14px] leading-[16px] text-white-400 hover:bg-white/5 rounded-md cursor-pointer focus:outline-none"
								onSelect={() => {
									console.debug("Duplicate app – not yet implemented");
								}}
							>
								Duplicate
							</DropdownMenu.Item>
							<DropdownMenu.Item
								disabled
								className="flex items-center justify-between w-full px-3 py-2 text-[14px] leading-[16px] text-white-400 rounded-md cursor-not-allowed opacity-50 focus:outline-none"
							>
								<span>Create a Template</span>
								<span className="ml-2 text-[10px] leading-none text-white-600 bg-white/30 px-1.5 py-[1px] rounded-full">
									Coming&nbsp;soon
								</span>
							</DropdownMenu.Item>
							<DropdownMenu.Separator className="my-2 h-px bg-white/10" />
							<DropdownMenu.Item
								className="flex items-center w-full px-3 py-2 text-[14px] leading-[16px] text-error-900 hover:bg-error-900/20 rounded-md cursor-pointer focus:outline-none"
								onSelect={() => {
									console.debug("Delete app – not yet implemented");
								}}
							>
								Delete
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
