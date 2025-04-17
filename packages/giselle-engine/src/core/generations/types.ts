import type { TelemetrySettings as AI_TelemetrySettings } from "ai";

export interface TelemetrySettings extends AI_TelemetrySettings {
	metadata?: AI_TelemetrySettings["metadata"];
	onFinish?: (event: any) => Promise<any>;
}
