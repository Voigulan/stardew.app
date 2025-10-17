import { createContext, useContext, useEffect, useState } from "react";
import type { CraftingRecipe, Recipe } from "@/types/recipe";
import { Type } from "typescript";
import type { FishType } from "@/types/items";

export type ItemType = FishType | Recipe;
export interface TodoItem {
    itemID: string;
    itemType: string;
    required: number;
    crafted: number;
}

interface TodoContextType {
    items: TodoItem[];
    addItem: (item: TodoItem) => void;
    updateCrafted: (itemID: string, crafted: number) => void;
    updateRequired: (itemID: string, itemType: string, required: number) => void;
    removeItem: (itemID: string, itemType: string) => void;
    clearAll: () => void;
}

const ToDoListContext = createContext<TodoContextType>({
    items: [],
    addItem: () => { },
    updateCrafted: () => { },
    updateRequired: () => { },
    removeItem: () => { },
    clearAll: () => { },
});

export const ToDoListProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<TodoItem[]>([]);

    // 🔹 Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem("todo_list");
            if (stored) setItems(JSON.parse(stored));
        }
    }, []);

    // 🔹 Save whenever items change
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem("todo_list", JSON.stringify(items));
        }
    }, [items]);

    const addItem = (item: TodoItem) => {
        setItems((prev) => {
            if (prev.some((i) => i.itemID === item.itemID && i.itemType === item.itemType)) return prev; // prevent duplicates
            return [...prev, item];
        });
    };

    const updateCrafted = (itemID: string, crafted: number) => {
        setItems((prev) =>
            prev.map((i) => (i.itemID === itemID ? { ...i, crafted } : i))
        );
    };

    const updateRequired = (itemID: string, itemType: string, required: number) => {
        if (required === 0) {
            removeItem(itemID, itemType);
        } else {
            setItems((prev) =>
                prev.map((i) =>
                    i.itemID === itemID && i.itemType === itemType ? { ...i, required } : i
                )
            );
        }
    };

    const removeItem = (itemID: string, itemType: string) => {
        setItems((prev) => prev.filter((i) => i.itemID !== itemID || i.itemType !== itemType));
    };

    const clearAll = () => {
        setItems([]);
    };

    return (
        <ToDoListContext.Provider
            value={{ items, addItem, updateCrafted, updateRequired, removeItem, clearAll }}
        >
            {children}
        </ToDoListContext.Provider>
    );
};

export const useTodo = () => useContext(ToDoListContext);
