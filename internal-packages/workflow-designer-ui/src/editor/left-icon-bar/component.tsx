"use client";

import { DatabaseIcon, FileKey2Icon, HistoryIcon } from "lucide-react";
import { Tooltip } from "../../ui/tooltip";
import { type DrawerPanel, useDrawer } from "../context/drawer-context";

const items = [
	{ id: "run-history", icon: HistoryIcon, label: "Run history" },
	{ id: "secret", icon: FileKey2Icon, label: "Secrets" },
	{ id: "datasource", icon: DatabaseIcon, label: "Data source" },
] as const;

export function LeftIconBar() {
	const { panel, setPanel } = useDrawer();

	return (
		<div className="fixed left-0 top-[54px] bottom-0 w-[44px] bg-black-925 flex flex-col items-center py-[12px] gap-[12px] border-r border-black-700 z-40">
			{items.map(({ id, icon: Icon, label }) => (
				<Tooltip
					key={id}
					text={label}
					sideOffset={6}
					delayDuration={100}
					side="right"
				>
					<button
						type="button"
						onClick={() => setPanel(panel === id ? null : (id as DrawerPanel))}
						className={`p-[6px] rounded-[6px] text-white-900 hover:text-white-950 hover:bg-black-700 focus:outline-none ${
							panel === id ? "bg-black-700" : ""
						}`}
					>
						<Icon className="size-[18px]" />
					</button>
				</Tooltip>
			))}
		</div>
	);
}
