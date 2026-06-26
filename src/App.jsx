import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import Today from './pages/Today';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import HabitSetup from './components/habit/HabitSetup';
import HabitSwitcher from './components/habit/HabitSwitcher';
import CompletionScreen from './components/completion/CompletionScreen';
import { useHabitStore } from './store/habitStore';
import { useSettingsStore } from './store/settingsStore';

export default function App() {
  const { habits } = useHabitStore();
  const { settings, initTheme } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState('today');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [editHabitId, setEditHabitId] = useState(null);
  const [celebrateHabit, setCelebrateHabit] = useState(null);

  // Initialize theme on load
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];

  // Trigger celebration screen if habit is completed and not yet acknowledged
  useEffect(() => {
    if (activeHabit && activeHabit.completedDays.length >= activeHabit.targetDays && !activeHabit.isArchived) {
      setCelebrateHabit(activeHabit);
    }
  }, [activeHabit]);

  const handleAddNew = () => {
    setEditHabitId(null);
    setIsSetupOpen(true);
  };

  const handleEditSetup = (id) => {
    setEditHabitId(id);
    setIsSetupOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'today':
        return <Today onOpenSetup={handleAddNew} />;
      case 'calendar':
        return <Calendar onOpenSetup={handleAddNew} />;
      case 'progress':
        return <Progress onOpenSetup={handleAddNew} />;
      case 'settings':
        return (
          <Settings 
            onOpenSetup={handleAddNew} 
            onEditSetup={handleEditSetup} 
          />
        );
      default:
        return <Today onOpenSetup={handleAddNew} />;
    }
  };

  return (
    <>
      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        headerContent={
          <HabitSwitcher onAddNew={handleAddNew} />
        }
      >
        {renderActiveTab()}
      </AppShell>

      {/* Setup Habit Modal */}
      {isSetupOpen && (
        <HabitSetup 
          onClose={() => setIsSetupOpen(false)} 
          editHabitId={editHabitId} 
        />
      )}

      {/* Fullscreen Celebration Screen */}
      {celebrateHabit && (
        <CompletionScreen
          habit={celebrateHabit}
          onClose={() => setCelebrateHabit(null)}
        />
      )}
    </>
  );
}
