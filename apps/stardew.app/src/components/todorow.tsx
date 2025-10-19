import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
	getRecipeData,
    getItemData,
	SkillDisplay,
	useItemLookup,
 } from "@/lib/item-lookup";
import { TodoItem, useTodo } from "@/contexts/todolist-context";

export const TodoRow = (todoItem: TodoItem) => {
	const { updateRequired, removeItem } = useTodo();
	if (todoItem.itemType !== "CraftingItem") return null; // Ensure correct itemType

	const data = getRecipeData(todoItem.itemID);
	if (!data) return null;

	const {
		recipe,
		name,
		description,
		iconURL,
		ingredients,
		isBigCraftable,
		unlock,
	} = data;

	const handleIncrement = () => updateRequired(todoItem.itemID, todoItem.itemType, todoItem.required + 1);
	const handleDecrement = () => updateRequired(todoItem.itemID, todoItem.itemType, Math.max(0, todoItem.required - 1));
	const handleRemove = () => removeItem(todoItem.itemID, todoItem.itemType);

	const {
        skillLookup
    } = useItemLookup();

    const skillDisplay = unlock.skill ? skillLookup(unlock.skill) : undefined;

	return (
		<div className="rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm mb-4">
			<div className="flex items-center gap-4">
				<Image
					src={iconURL}
					alt={name}
					width={isBigCraftable ? 32 : 48}
					height={48}
					className="rounded-sm"
				/>
				<div className="flex min-w-0">
					<h3 className="font-semibold truncate">{name}</h3>
				</div>

				{/* Ingredients */}
				{ingredients.length > 0 && (
					<div className="flex-1 items-left gap-2">
						<div className="flex flex-wrap gap-2">
							{ingredients.map((ing) => {
                                const ing_comp: TodoItem = {
                                    itemID: ing.itemID, 
                                    itemType: "",
                                    required: ing.amount,
                                    crafted: 0
                                };
								const item = getItemData(ing_comp);
								return (
									<div
										key={ing.itemID}
										className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-sm"
									>
										<Image
											src={item.iconURL}
											alt={item.name}
											width={24}
											height={24}
											className="rounded-sm"
										/>
										<span>
											{ing.amount}x {item.name}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Controls */}
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleDecrement}>
						-
					</Button>
					<span className="w-5 text-center text-sm">
						{todoItem.required}
					</span>
					<Button variant="outline" size="sm" onClick={handleIncrement}>
						+
					</Button>
					<Button variant="ghost" size="sm" onClick={handleRemove}>
						🗑️
					</Button>
				</div>
			</div>

			{unlock.skill && unlock.level && skillDisplay && (skillDisplay.level<unlock.level)
             && (
                <div className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-sm">
                    <Image
                        src={skillDisplay.iconURL}
                        alt={unlock.skill}
                        width={24}
                        height={24}
                        className="rounded-sm"
				    />
                    <span>
                        lvl {unlock.level}
                        {(skillDisplay.level != 0) && (
                            <div>
                                (lvl {skillDisplay.level} @ {skillDisplay.progress.toString()} %)
                            </div>
                        )}
                    </span>
                </div>
			)}
		</div>
	);
};
