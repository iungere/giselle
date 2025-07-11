import clsx from "clsx/lite";

interface RepositoryDisplayProps {
	owner: string;
	repo: string;
	className?: string;
}

export function RepositoryDisplay({
	owner,
	repo,
	className,
}: RepositoryDisplayProps) {
	return (
		<div className={clsx("flex flex-col gap-1", className)}>
			<div className="flex items-center gap-2">
				<div className="w-2 h-2 bg-gray-500 rounded-full" />
				<span className="text-sm font-medium text-white">
					{owner}/{repo}
				</span>
			</div>
			<p className="text-xs text-gray-400 ml-4">GitHub Repository</p>
		</div>
	);
}
