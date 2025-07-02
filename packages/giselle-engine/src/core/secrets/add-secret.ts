import {
	type Secret,
	SecretId,
	SecretIndex,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { secretPath, workspaceSecretIndexPath } from "./paths";

export async function addSecret(args: {
	context: GiselleEngineContext;
	label: string;
	value: string;
	workspaceId: WorkspaceId;
	tags?: string[];
}): Promise<Secret> {
	const encryptedValue = await args.context.vault.encrypt(args.value);

	const secret: Secret = {
		id: SecretId.generate(),
		label: args.label,
		value: encryptedValue,
		createdAt: Date.now(),
		workspaceId: args.workspaceId,
		...(args.tags ? { tags: args.tags } : {}),
	};

	// Persist the secret item and update the workspace index.
	await args.context.storage.setItem(secretPath(secret.id), secret);
	await addWorkspaceIndexItem({
		storage: args.context.storage,
		indexPath: workspaceSecretIndexPath(args.workspaceId),
		item: secret,
		itemSchema: SecretIndex,
	});
	return secret;
}
