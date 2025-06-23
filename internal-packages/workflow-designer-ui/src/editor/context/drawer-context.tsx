import { createContext, useContext } from "react";

export type DrawerPanel = "run-history" | "secret" | "datasource" | null;

interface DrawerContextValue {
	panel: DrawerPanel;
	setPanel: (panel: DrawerPanel) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer() {
	const ctx = useContext(DrawerContext);
	if (!ctx) {
		throw new Error("useDrawer must be used within DrawerContext.Provider");
	}
	return ctx;
}

export { DrawerContext };
