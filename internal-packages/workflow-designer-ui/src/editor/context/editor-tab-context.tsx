// Create EditorTabContext to share selected tab across components
import { createContext, useContext } from "react";

export type EditorTabValue =
	| "builder"
	| "run-history"
	| "secret"
	| "datasource";

interface EditorTabContextValue {
	tab: EditorTabValue;
	setTab: (value: EditorTabValue) => void;
}

// Default dummy values – real ones are provided by Editor component
const EditorTabContext = createContext<EditorTabContextValue | null>(null);

export function useEditorTab() {
	const ctx = useContext(EditorTabContext);
	if (!ctx) {
		throw new Error(
			"useEditorTab must be used within an EditorTabContext.Provider",
		);
	}
	return ctx;
}

export { EditorTabContext };
