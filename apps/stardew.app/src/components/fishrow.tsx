import Image from "next/image";

import { 
	getFishData,
 } from "@/lib/item-lookup";
import { TodoItem, useTodo } from "@/contexts/todolist-context";


export const FishRow = (todoItem: TodoItem) => {
	const { updateRequired } = useTodo();
	if (todoItem.itemType !== "Fish") return null; // Ensure correct itemType

	const data = getFishData(todoItem.itemID);
	if (!data) return null;

	const {
		fish,
		name,
		description,
		iconURL,
	} = data;

	return (
		<div className="rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm mb-4">
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
						border: '1px solid #ccc',
						borderRadius: '8px',
						padding: '5px 10px',
						fontSize: '14px',
						width: '60px',
						textAlign: 'left',
					}}
				/>
			</div>
		</div>
	);
};
