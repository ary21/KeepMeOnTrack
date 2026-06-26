import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function HabitSwitcher({ onAddNew }) {
  const { habits } = useHabitStore();
  const { settings, updateSettings } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];

  // Auto-sync activeHabitId if missing but habits exist
  React.useEffect(() => {
    if (habits.length > 0 && !settings.activeHabitId) {
      updateSettings({ activeHabitId: habits[0].id });
    }
  }, [habits, settings.activeHabitId, updateSettings]);

  if (habits.length === 0) {
    return (
      <button
        onClick={onAddNew}
        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
      >
        <Plus size={14} />
        Target Baru
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm text-left max-w-[200px]"
      >
        <span className="text-base">{activeHabit?.emoji || '🎯'}</span>
        <span className="truncate flex-1 text-slate-700 dark:text-slate-200">
          {activeHabit?.name || 'Pilih Target'}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Target Aktif
            </div>
            
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => {
                  updateSettings({ activeHabitId: habit.id });
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  settings.activeHabitId === habit.id 
                    ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="text-base">{habit.emoji}</span>
                <span className="truncate flex-1">{habit.name}</span>
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: habit.accentColor || '#22c55e' }}
                />
              </button>
            ))}

            <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />
            
            <button
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-semibold"
            >
              <Plus size={16} />
              Buat Target Baru
            </button>
          </div>
        </>
      )}
    </div>
  );
}
