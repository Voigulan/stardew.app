// src/lib/getRecipeData.ts
import recipes from "@/data/crafting.json";
import objects from "@/data/objects.json";
import bigobjects from "@/data/big_craftables.json";
import bigCraftables from "@/data/big_craftables.json";
import type { CraftingRecipe, Recipe } from "@/types/recipe";

import { useState } from "react";
import { usePlayers } from "@/contexts/players-context";


// accepts any type that extends Recipe (CraftingRecipe, CookingRecipe, etc.)
// returns true if the recipe is of type U and CraftingRecipe which for now
// is just the type CraftingRecipes
function isCraftingRecipe<U extends Recipe>(
    recipe: U,
): recipe is U & CraftingRecipe {
    return "isBigCraftable" in recipe;
}


/**
 * Finds the crafting recipe and related display info for a given itemID.
 * Currently supports CraftingRecipes only.
 */
export function getRecipeData(itemID: string) {
	const recipe =
		recipes[itemID as keyof typeof recipes] as Recipe | undefined;

	if (!recipe) {
		console.warn(`getRecipeData: No recipe found for itemID=${itemID}`);
		return null;
	}

	const isBigCraftable = isCraftingRecipe(recipe) && recipe.isBigCraftable;

	const sourceData = isBigCraftable ? bigCraftables : objects;
	const baseInfo = sourceData[itemID as keyof typeof sourceData];

	const name = baseInfo?.name ?? "Unknown Item";
	const description = baseInfo?.description ?? "No description available.";

	const iconURL = isBigCraftable
		? `https://cdn.stardew.app/images/(BC)${itemID}.webp`
		: `https://cdn.stardew.app/images/(O)${itemID}.webp`;

	const ingredients =
		recipe?.ingredients?.map((ing) => {
			const objData = objects[ing.itemID.toString() as keyof typeof objects];
			return {
				id: ing.itemID.toString(),
				amount: ing.quantity,
				name: objData?.name ?? `Item ${ing.itemID}`,
				iconURL: `https://cdn.stardew.app/images/(O)${ing.itemID}.webp`,
			};
		}) ?? [];

	const unlocks = recipe?.sources ?? null;

	return {
		recipe,
		name,
		description,
		iconURL,
		isBigCraftable,
		ingredients,
		unlocks,
	};
}
