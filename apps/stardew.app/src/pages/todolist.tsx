import { usePlayers } from "@/contexts/players-context";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useEffect, useState } from "react";

import { DialogCard } from "@/components/cards/dialog-card";
import { Command, CommandInput } from "@/components/ui/command";

import { BulkActionDialog } from "@/components/dialogs/bulk-action-dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMultiSelect } from "@/contexts/multi-select-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

import big_craftables from "@/data/big_craftables.json";
import { TodoItem, useTodo } from "@/contexts/todolist-context";
import { TodoRow } from "@/components/todorow";
import { FishRow } from "@/components/fishrow";

import { getRecipeData, getItemData } from "@/lib/item-lookup";
import { useItemLookup, getFishData } from "@/lib/item-lookup";

function aggregateIngredients(items: TodoItem[]) {
	const totals: Record<string, { id: string; name: string; iconURL: string; total: number }> = {};

	for (const item of items) {
		if (item.itemType !== "CraftingItem") continue; // Only aggregate crafting items

		const data = getRecipeData(item.itemID);
		if (!data) continue;

		for (const ing_raw of data.ingredients) {
            const ing_comp: TodoItem = {
                itemID: ing_raw.itemID, 
                itemType: "",
                required: ing_raw.amount,
                crafted: 0
            };
            const ing = getItemData(ing_comp);

			const requiredTotal = ing_raw.amount * item.required;
			if (!totals[ing.item.itemID]) {
				totals[ing.item.itemID] = {
					id: ing.item.itemID,
					name: ing.name,
					iconURL: ing.iconURL,
					total: requiredTotal,
				};
			} else {
				totals[ing.item.itemID].total += requiredTotal;
			}
		}
	}

	return Object.values(totals);
}

export default function TodoPage() {
	const { items } = useTodo();
	const { timeTilFishSeason } = useItemLookup();

	// Sort fish by timeTilFishSeason
	const sortedFish = items
		.filter((item) => item.itemType === "Fish")
		.map((item) => ({
			...item,
			timeUntilSeason: timeTilFishSeason(getFishData(item.itemID)?.fish),
		}))
		.sort((a, b) => a.timeUntilSeason - b.timeUntilSeason);

	// Group fish by priority
	const groupedFish = sortedFish.reduce<[
        typeof sortedFish,
        typeof sortedFish,
        typeof sortedFish
    ]>((groups, fish) => {
		if (!groups[fish.timeUntilSeason]) {
			groups[fish.timeUntilSeason] = [];
		}
		groups[fish.timeUntilSeason].push(fish);
		return groups;
	}, [[],[],[]]);
    
	return (
		<div className="p-7">
			<h1 className="text-2xl font-bold mb-4">Crafting To-Do List</h1>

			{items.length === 0 && (
				<p className="text-neutral-500">No crafting tasks yet.</p>
			)}

			{/* ToDo Items List */}
			{items.map((item) => (
				(item.itemType === "CraftingItem") || (item.itemType === "Cooking")  ? (
					<TodoRow
						{...item}
					/>
				) : (<div></div>)
			))}

			{/* Summary Row */}
			{items.some((item) => item.itemType === "CraftingItem") && (
				<div className="mt-8 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
					<h2 className="text-lg font-semibold mb-2">Total Required Ingredients</h2>
					<div className="flex flex-wrap gap-3">
						{aggregateIngredients(items).map((ing) => (
							<div
								key={ing.id}
								className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-sm"
							>
								<img
									src={ing.iconURL}
									alt={ing.name}
									width={24}
									height={24}
									className="rounded-sm"
								/>
								<span>
									{ing.total}x {ing.name}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

            {/* Fish Grid */}
			{Object.entries(groupedFish).map(([priority, fishGroup]) => {
                if (fishGroup.length === 0) return null; // Skip rendering this group if there's no fish

                return (
                    <div key={priority} className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">
                        {priority === "0" ? "Available Now" : (priority === "1" ? "Available next Season" : "Available in many Seasons")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
                        {fishGroup.map((fish) => (
                            <FishRow key={fish.itemID} {...fish} />
                        ))}
                    </div>
                    </div>
                );
            })}
		</div>
	);
}
