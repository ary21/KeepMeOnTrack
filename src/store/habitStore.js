import { create } from 'zustand';
import { getLocalHabits, saveLocalHabits } from '../utils/storageUtils';

export const useHabitStore = create((set, get) => ({
  habits: getLocalHabits(),
  
  addHabit: (habit) => {
    const updated = [...get().habits, habit];
    set({ habits: updated });
    saveLocalHabits(updated);
  },
  
  updateHabit: (id, updatedFields) => {
    const updated = get().habits.map((h) => 
      h.id === id ? { ...h, ...updatedFields } : h
    );
    set({ habits: updated });
    saveLocalHabits(updated);
  },
  
  deleteHabit: (id) => {
    const updated = get().habits.filter((h) => h.id !== id);
    set({ habits: updated });
    saveLocalHabits(updated);
  },
  
  toggleDay: (id, dateStr) => {
    const updated = get().habits.map((h) => {
      if (h.id !== id) return h;
      
      const exists = h.completedDays.includes(dateStr);
      let newCompleted = [];
      if (exists) {
        newCompleted = h.completedDays.filter((d) => d !== dateStr);
      } else {
        newCompleted = [...h.completedDays, dateStr];
      }
      
      // If there are action items, keep them in sync
      const actionItems = h.actionItems || [];
      const dailyCompletions = h.dailyCompletions || {};
      if (actionItems.length > 0) {
        if (exists) {
          // If uncompleting the day, clear all action completions for that day
          dailyCompletions[dateStr] = [];
        } else {
          // If completing the day, mark all action completions for that day
          dailyCompletions[dateStr] = actionItems.map(item => item.id);
        }
      }

      const isCompleted = newCompleted.length >= h.targetDays;
      
      return {
        ...h,
        completedDays: newCompleted,
        dailyCompletions,
        isArchived: isCompleted ? true : h.isArchived,
        completedAt: isCompleted ? new Date().toISOString() : h.completedAt,
      };
    });
    
    set({ habits: updated });
    saveLocalHabits(updated);
  },

  toggleActionItem: (id, dateStr, itemId) => {
    const updated = get().habits.map((h) => {
      if (h.id !== id) return h;

      const actionItems = h.actionItems || [];
      const dailyCompletions = { ...h.dailyCompletions };
      const currentCompletions = dailyCompletions[dateStr] || [];

      let nextCompletions = [];
      if (currentCompletions.includes(itemId)) {
        nextCompletions = currentCompletions.filter(id => id !== itemId);
      } else {
        nextCompletions = [...currentCompletions, itemId];
      }

      dailyCompletions[dateStr] = nextCompletions;

      // A day is completed if all action items are checked
      const allCompleted = actionItems.length > 0 && nextCompletions.length === actionItems.length;
      const isAlreadyCompleted = h.completedDays.includes(dateStr);

      let newCompletedDays = [...h.completedDays];
      if (allCompleted && !isAlreadyCompleted) {
        newCompletedDays.push(dateStr);
      } else if (!allCompleted && isAlreadyCompleted) {
        newCompletedDays = newCompletedDays.filter(d => d !== dateStr);
      }

      const isCompleted = newCompletedDays.length >= h.targetDays;

      return {
        ...h,
        completedDays: newCompletedDays,
        dailyCompletions,
        isArchived: isCompleted ? true : h.isArchived,
        completedAt: isCompleted ? new Date().toISOString() : h.completedAt,
      };
    });

    set({ habits: updated });
    saveLocalHabits(updated);
  },
  
  importHabits: (importedHabits) => {
    set({ habits: importedHabits });
    saveLocalHabits(importedHabits);
  }
}));
