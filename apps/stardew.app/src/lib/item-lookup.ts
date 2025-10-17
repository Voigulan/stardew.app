// src/lib/getRecipeData.ts
import recipes from "@/data/crafting.json";
import objects from "@/data/objects.json";
import bigobjects from "@/data/big_craftables.json";
import bigCraftables from "@/data/big_craftables.json";
import type { CraftingRecipe, Recipe } from "@/types/recipe";
import type { Skill, SkillsRet } from "@/lib/parsers/general"
import { usePlayerAchievements } from "@/contexts/skills"

import { useState } from "react";
import { usePlayers } from "@/contexts/players-context";
import { FishType } from "@/types/items";
import fishes from "@/data/fish.json";


// accepts any type that extends Recipe (CraftingRecipe, CookingRecipe, etc.)
// returns true if the recipe is of type U and CraftingRecipe which for now
// is just the type CraftingRecipes
function isCraftingRecipe<U extends Recipe>(
    recipe: U,
): recipe is U & CraftingRecipe {
    return "isBigCraftable" in recipe;
}

export interface SkillLevel {
    skill: Skill;
    level: number;
}
const validSkills: Skill[] = ["farming", "fishing", "foraging", "mining", "combat", "luck"];

export function castSkill(skillStr: string): Skill {
    if(validSkills.includes(skillStr as Skill)) {
        return skillStr as Skill;
    }
    console.error(`Invalid skill: ${skillStr}`);
    return validSkills[0]
}

export const skillUrls: Record<Skill, string> = {
    farming:    "8/82/Farming_Skill_Icon.png", 
    fishing:    "e/e7/Fishing_Skill_Icon.png", 
    foraging:   "f/f1/Foraging_Skill_Icon.png", 
    mining:     "2/2f/Mining_Skill_Icon.png", 
    combat:     "c/cf/Combat_Skill_Icon.png", 
    luck:       "", // unused as of 1.5
}

export interface SkillDisplay {
    skill: Skill;
    title: string;
    iconURL: string;
    level: number;
    progress: number;
}

function capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str; // If the string is empty, return it as-is.
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function useItemLookup() {
    const { activePlayer } = usePlayers();
    const { 
            playerExperiencePoints,
            masteryExp,
            playerPowers,
            getAchievementProgress 
        } = usePlayerAchievements();

    function skillLookup(skillStr: string): SkillDisplay {
        const baseURL: string = "https://stardewvalleywiki.com/mediawiki/images/"
        const skill: Skill = castSkill(skillStr);
        return {
            skill: skill,
            title: capitalizeFirstLetter(skillStr),
            iconURL: skillUrls[skill] ? baseURL+skillUrls[skill] : "",
            level: activePlayer?.general?.skills?.[skill] ?? 0,
            progress: playerExperiencePoints[skill].percentage
        };
    }
    return {
        skillLookup
    }
}

export function getFishData(itemID: string) {
    const fish =
		fishes[itemID as keyof typeof fishes] as FishType | undefined;

    if (!fish) {
        console.warn(`getFishData: No fish found for itemID=${itemID}`);
        return null;
    }

    const iconURL =
		fish && `https://cdn.stardew.app/images/(O)${fish.itemID}.webp`;

	const name =
		fish && objects[fish.itemID.toString() as keyof typeof objects].name;

	const description =
		fish && objects[fish.itemID.toString() as keyof typeof objects].description;

    return {
        fish,
        name,
        description,
        iconURL,
    };
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

    let unlockConditionField = recipe.unlockConditions.split(" ")
    
    const unlock: SkillLevel = { 
        skill: castSkill(unlockConditionField[4] ?? ""),
        level: Number(unlockConditionField[2] ?? "")
    };

	return {
		recipe,
		name,
		description,
		iconURL,
		isBigCraftable,
		ingredients,
		unlock,
	};
}
