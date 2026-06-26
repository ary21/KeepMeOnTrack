import React, { useRef } from 'react';
import { 
  Download, Upload, RotateCcw, Trash2, Edit2, 
  Volume2, VolumeX, Sun, Moon, Smartphone 
} from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { exportDataToJSON, parseImportedJSON } from '../utils/exportUtils';

export default function Settings({ onEditSetup }) {
  const { habits, deleteHabit, updateHabit, importHabits } = useHabitStore();
  const { settings, updateSettings } = useSettingsStore();
  const fileInputRef = useRef(null);

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];

  const handleExport = () => {
    exportDataToJSON(habits, settings);
    updateSettings({ lastExportDate: new Date().toISOString().split('T')[0] });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { habits: importedHabits, settings: importedSettings } = parseImportedJSON(event.target.result);
        importHabits(importedHabits);
        
        // Merge settings
        updateSettings(importedSettings);
        alert('Data berhasil di-import!');
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!activeHabit) return;
    const confirmReset = window.confirm(
      `Apakah Anda yakin ingin meriset kemajuan untuk target "${activeHabit.name}"? Ini akan menghapus semua riwayat check-in.`
    );
    if (confirmReset) {
      updateHabit(activeHabit.id, { completedDays: [], completedAt: null, isArchived: false });
      alert('Progres target telah diriset.');
    }
  };

  const handleDelete = () => {
    if (!activeHabit) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus target "${activeHabit.name}"? Tindakan ini permanen.`
    );
    if (confirmDelete) {
      deleteHabit(activeHabit.id);
      // Auto-select another habit if available
      const remaining = habits.filter(h => h.id !== activeHabit.id);
      updateSettings({ activeHabitId: remaining.length > 0 ? remaining[0].id : null });
      alert('Target telah dihapus.');
    }
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleThemeChange = (newTheme) => {
    updateSettings({ theme: newTheme });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Pengaturan</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola target, data, dan preferensi aplikasi
        </p>
      </div>

      {/* Target Management (Active Habit details) */}
      {activeHabit && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeHabit.emoji}</span>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white leading-tight">
                  {activeHabit.name}
                </h3>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Target: {activeHabit.targetDays} hari • Mulai: {activeHabit.startDate}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEditSetup(activeHabit.id)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RotateCcw size={14} />
              Riset Progres
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
            >
              <Trash2 size={14} />
              Hapus Target
            </button>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Aplikasi & Tema</h3>

        {/* Theme Settings */}
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-semibold text-slate-650 dark:text-slate-350">Tema</span>
          <div className="flex bg-slate-55 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/50 dark:border-slate-800/80">
            {[
              { id: 'light', icon: Sun, label: 'Terang' },
              { id: 'dark', icon: Moon, label: 'Gelap' },
              { id: 'system', icon: Smartphone, label: 'Sistem' },
            ].map((themeOpt) => {
              const ThemeIcon = themeOpt.icon;
              const isSelected = settings.theme === themeOpt.id;
              return (
                <button
                  key={themeOpt.id}
                  onClick={() => handleThemeChange(themeOpt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-450 shadow-sm'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                  }`}
                >
                  <ThemeIcon size={14} />
                  <span>{themeOpt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Settings */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div>
            <span className="text-sm font-semibold text-slate-650 dark:text-slate-350">Efek Suara</span>
            <div className="text-[10px] text-slate-400 mt-0.5">Suara lonceng saat check-in sukses</div>
          </div>
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border transition-all ${
              settings.soundEnabled
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-250 dark:border-slate-800 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Manajemen Data</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Semua data disimpan secara lokal di browser Anda. Ekspor cadangan secara berkala agar aman.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download size={15} />
            Ekspor Data (.json)
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-450 transition-colors"
          >
            <Upload size={15} />
            Impor Data (.json)
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>

        {settings.lastExportDate && (
          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
            Ekspor terakhir pada: {settings.lastExportDate}
          </div>
        )}
      </div>

    </div>
  );
}
