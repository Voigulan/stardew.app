// src/lib/getRecipeData.ts
import recipes_craft from "@/data/crafting.json";
import recipes_cook from "@/data/cooking.json";

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
import { TodoItem } from "@/contexts/todolist-context";
import { categoryIcons, goldIcons } from "@/lib/constants";
import { exists } from "drizzle-orm";


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

const seasonList: string[] = ["spring", "summer", "fall", "winter"];

export function castSkill(skillStr: string): Skill | undefined {
	if(validSkills.includes(skillStr.toLowerCase() as Skill)) {
		return skillStr.toLowerCase() as Skill;
	}
    else return undefined;
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
	var capStr = str
	return capStr.charAt(0).toUpperCase() + capStr.slice(1);
}


export function useItemLookup() {
	const { activePlayer } = usePlayers();
	const { 
			playerExperiencePoints,
			masteryExp,
			playerPowers,
			getAchievementProgress 
		} = usePlayerAchievements();

	function skillLookup(skillStr: string): SkillDisplay | undefined {
		const baseURL: string = "https://stardewvalleywiki.com/mediawiki/images/"
		const skill: Skill | undefined = castSkill(skillStr);
        if(skill == undefined) {
            return undefined;
        }
        
		return {
			skill: skill,
			title: capitalizeFirstLetter(skillStr),
			iconURL: skillUrls[skill] ? baseURL+skillUrls[skill] : "",
			level: activePlayer?.general?.skills?.[skill] ?? 0,
			progress: playerExperiencePoints[skill].percentage
		};
	}

    function timeTilFishSeason(fish: FishType | undefined): number {
        if (!fish || !activePlayer?.currentSeason) return 3;

        if ("seasons" in fish) {
            if (fish.seasons.includes("all")) return 0;

            const currentSeason = activePlayer.currentSeason.toLowerCase();
            const currentSeasonIdx = seasonList.indexOf(currentSeason);

            if (currentSeasonIdx === -1) {
                console.error(`Invalid current season: ${currentSeason}`);
                return 3;
            }

            const seasonDistances = fish.seasons.map(season => {
                const seasonIdx = seasonList.indexOf(season.toLowerCase());
                if (seasonIdx === -1) {
                    console.error(`Invalid fish season: ${season}`);
                    return 3;
                }
                return (seasonIdx - currentSeasonIdx + 4) % 4; // Ensure positive modulo
            });

            return Math.min(...seasonDistances);
        }

        return 3;
    }

	return {
		skillLookup,
        timeTilFishSeason
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
		itemType: "Fish", // Added itemType field
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
	var recipe =
		recipes_craft[itemID as keyof typeof recipes_craft] as Recipe | undefined;
    
    if (!recipe) {
        recipe =
            recipes_cook[itemID as keyof typeof recipes_cook] as Recipe | undefined;
    }

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
				itemID: ing.itemID,
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
		itemType: "CraftingItem", // Added itemType field
		recipe,
		name,
		description,
		iconURL,
		isBigCraftable,
		ingredients,
		unlock,
	};
}

const categoryItems: Record<string, string> = {
	"-4": "Any Fish",
	"-5": "Any Egg",
	"-6": "Any Milk",
	"-777": "Wild Seeds (Any)",
};

export function getItemData(item: TodoItem) {
    let iconURL;
    let name;
    let description;
    let itemType;

    console.log("itemID="+item.itemID)

	if (
		item &&
		item?.itemID in categoryItems
	) {
		iconURL = categoryIcons[item.itemID];
		name = categoryItems[item.itemID];
		description = "Any item in this category will work.";
        itemType = "categoryItem"
        console.log(description)
	} else if (item && item.itemID == "-1") {
		//Special case for handling gold in Vault bundles
		if("quality" in item) {
            let itemCopy = { ...item };
            itemCopy.itemQuality = "0"; // For some reason they have "gold" quality in the data
            item = itemCopy as typeof item;
        }
		iconURL = goldIcons[item.required.toString()];  // here: itemQuantity => required
		name = "Gold";
		description = "What do the Junimos need all this gold for?";
        itemType = "Gold"
	} else if (
		item &&
		!objects[item.itemID as keyof typeof objects]
	) {
		iconURL = `https://cdn.stardew.app/images/(O)MysteryBox.webp`;
		name = "Unknown Object";
		description = "We don't know what this is...";
		// unknownItem = true;
        itemType = "unknownItem"
	} else {                                                    // All "Normal" items
		iconURL =
			(item &&
				item !== undefined &&
				`https://cdn.stardew.app/images/(O)${item.itemID}.webp`) ||
			"";

		name =
			(item &&
				item !== undefined &&
				objects[item.itemID as keyof typeof objects].name) ||
			"";

		description =
			(item &&
				item !== undefined &&
				objects[item.itemID as keyof typeof objects]
					.description) ||
			"";
        itemType = "object"
    }

    return {
		itemType: "CraftingItem", // Added itemType field
        item,
        name,
		description,
		iconURL,
    }

}
