import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultWeeklyTodos } from "../hooks/defaultWeeklyTodos";
import { WeeklyTodosType, TodoItemType } from "../src/constants/Types";

const STORAGE_KEY = "prayer_app_weekly_todos_";

type WeeklyTodosStore = {
  todosByDay: WeeklyTodosType;
  loading: boolean;
  _initialized: boolean;

  initialize: (lang: string) => Promise<void>;
  toggleTodo: (day: number, id: number) => void;
  addTodo: (day: number, text: string, internalUrls?: string[]) => void;
  deleteTodo: (day: number, id: number) => void;
  undoAllForDay: (day: number) => void;
};

const useWeeklyTodosStore = create<WeeklyTodosStore>()((set, get) => ({
  todosByDay: {},
  loading: true,
  _initialized: false,

  initialize: async (lang: string) => {
    if (get()._initialized) return;
    set({ _initialized: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ todosByDay: JSON.parse(raw), loading: false });
      } else {
        set({
          todosByDay: defaultWeeklyTodos[lang] ?? defaultWeeklyTodos.de,
          loading: false,
        });
      }
    } catch {
      set({
        todosByDay: defaultWeeklyTodos[lang] ?? defaultWeeklyTodos.de,
        loading: false,
      });
    }
  },

  toggleTodo: (day, id) => {
    set((state) => {
      const todosByDay = {
        ...state.todosByDay,
        [day]:
          state.todosByDay[day]?.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ) ?? [],
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay));
      return { todosByDay };
    });
  },

  addTodo: (day, text, internalUrls = []) => {
    const trimmed = text.trim();
    const cleanLinks = internalUrls.filter(
      (u) => typeof u === "string" && u.trim().length > 0
    );
    if (!trimmed && cleanLinks.length === 0) return;

    const newTodo: TodoItemType = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: trimmed,
      completed: false,
      ...(cleanLinks.length ? { internal_urls: cleanLinks } : {}),
    };

    set((state) => {
      const todosByDay = {
        ...state.todosByDay,
        [day]: [...(state.todosByDay[day] || []), newTodo],
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay));
      return { todosByDay };
    });
  },

  deleteTodo: (day, id) => {
    set((state) => {
      const todosByDay = {
        ...state.todosByDay,
        [day]: (state.todosByDay[day] || []).filter((todo) => todo.id !== id),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay));
      return { todosByDay };
    });
  },

  undoAllForDay: (day) => {
    set((state) => {
      const todosByDay = {
        ...state.todosByDay,
        [day]: (state.todosByDay[day] || []).map((todo) => ({
          ...todo,
          completed: false,
        })),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay));
      return { todosByDay };
    });
  },
}));

export default useWeeklyTodosStore;
