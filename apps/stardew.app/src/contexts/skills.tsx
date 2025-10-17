import { usePlayers } from "@/contexts/players-context";
import { useMemo, useState } from "react";
import {
	getCurrentMasteryLevel,
	getMasteryExpNeededForLevel,
} from "@/lib/utils";
import { Skill } from "@/lib/parsers/general"


const reqs: Record<string, number> = {
	"Singular Talent": 1, // platform specific
	"Master Of The Five Ways": 5, // platform specific
	"Well-Read": 19,
};

export function usePlayerAchievements() {
    const { activePlayer } = usePlayers();


    const getAchievementProgress = (name: string) => {
        let completed = false;
        let additionalDescription = "";

        if (activePlayer) {
            const skills = new Set(["Singular Talent", "Master Of The Five Ways"]);
            const powers = new Set(["Well-Read"]);

            if (skills.has(name)) {
                // use maxLevelCount and compare to reqs
                if (maxLevelCount >= reqs[name]) completed = true;
                else {
                    additionalDescription = ` - ${reqs[name] - maxLevelCount} left`;
                }
            } else if (powers.has(name)) {
                // use the length of books from playerPowers and compare to reqs
                const books = Array.from(playerPowers).filter((power) =>
                    power.startsWith("Book"),
                );

                if (books.length >= reqs[name]) completed = true;
                else {
                    additionalDescription = ` - ${reqs[name] - books.length} left`;
                }
            }
        }

        return { completed, additionalDescription };
    };

    const maxLevelCount = useMemo(() => {
        // count how many skills the player has at level 10 (max)
        let maxLevelCount = 0;
        if (activePlayer) {
            if (activePlayer.general?.skills) {
                // iterate over each skill and count how many are at level 10
                Object.values(activePlayer.general.skills).forEach((skill) => {
                    if (skill >= 10) maxLevelCount++;
                });
            }
        }
        return maxLevelCount;
    }, [activePlayer]);


    const playerExperiencePoints = useMemo(() => {
        const experienceRequired: { [key: number]: number } = {
            1: 100,
            2: 380,
            3: 770,
            4: 1300,
            5: 2150,
            6: 3300,
            7: 4800,
            8: 6900,
            9: 10000,
            10: 15000,
        };

        // type SkillName =
        // | "farming"
        // | "fishing"
        // | "foraging"
        // | "mining"
        // | "combat"
        // | "mastery";

        function calculateExperience(skillName: Skill, activePlayer: any): any {
            const currentLevel = activePlayer?.general?.skills?.[skillName] || 0;
            const currentExperience =
                activePlayer?.general?.experience?.[skillName] || 0;
            const nextLevelExperience = experienceRequired[currentLevel + 1] || 0;

            return {
                percentage:
                    currentLevel >= 10
                        ? 100
                        : Math.floor((currentExperience / nextLevelExperience) * 100),
                experiencePointsRemaining: Math.max(
                    nextLevelExperience - currentExperience,
                    0,
                ),
                experiencePointsRequired: nextLevelExperience,
            };
        }

        if (activePlayer?.general?.experience && activePlayer?.general?.skills) {
            return {
                farming: calculateExperience("farming", activePlayer),
                fishing: calculateExperience("fishing", activePlayer),
                foraging: calculateExperience("foraging", activePlayer),
                mining: calculateExperience("mining", activePlayer),
                combat: calculateExperience("combat", activePlayer),
                luck: 0,
            };
        } else {
            return {
                farming: 0,
                fishing: 0,
                foraging: 0,
                mining: 0,
                combat: 0,
                luck: 0,
            };
        }
    }, [activePlayer]);

    const playerPowers = useMemo(() => {
        if (!activePlayer || !activePlayer.powers?.collection)
            return new Set<string>();

        const playerPowers = activePlayer.powers.collection;

        return new Set<string>(playerPowers);
    }, [activePlayer]);

    const masteryExp = useMemo(() => {
        if (!activePlayer || !activePlayer.powers?.MasteryExp)
            return {
                level: 0,
                percentage: 0,
                experiencePointsRemaining: 0,
                experiencePointsRequired: 0,
            };

        const playerPowers = activePlayer.powers.MasteryExp;

        const masteryLevel = getCurrentMasteryLevel(playerPowers);
        const nextLevelExperience = getMasteryExpNeededForLevel(masteryLevel + 1);
        const currentExperience =
            playerPowers - getMasteryExpNeededForLevel(masteryLevel);

        if (activePlayer.powers.MasteryExp) {
            return {
                level: masteryLevel,
                percentage:
                    masteryLevel >= 5
                        ? 100
                        : (currentExperience / nextLevelExperience) * 100,
                experiencePointsRemaining: Math.max(
                    nextLevelExperience - currentExperience,
                    0,
                ),
                experiencePointsRequired: nextLevelExperience,
            };
        } else {
            return {
                level: 0,
                percentage: 0,
                experiencePointsRemaining: 0,
                experiencePointsRequired: 0,
            };
        }
    }, [activePlayer]);

    return {
        activePlayer,
        getAchievementProgress,
        playerExperiencePoints,
        masteryExp,
        playerPowers,
        maxLevelCount,
      };
}