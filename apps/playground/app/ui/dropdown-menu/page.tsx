"use client";

import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Dropdown Menu</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Basic Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<DropdownMenu
								items={[
									{ id: 1, name: "apple" },
									{ id: 2, name: "banana" },
									{ id: 3, name: "melon" },
								]}
								renderItem={(option) => option.name}
								trigger={<Button>Basic Menu</Button>}
							/>
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">Group Demo</p>
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
											{ id: 3, name: "Orange" },
										],
									},
									{
										groupId: "vegetables",
										groupLabel: "Vegetables",
										items: [
											{ id: 4, name: "Carrot" },
											{ id: 5, name: "Broccoli" },
											{ id: 6, name: "Spinach" },
										],
									},
									{
										groupId: "dairy",
										groupLabel: "Dairy Products",
										items: [
											{ id: 7, name: "Milk" },
											{ id: 8, name: "Cheese" },
										],
									},
								]}
								renderItem={(option) => option.name}
								trigger={<Button>Grouped Menu</Button>}
								onSelect={(event, option) => {
									console.log("Selected:", option);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
