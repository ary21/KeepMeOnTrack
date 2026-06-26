const KEYS = {
  HABITS: 'keepmeontrack_habits',
  SETTINGS: 'keepmeontrack_settings',
};

export function getLocalHabits() {
  try {
    const data = localStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading habits from localStorage', e);
    return [];
  }
}

export function saveLocalHabits(habits) {
  try {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits to localStorage', e);
  }
}

export function getLocalSettings() {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    const defaults = {
      theme: 'dark',
      soundEnabled: true,
      activeHabitId: null,
      onboardingDone: false,
      lastExportDate: null,
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
    return {
      theme: 'dark',
      soundEnabled: true,
      activeHabitId: null,
      onboardingDone: false,
      lastExportDate: null,
    };
  }
}

export function saveLocalSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}
