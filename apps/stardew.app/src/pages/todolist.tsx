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
import { useTodo } from "@/contexts/todolist-context";

export default function TodoPage() {
    const { items, updateCrafted, removeItem, clearAll } = useTodo();

    if (items.length === 0)
        return (
            <div className="p-4 text-gray-400">
                No crafting tasks yet — add some from the crafting page!
            </div>
        );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Crafting To-Do List</h1>
                <button
                    onClick={clearAll}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                    Clear All
                </button>
            </div>

            <ul className="space-y-3">
                {items.map((item) => (
                    <li
                        key={item.itemID}
                        className="bg-base-200 p-3 rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <div className="font-semibold">{item.itemID}</div>
                            <div className="text-sm text-gray-500">
                                Required: {item.required} / Crafted: {item.crafted}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                value={item.crafted}
                                onChange={(e) =>
                                    updateCrafted(item.itemID, Number(e.target.value))
                                }
                                className="w-16 border border-gray-300 rounded text-center"
                            />
                            <button
                                onClick={() => removeItem(item.itemID)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
