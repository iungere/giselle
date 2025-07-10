"use client";

import { useState, useEffect } from "react";
import { Organization, OrganizationSelect } from "./organization-select";

// Sample organizations data
const sampleOrganizations: Organization[] = [
	{ id: "org-1", name: "Organization One" },
	{ id: "org-2", name: "Organization Two" },
	{ id: "org-3", name: "Organization Three" },
];

export default function OrganizationSelectExample() {
	// State to store the selected organization ID
	const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>(
		"org-2" // Set a default organization ID to simulate coming from a previous screen
	);

	// Handle organization selection change
	const handleOrganizationChange = (organizationId: string) => {
		console.log(`Organization changed to: ${organizationId}`);
		setSelectedOrganizationId(organizationId);

		// Additional logic you might want to perform when organization changes
		// For example, fetching data specific to this organization
	};

	// Find the selected organization name for display
	const selectedOrganizationName = sampleOrganizations.find(
		(org) => org.id === selectedOrganizationId
	)?.name;

	return (
		<div className="p-4 space-y-4">
			<h1 className="text-xl font-bold">Organization Selection Example</h1>

			<div className="space-y-2">
				<p className="text-sm text-gray-500">
					Select an organization from the dropdown below:
				</p>

				<OrganizationSelect
					organizations={sampleOrganizations}
					defaultOrganizationId={selectedOrganizationId}
					onOrganizationChange={handleOrganizationChange}
					className="w-full max-w-xs"
				/>
			</div>

			{selectedOrganizationId && (
				<div className="mt-4 p-3 bg-gray-100 rounded-md">
					<p>
						Selected Organization: <span className="font-medium">{selectedOrganizationName}</span>
					</p>
					<p className="text-sm text-gray-500">
						ID: {selectedOrganizationId}
					</p>
				</div>
			)}

			<div className="mt-4 text-sm text-gray-500">
				<p>
					This example demonstrates how the OrganizationSelect component maintains the selected
					organization when navigating between screens.
				</p>
			</div>
		</div>
	);
}
