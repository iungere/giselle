import clsx from "clsx/lite";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { Button } from "./button";

type Identifiable = {
	id: string | number;
};

interface SelectProps<T extends Identifiable> {
	options: Array<T>;
	renderOption: (option: T) => React.ReactNode;
	placeholder: string;
	value?: string;
	onValueChange?: (value: string) => void;
	defaultValue?: string;
	widthClassName?: string;
	name?: string;
	id?: string;
	renderValue?: (options: T) => string | number;
}

export function Select<T extends Identifiable>({
	renderOption,
	options,
	placeholder,
	value,
	onValueChange,
	defaultValue,
	widthClassName,
	name,
	id,
	renderValue,
}: SelectProps<T>) {
	return (
		<SelectPrimitive.Root
			value={value}
			onValueChange={onValueChange}
			defaultValue={defaultValue}
			name={name}
		>
			<SelectPrimitive.Trigger id={id} asChild>
				<Button
					type="button"
					variant="filled"
					rightIcon={<ChevronDownIcon className="size-[13px]" />}
					className={widthClassName}
				>
					<SelectPrimitive.Value placeholder={placeholder} />
				</Button>
			</SelectPrimitive.Trigger>
			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={4}
					className={clsx("w-(--radix-select-trigger-width) z-70")}
				>
					<div
						className={clsx(
							"rounded-[8px] p-[4px] relative overflow-hidden",
							"shadow-xl focus:outline-none",
						)}
					>
						{/* Glass effect layers */}
						<div
							className="absolute inset-0 rounded-[8px] backdrop-blur-md"
							style={{
								background:
									"linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)",
							}}
						/>
						<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
						<div className="absolute inset-0 rounded-[8px] border border-white/10" />

						<div className="relative z-10">
							<SelectPrimitive.Viewport>
								{options.map((option) => (
									<SelectPrimitive.Item
										key={option.id}
										value={
											renderValue ? `${renderValue(option)}` : `${option.id}`
										}
										className={clsx(
											"text-white-400 outline-none cursor-pointer hover:bg-white/10",
											"rounded-[4px] px-[8px] py-[6px] text-[14px]",
											"flex items-center justify-between gap-[4px]",
											"transition-colors duration-200",
										)}
									>
										<SelectPrimitive.ItemText>
											{renderOption(option)}
										</SelectPrimitive.ItemText>
										<SelectPrimitive.ItemIndicator>
											<CheckIcon className="size-[13px] text-white-400" />
										</SelectPrimitive.ItemIndicator>
									</SelectPrimitive.Item>
								))}
							</SelectPrimitive.Viewport>
						</div>
					</div>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
