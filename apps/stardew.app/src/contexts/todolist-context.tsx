import { createContext, useContext, useEffect, useState } from "react";

export interface TodoItem {
  id: string;
  name: string;
  required: number;
  crafted: number;
}

interface TodoContextType {
  items: TodoItem[];
  addItem: (item: TodoItem) => void;
  updateCrafted: (id: string, crafted: number) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

const ToDoListContext = createContext<TodoContextType>({
  items: [],
  addItem: () => {},
  updateCrafted: () => {},
  removeItem: () => {},
  clearAll: () => {},
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
      if (prev.some((i) => i.id === item.id)) return prev; // prevent duplicates
      return [...prev, item];
    });
  };

  const updateCrafted = (id: string, crafted: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, crafted } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <ToDoListContext.Provider
      value={{ items, addItem, updateCrafted, removeItem, clearAll }}
    >
      {children}
    </ToDoListContext.Provider>
  );
};

export const useTodo = () => useContext(ToDoListContext);
