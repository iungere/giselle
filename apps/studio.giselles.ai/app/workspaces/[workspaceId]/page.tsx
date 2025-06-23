import { fetchCurrentTeam } from "@/services/teams";
import { Editor } from "@giselle-internal/workflow-designer-ui";

export default async function Page() {
	const currentTeam = await fetchCurrentTeam();

	return (
		<div className="flex flex-col h-screen bg-black-900">
			<Editor teamName={currentTeam.name} />
		</div>
	);
}
