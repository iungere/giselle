"use client";

import React from "react";
import { Button, DropdownMenu } from "@giselle-internal/ui";

type MenuItem = {
	id: number;
	name: string;
};

type MenuGroup = {
	groupId: string;
	groupLabel: string;
	items: MenuItem[];
};

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Dropdown Menu</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<DropdownMenu
								items={[
									{ id: 1, name: "apple" },
									{ id: 2, name: "banana" },
									{ id: 3, name: "melon" },
								]}
								renderItem={(option) => option.name}
								trigger={<Button>Hello</Button>}
							/>
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">Group Example</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<DropdownMenu
								items={[
									{
										groupId: "fruits",
										groupLabel: "Fruits",
										items: [
											{ id: 1, name: "Apple" },
											{ id: 2, name: "Banana" },
											{ id: 3, name: "Melon" },
										],
									},
									{
										groupId: "vegetables",
										groupLabel: "Vegetables",
										items: [
											{ id: 4, name: "Carrot" },
											{ id: 5, name: "Broccoli" },
										],
									},
								]}
								renderItem={(item) => item.name}
								trigger={<Button>Grouped Hello</Button>}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
