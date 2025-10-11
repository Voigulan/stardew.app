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
import { getRecipeData } from "@/lib/item-lookup";

function aggregateIngredients(items: TodoItem[]) {
	const totals: Record<string, { id: string; name: string; iconURL: string; total: number }> = {};

	for (const item of items) {
		const data = getRecipeData(item.itemID);
		if (!data) continue;

		for (const ing of data.ingredients) {
			const requiredTotal = ing.amount * item.required;
			if (!totals[ing.id]) {
				totals[ing.id] = {
					id: ing.id,
					name: ing.name,
					iconURL: ing.iconURL,
					total: requiredTotal,
				};
			} else {
				totals[ing.id].total += requiredTotal;
			}
		}
	}

	return Object.values(totals);
}

export default function TodoPage() {
	const { items } = useTodo();

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Crafting To-Do List</h1>

			{items.length === 0 && (
				<p className="text-neutral-500">No crafting tasks yet.</p>
			)}

            {/* ToDo Items List */}
			{items.map((item) => (
				<TodoRow
					key={item.itemID}
					itemID={item.itemID}
					required={item.required}
					crafted={item.crafted}
				/>
			))}
		</div>
	);
}
