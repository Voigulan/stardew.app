import Image from "next/image";
import { useContext, useMemo } from "react";

import { 
	getFishData,
	useItemLookup,
 } from "@/lib/item-lookup";
import { PlayersContext } from "@/contexts/players-context";
import { TodoItem, useTodo } from "@/contexts/todolist-context";


export const FishRow = (todoItem: TodoItem) => {
	const { activePlayer } = useContext(PlayersContext);
	const { updateRequired } = useTodo();
	const { timeTilFishSeason } = useItemLookup();

	if (todoItem.itemType !== "Fish") return null; // Ensure correct itemType

	const data = getFishData(todoItem.itemID);
	if (!data) return null;

	const {
		fish,
		name,
		description,
		iconURL,
	} = data;

	const bubbleColors = useMemo(() => {
		if (!activePlayer) return "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950";
		const timeUntilSeason = timeTilFishSeason(fish);
		console.log("timeUntilSeason: "+timeUntilSeason);
		switch (timeUntilSeason) {
			case 0:
				return "border-green-900 bg-green-500/20";		// go fishing now
			case 1:
				return "border-yellow-900 bg-yellow-500/20";	// wait one Season
			default:
				return "border-grey bg-grey-500/20";			// far, far future
		}
	}, [activePlayer, fish, timeTilFishSeason]);

	return (
		<div
			className={`rounded-lg ${bubbleColors} border p-4 shadow-sm mb-4`}
		>
			<div className="flex items-center gap-4">
				<Image
					src={iconURL}
					alt={name}
					width={32}
					height={32}
					className="rounded-sm"
				/>

				{/* Controls */}
				<input
					type="number"
					value={todoItem.required}
					onChange={(e) => updateRequired(todoItem.itemID, todoItem.itemType, Number(e.target.value))}
					style={{
						border: "1px solid #ccc",
						borderRadius: "8px",
						padding: "5px 10px",
						fontSize: "14px",
						width: "60px",
						textAlign: "left",
					}}
				/>
			</div>
		</div>
	);
};
