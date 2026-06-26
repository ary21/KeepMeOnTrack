import { create } from 'zustand';
import { getLocalSettings, saveLocalSettings } from '../utils/storageUtils';

export const useSettingsStore = create((set, get) => ({
  settings: getLocalSettings(),
  
  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    saveLocalSettings(updated);
    
    // Apply theme
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  },
  
  initTheme: () => {
    applyTheme(get().settings.theme);
  }
}));

function applyTheme(theme) {
  const root = window.document.documentElement;
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    root.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body.classList.remove('dark');
  }
}
