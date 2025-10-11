import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getRecipeData } from "@/lib/item-lookup";
import { TodoItem, useTodo } from "@/contexts/todolist-context";

export const TodoRow = ( todoItem : TodoItem) => {
	const { updateRequired, removeItem } = useTodo();
	const data = getRecipeData(todoItem.itemID);
	if (!data) return null;

	const {
        recipe,
		name,
		description,
		iconURL,
		ingredients,
		unlocks,
		isBigCraftable,
	} = data;

	const handleIncrement = () => updateRequired(todoItem.itemID, todoItem.required + 1);
	const handleDecrement = () => updateRequired(todoItem.itemID, Math.max(0, todoItem.required - 1));
	const handleRemove = () => removeItem(todoItem.itemID);

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
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold truncate">{name}</h3>
					<p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
						{description}
					</p>
				</div>

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

			{/* Ingredients */}
			{ingredients.length > 0 && (
				<div className="mt-3">
					<Separator className="my-2" />
					<h4 className="text-sm font-semibold mb-2">Ingredients</h4>
					<div className="flex flex-wrap gap-2">
						{ingredients.map((ing) => (
							<div
								key={ing.id}
								className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-sm"
							>
								<Image
									src={ing.iconURL}
									alt={ing.name}
									width={24}
									height={24}
									className="rounded-sm"
								/>
								<span>
									{ing.amount}x {ing.name}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
            <Separator className="my-2" />
			{/* Unlock Requirements */}
            <section className="space-y-2">
                <h4 className="text-sm font-semibold mb-2">How to unlock</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {recipe.unlockConditions}
                </p>
            </section>
			{unlocks && unlocks.length > 0 && (
				<div className="mt-3">
					<Separator className="my-2" />
					<h4 className="text-sm font-semibold mb-1">Unlocks</h4>
					<ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400">
						{unlocks.map((src, idx) => (
							<li key={idx}>{src}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
