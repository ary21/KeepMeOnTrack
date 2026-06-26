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
      
      const isCompleted = newCompleted.length >= h.targetDays;
      
      return {
        ...h,
        completedDays: newCompleted,
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
