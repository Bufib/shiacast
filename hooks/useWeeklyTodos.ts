import { useEffect } from "react";
import { UseWeeklyTodosResult } from "@/constants/Types";
import { useLanguage } from "../contexts/LanguageContext";
import useWeeklyTodosStore from "../stores/weeklyTodosStore";

export function useWeeklyTodos(): UseWeeklyTodosResult {
  const { lang } = useLanguage();
  const {
    todosByDay,
    loading,
    _initialized,
    initialize,
    toggleTodo,
    addTodo,
    deleteTodo,
    undoAllForDay,
  } = useWeeklyTodosStore();

  useEffect(() => {
    if (!_initialized) {
      initialize(lang);
    }
  }, []);

  return { todosByDay, loading, toggleTodo, addTodo, deleteTodo, undoAllForDay };
}
